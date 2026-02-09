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

const API_BASE_URL = 'http://localhost:8000'; // Adjust if needed

const Dashboard = () => {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

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

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: getId(),
                type,
                position,
                data: {
                    label: `${type} node`,
                    status: 'idle',
                    result: null,
                    onChange: (val) => updateNodeData(newNode.id, { query: val }),
                    onUrlChange: (val) => updateNodeData(newNode.id, { url: val }),
                    onContextChange: (val) => updateNodeData(newNode.id, { context: val }),
                    onQuestionChange: (val) => updateNodeData(newNode.id, { question: val }),
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
            let result = null;
            let payload = {};

            // Merge inputs from previous nodes into current node's data
            // Simple logic: if input has 'result' (text), map to 'context' or 'query'
            if (inputs.context) {
                // If it's a QA node, we append to context usually, or replace if empty
                // But specifically for QA node, inputs.context is useful
                // For Search node, maybe we want to search the context? Unlikely.
            }

            // Construct payload based on node type
            switch (node.type) {
                case 'search':
                    payload = { queries: [node.data.query || inputs.query], include_answer: true };
                    const searchRes = await fetch(`${API_BASE_URL}/web_search/search`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!searchRes.ok) throw new Error(await searchRes.text());
                    const searchData = await searchRes.json();
                    result = searchData; // Full response
                    break;

                case 'extract':
                    payload = { urls: [node.data.url || inputs.url] }; // Only 1 URL for now from input
                    const extractRes = await fetch(`${API_BASE_URL}/extract/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!extractRes.ok) throw new Error(await extractRes.text());
                    const extractData = await extractRes.json();
                    result = extractData;
                    break;

                case 'crawl':
                    payload = { url: node.data.url || inputs.url };
                    const crawlRes = await fetch(`${API_BASE_URL}/crawl/`, { // Adjust route if needed
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!crawlRes.ok) throw new Error(await crawlRes.text());
                    const crawlData = await crawlRes.json();
                    result = crawlData;
                    break;

                case 'map':
                    payload = { url: node.data.url || inputs.url };
                    const mapRes = await fetch(`${API_BASE_URL}/map/`, { // Adjust route if needed
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!mapRes.ok) throw new Error(await mapRes.text());
                    const mapData = await mapRes.json();
                    result = mapData;
                    break;

                case 'qa':
                    // Mock QA or use a real endpoint if available.
                    // Since we don't have a dedicated QA endpoint in the original spec, 
                    // we will simulate it or use what's available. 
                    // Wait, /web_search/search returns an answer.
                    // BUT, if we want to "ask questions on extracted info", we need RAG.
                    // For now, I'll simulate a QA response or use a simple logic.
                    // If no explicit QA endpoint, I will just display the input + question.
                    // OR, I can use the `TavilyService.search` with the question as query?
                    // "Using search tool questions can be asked" -> this implies using Search.

                    // Let's assume for now we use the Search API with the question.
                    // But if we have context (extracted text), we should send it.
                    // Tavily's search context feature?
                    // For now, I'll just run a Search with the question.
                    // IF context is present, I'll prepend it to the query (might be too long).

                    // Better approach: Just use the Search API for the question.
                    const qPayload = { queries: [node.data.question], include_answer: true };
                    const qaRes = await fetch(`${API_BASE_URL}/web_search/search`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(qPayload)
                    });
                    if (!qaRes.ok) throw new Error(await qaRes.text());
                    const qaData = await qaRes.json();

                    // Isolate the answer
                    const answer = qaData.results[0]?.content || "No answer found.";
                    // If we have an 'answer' field in response (SearchResponse has it?)
                    // SearchResponse has 'summary' (SearchSummary) and 'results'.
                    // The single result might have content.
                    // Tavily response usually has an 'answer' field if include_answer is true.
                    // checking search.py: SearchResponse doesn't seem to have a top-level 'answer' field?
                    // SearchResponse has `results`, `errors`, `summary`.
                    // The `SingleSearchResult` has `content`.
                    // Wait, `tavily_service.py` `_format_response` returns `answer`.
                    // But `SearchResponse` model in `search.py`... let me check it quickly or just dump the whole JSON.
                    result = qaData;
                    break;

                default:
                    result = "Unknown node type";
            }

            updateNodeData(node.id, { status: 'completed', result: result });
            return result;

        } catch (error) {
            console.error("Node execution error:", error);
            updateNodeData(node.id, { status: 'error', result: error.message });
            return null; // Stop flow on error?
        }
    };

    const executeFlow = async () => {
        setIsRunning(true);

        // 1. Sort nodes (topological sort or just find roots)
        // For simplicity: Find nodes with no incoming edges (roots)
        const roots = nodes.filter(node => getIncomers(node, nodes, edges).length === 0);

        // We need a way to track execution.
        // A simple BFS/Queue approach.
        const queue = [...roots];
        const visited = new Set();
        const nodeResults = new Map(); // Store results by node ID

        while (queue.length > 0) {
            const currentNode = queue.shift();
            if (visited.has(currentNode.id)) continue;

            // Check if all parents are visited (dependencies met)
            const parents = getIncomers(currentNode, nodes, edges);
            const allParentsVisited = parents.every(p => visited.has(p.id));

            if (!allParentsVisited) {
                // Determine if we should wait.
                // If this node has ANY parent not yet visited, we skip it for now.
                // But we need to make sure it gets added back?
                // Actually, standard topo sort logic:
                // 1. Calculate indegree. 
                // 2. Add 0 indegree to queue.
                // 3. Process, decrement neighbors.
                // But here I'm traversing dynamically.
                continue;
            }

            // Collect inputs from parents (e.g. extracted text)
            let inputs = {};
            for (const parent of parents) {
                const parentResult = nodeResults.get(parent.id);
                if (parentResult) {
                    // Extract useful data from parent result
                    if (parent.type === 'extract') {
                        // ExtractResponse: { results: [...], ... }
                        // Take the content of the first result
                        const text = parentResult.results?.[0]?.raw_content || parentResult.results?.[0]?.content;
                        if (text) inputs.context = text;
                    }

                    if (parent.type === 'search') {
                        // Pass first URL from search result
                        const url = parentResult.results?.[0]?.url;
                        if (url) inputs.url = url;
                    }

                    if (parent.type === 'crawl') {
                        // Pass first found URL (crawl results can be mixed, but usually have 'url')
                        const url = parentResult.results?.[0]?.url; // Adjust based on Crawl response structure
                        if (url) inputs.url = url;
                    }
                }
            }

            // Execute node
            const result = await runNode(currentNode, inputs);
            nodeResults.set(currentNode.id, result);
            visited.add(currentNode.id);

            // Add children to queue
            const children = getOutgoers(currentNode, nodes, edges);
            children.forEach(child => {
                // Only add if not visited and not already in queue (dedup)
                if (!visited.has(child.id) && !queue.find(n => n.id === child.id)) {
                    // Check if all *its* parents are done.
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
        <div className="dndflow" style={{ width: '100%', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="glass-panel" style={{
                marginBottom: '1rem',
                padding: '1rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Drag Tools:</span>
                <div
                    className="dndnode input"
                    onDragStart={(event) => onDragStart(event, 'search')}
                    draggable
                    style={{ cursor: 'grab', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    🔍 Search
                </div>
                <div
                    className="dndnode"
                    onDragStart={(event) => onDragStart(event, 'crawl')}
                    draggable
                    style={{ cursor: 'grab', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    🕷️ Crawl
                </div>
                <div
                    className="dndnode output"
                    onDragStart={(event) => onDragStart(event, 'extract')}
                    draggable
                    style={{ cursor: 'grab', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    📄 Extract
                </div>
                <div
                    className="dndnode output"
                    onDragStart={(event) => onDragStart(event, 'map')}
                    draggable
                    style={{ cursor: 'grab', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    🗺️ Map
                </div>
                <div
                    className="dndnode output"
                    onDragStart={(event) => onDragStart(event, 'qa')}
                    draggable
                    style={{ cursor: 'grab', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    🧠 Ask / QA
                </div>

                <div style={{ flex: 1 }}></div>

                <button
                    onClick={executeFlow}
                    disabled={isRunning}
                    style={{
                        padding: '0.5rem 1.5rem',
                        background: isRunning ? '#4B5563' : '#3B82F6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: isRunning ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        transition: 'background 0.2s'
                    }}
                >
                    {isRunning ? 'Running...' : '▶ Run Flow'}
                </button>
            </div>

            <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ flex: 1, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
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
                    style={{ background: 'rgba(0,0,0,0.2)' }}
                >
                    <Controls style={{ fill: '#fff' }} />
                    <Background color="#aaa" gap={16} />
                </ReactFlow>
            </div>
        </div>
    );
};

export default Dashboard;
