import React, { useState, useCallback, useRef } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    useNodesState,
    useEdgesState,
    getOutgoers,
    getIncomers,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { SearchNode, CrawlNode, ExtractNode, MapNode, QANode } from './Nodes';

const nodeTypes = {
    search: SearchNode,
    crawl: CrawlNode,
    extract: ExtractNode,
    map: MapNode,
    qa: QANode,
};

const initialNodes = [];
const initialEdges = [];

let id = 0;
const getId = () => `dndnode_${id++}`;

const API_BASE_URL = 'http://127.0.0.1:8000';

const Dashboard = () => {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const nodeId = getId();
            const newNode = {
                id: nodeId,
                type,
                position,
                data: {
                    label: `${type} node`,
                    status: 'idle',
                    result: null,
                    onChange: (val) => updateNodeData(nodeId, { query: val }),
                    onUrlChange: (val) => updateNodeData(nodeId, { url: val }),
                    onContextChange: (val) => updateNodeData(nodeId, { context: val }),
                    onQuestionChange: (val) => updateNodeData(nodeId, { question: val }),
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    const updateNodeData = (nodeId, newData) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: { ...node.data, ...newData },
                    };
                }
                return node;
            })
        );
    };

    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const runNode = async (node, inputs = {}) => {
        // Update status to running
        updateNodeData(node.id, { status: 'running', result: null });

        try {
            let payload = {};
            const context = inputs.context;

            // Construct payload based on node type
            switch (node.type) {
                case 'search':
                    let searchQuery = node.data.query || inputs.query;
                    if (context) {
                        searchQuery = `Question: ${searchQuery}\n\nContext for reference:\n${context}\n\nInstructions: Answer the question precisely using the provided context if relevant. If the context doesn't contain the answer, perform a search.`;
                    }
                    payload = { queries: [searchQuery], include_answer: true };
                    const searchRes = await fetch(`${API_BASE_URL}/web_search/search`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!searchRes.ok) throw new Error(await searchRes.text());
                    const searchData = await searchRes.json();

                    // Display answer in UI, return full object for flow
                    const searchAnswer = searchData.answer || (searchData.results?.[0]?.answer) || "Search completed, but no direct answer was generated. Check results below.";
                    updateNodeData(node.id, { status: 'completed', result: searchAnswer });
                    return searchData;

                case 'extract':
                    // Accept multi-URL array from upstream Map node, or fall back to single URL
                    const targetUrls = inputs.urls || (node.data.url ? [node.data.url] : null) || (inputs.url ? [inputs.url] : null);
                    if (!targetUrls || targetUrls.length === 0) throw new Error("No URL provided for extraction.");

                    // Limit to top 5 URLs to avoid overloading the API
                    const limitedUrls = targetUrls.slice(0, node.data.limit || 5);

                    payload = {
                        urls: limitedUrls,
                        query: context || node.data.query || undefined,
                        include_answer: true,
                        extract_depth: 'advanced'
                    };
                    const extractRes = await fetch(`${API_BASE_URL}/extract/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!extractRes.ok) throw new Error(await extractRes.text());
                    const extractData = await extractRes.json();

                    let extractText = "";
                    if (extractData.answer && extractData.answer !== "No AI answer provided") {
                        extractText = extractData.answer;
                    } else if (extractData.results?.[0]?.content) {
                        extractText = extractData.results[0].content;
                    } else if (extractData.results?.[0]?.raw_content) {
                        extractText = extractData.results[0].raw_content.substring(0, 1000) + "...";
                    } else {
                        extractText = "Content extracted, but no readable text was found.";
                    }
                    updateNodeData(node.id, { status: 'completed', result: extractText });
                    return extractData;

                case 'crawl':
                    payload = {
                        url: node.data.url || inputs.url,
                        query: context || node.data.query // Use context as guiding query
                    };
                    const crawlRes = await fetch(`${API_BASE_URL}/crawl/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!crawlRes.ok) throw new Error(await crawlRes.text());
                    const crawlData = await crawlRes.json();

                    const crawlCount = crawlData.results?.length || 0;
                    const crawlSummary = `Crawl complete. Discovered and analyzed ${crawlCount} nested pages/resources from the target URL.`;
                    updateNodeData(node.id, { status: 'completed', result: crawlSummary });
                    return crawlData;

                case 'map':
                    payload = { url: node.data.url || inputs.url };
                    const mapRes = await fetch(`${API_BASE_URL}/map/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!mapRes.ok) throw new Error(await mapRes.text());
                    const mapData = await mapRes.json();

                    const mapCount = mapData.results?.length || 0;
                    // mapData.results is List[str] – plain URL strings
                    const mapSummary = `Map complete. Found ${mapCount} URLs.\n${(mapData.results || []).slice(0, 5).join('\n')}`;
                    updateNodeData(node.id, { status: 'completed', result: mapSummary });
                    return mapData;

                case 'qa':
                    // Enhanced QA Logic
                    let question = node.data.question;
                    const qaContext = node.data.context || context;

                    if (qaContext) {
                        question = `Question: ${question}\n\nContext to analyze:\n${qaContext}\n\nInstructions: Answer the question strictly based on the provided context. If unsure, say you don't know based on the context.`;
                    }

                    const qPayload = { queries: [question], include_answer: true };
                    const qaRes = await fetch(`${API_BASE_URL}/web_search/search`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(qPayload)
                    });
                    if (!qaRes.ok) throw new Error(await qaRes.text());
                    const qaData = await qaRes.json();

                    const qaAnswer = qaData.results?.[0]?.answer || qaData.answer || "No specific answer could be determined from the provided question and context.";
                    updateNodeData(node.id, { status: 'completed', result: qaAnswer });
                    return qaData;

                default:
                    const unknownMsg = "Unknown node type";
                    updateNodeData(node.id, { status: 'completed', result: unknownMsg });
                    return unknownMsg;
            }

        } catch (error) {
            console.error("Node execution error:", error);
            updateNodeData(node.id, { status: 'error', result: error.message });
            return null;
        }
    };

    const handleAutoGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        try {
            const response = await fetch(`${API_BASE_URL}/flow/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            if (!response.ok) throw new Error(await response.text());
            const data = await response.json();

            // Transform generated nodes to include necessary data and handlers
            const newNodes = data.nodes.map(node => ({
                ...node,
                data: {
                    ...node.data,
                    status: 'idle',
                    result: null,
                    onChange: (val) => updateNodeData(node.id, { query: val }),
                    onUrlChange: (val) => updateNodeData(node.id, { url: val }),
                    onContextChange: (val) => updateNodeData(node.id, { context: val }),
                    onQuestionChange: (val) => updateNodeData(node.id, { question: val }),
                }
            }));

            setNodes(newNodes);
            setEdges(data.edges);
            setPrompt('');
        } catch (error) {
            console.error("Flow generation error:", error);
            alert("Failed to generate flow: " + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const executeFlow = async () => {
        setIsRunning(true);

        const roots = nodes.filter(node => getIncomers(node, nodes, edges).length === 0);

        const queue = [...roots];
        const visited = new Set();
        const nodeResults = new Map();

        while (queue.length > 0) {
            const currentNode = queue.shift();
            if (visited.has(currentNode.id)) continue;

            const parents = getIncomers(currentNode, nodes, edges);
            const allParentsVisited = parents.every(p => visited.has(p.id));

            if (!allParentsVisited) {
                continue;
            }
            let inputs = {};
            for (const parent of parents) {
                const parentResult = nodeResults.get(parent.id);
                if (parentResult) {
                    // --- Map node: results is List[str] (plain URL strings) ---
                    if (
                        parentResult.results &&
                        Array.isArray(parentResult.results) &&
                        parentResult.results.length > 0 &&
                        typeof parentResult.results[0] === 'string'
                    ) {
                        // Pass the list of URLs so Extract can fetch multiple at once
                        const urlList = parentResult.results.filter(u => u.startsWith('http'));
                        if (urlList.length > 0) {
                            inputs.urls = urlList; // array passed to extract
                            inputs.url = urlList[0]; // single fallback
                        }
                    } else {
                        // Centralized text extraction logic with full fallback chain
                        const getBestText = (res) => {
                            if (!res) return null;

                            // If there's a top-level AI answer, prioritize it
                            if (res.answer && res.answer !== "No AI answer provided") return res.answer;

                            // Otherwise, aggregate content from all results
                            if (res.results && Array.isArray(res.results)) {
                                const texts = res.results
                                    .map(r => r.answer || r.content || r.raw_content)
                                    .filter(t => t && t !== "No AI answer provided" && !t.includes("Content extracted, but no readable text was found"))
                                    .slice(0, 10);
                                return texts.join("\n\n---\n\n");
                            }
                            return null;
                        };

                        const text = getBestText(parentResult);
                        if (text) inputs.context = (inputs.context ? inputs.context + "\n\n" : "") + text;

                        // Extract single URL if relevant
                        const url = parentResult.url || parentResult.results?.[0]?.url;
                        if (url) inputs.url = url;
                    }
                }
            }

            const result = await runNode(currentNode, inputs);
            nodeResults.set(currentNode.id, result);
            visited.add(currentNode.id);

            const children = getOutgoers(currentNode, nodes, edges);
            children.forEach(child => {
                if (!visited.has(child.id) && !queue.find(n => n.id === child.id)) {
                    const childParents = getIncomers(child, nodes, edges);
                    const ready = childParents.every(p => visited.has(p.id));
                    if (ready) {
                        queue.push(child);
                    }
                }
            });
        }

        setIsRunning(false);
    };

    return (
        <div className="dndflow" style={{ width: '100%', height: '80vh', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Tools Section */}
            <div className="glass-panel" style={{
                padding: '1.5rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                flexWrap: 'wrap',
                background: 'linear-gradient(135deg, rgba(44, 36, 30, 0.8) 0%, rgba(50, 42, 35, 0.8) 100%)',
                border: '2px solid rgba(212, 163, 115, 0.3)',
                backdropFilter: 'blur(16px)'
            }}>
                {/* Tools Label */}
                <span style={{ color: '#D4A373', fontSize: '0.95rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Drag Tools:</span>

                {/* Drag Tool Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div
                        className="dndnode input"
                        onDragStart={(event) => onDragStart(event, 'search')}
                        draggable
                        style={{ cursor: 'grab', padding: '0.6rem 1.2rem', background: 'rgba(100, 150, 255, 0.15)', borderRadius: '8px', border: '1.5px solid rgba(100, 150, 255, 0.3)', hover: { background: 'rgba(100, 150, 255, 0.25)' }, transition: 'all 0.2s', fontSize: '0.9rem', fontWeight: '600', color: '#60A5FA' }}
                    >
                        🔍 Search
                    </div>
                    <div
                        className="dndnode"
                        onDragStart={(event) => onDragStart(event, 'crawl')}
                        draggable
                        style={{ cursor: 'grab', padding: '0.6rem 1.2rem', background: 'rgba(100, 150, 255, 0.15)', borderRadius: '8px', border: '1.5px solid rgba(100, 150, 255, 0.3)', transition: 'all 0.2s', fontSize: '0.9rem', fontWeight: '600', color: '#60A5FA' }}
                    >
                        🕷️ Crawl
                    </div>
                    <div
                        className="dndnode output"
                        onDragStart={(event) => onDragStart(event, 'extract')}
                        draggable
                        style={{ cursor: 'grab', padding: '0.6rem 1.2rem', background: 'rgba(100, 150, 255, 0.15)', borderRadius: '8px', border: '1.5px solid rgba(100, 150, 255, 0.3)', transition: 'all 0.2s', fontSize: '0.9rem', fontWeight: '600', color: '#60A5FA' }}
                    >
                        📄 Extract
                    </div>
                    <div
                        className="dndnode output"
                        onDragStart={(event) => onDragStart(event, 'map')}
                        draggable
                        style={{ cursor: 'grab', padding: '0.6rem 1.2rem', background: 'rgba(100, 150, 255, 0.15)', borderRadius: '8px', border: '1.5px solid rgba(100, 150, 255, 0.3)', transition: 'all 0.2s', fontSize: '0.9rem', fontWeight: '600', color: '#60A5FA' }}
                    >
                        🗺️ Map
                    </div>
                    <div
                        className="dndnode output"
                        onDragStart={(event) => onDragStart(event, 'qa')}
                        draggable
                        style={{ cursor: 'grab', padding: '0.6rem 1.2rem', background: 'rgba(100, 150, 255, 0.15)', borderRadius: '8px', border: '1.5px solid rgba(100, 150, 255, 0.3)', transition: 'all 0.2s', fontSize: '0.9rem', fontWeight: '600', color: '#60A5FA' }}
                    >
                        🧠 Ask / QA
                    </div>
                </div>

                {/* Auto-Generate and Run Buttons */}
                <div style={{ flex: 1, display: 'flex', gap: '0.75rem', alignItems: 'center', minWidth: '350px' }}>
                    <input
                        type="text"
                        placeholder="Describe your task... (e.g., Find AI news and extract content)"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '0.7rem 1.2rem',
                            background: 'rgba(0, 0, 0, 0.2)',
                            border: '1.5px solid rgba(212, 163, 115, 0.3)',
                            borderRadius: '8px',
                            color: '#fff',
                            outline: 'none',
                            fontSize: '0.9rem',
                            fontFamily: 'Outfit, sans-serif',
                            transition: 'all 0.3s'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'rgba(212, 163, 115, 0.6)';
                            e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(212, 163, 115, 0.3)';
                            e.target.style.background = 'rgba(0, 0, 0, 0.2)';
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleAutoGenerate()}
                    />
                    <button
                        onClick={handleAutoGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        style={{
                            padding: '0.7rem 1.5rem',
                            background: isGenerating ? '#4B5563' : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: (isGenerating || !prompt.trim()) ? 'not-allowed' : 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            if (!isGenerating && prompt.trim()) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(168, 85, 247, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.3)';
                        }}
                    >
                        {isGenerating ? 'Generating...' : '✨ Auto-Flow'}
                    </button>
                </div>

                {/* Run Button */}
                <button
                    onClick={executeFlow}
                    disabled={isRunning}
                    style={{
                        padding: '0.7rem 1.8rem',
                        background: isRunning ? '#4B5563' : 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isRunning ? 'not-allowed' : 'pointer',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                        if (!isRunning) {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}
                >
                    {isRunning ? '⏳ Running...' : '▶ Run Flow'}
                </button>
            </div>

            {/* ReactFlow Canvas */}
            <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ flex: 1, border: '2px solid rgba(212, 163, 115, 0.3)', borderRadius: '16px', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(18, 16, 14, 0.9) 0%, rgba(30, 25, 20, 0.9) 100%)' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    fitView
                    style={{ background: 'transparent' }}
                >
                    <Controls style={{ fill: '#D4A373' }} />
                    <Background color="rgba(212, 163, 115, 0.1)" gap={20} />
                </ReactFlow>
            </div>
        </div>
    );
};

export default Dashboard;
