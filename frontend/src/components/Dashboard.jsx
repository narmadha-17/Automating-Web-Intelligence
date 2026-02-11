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
            if (inputs.context) {
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

                    // Extract answer from the first result
                    result = searchData.results?.[0]?.answer || "Search completed, but no answer was generated.";
                    break;

                case 'extract':
                    payload = { urls: [node.data.url || inputs.url] };
                    const extractRes = await fetch(`${API_BASE_URL}/extract/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!extractRes.ok) throw new Error(await extractRes.text());
                    const extractData = await extractRes.json();

                    // Prefer extraction answer, otherwise summarize content
                    if (extractData.answer) {
                        result = extractData.answer;
                    } else if (extractData.results?.[0]?.content) {
                        result = extractData.results[0].content;
                    } else {
                        result = "Content extracted, but no readable text was found.";
                    }
                    break;

                case 'crawl':
                    payload = { url: node.data.url || inputs.url };
                    const crawlRes = await fetch(`${API_BASE_URL}/crawl/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!crawlRes.ok) throw new Error(await crawlRes.text());
                    const crawlData = await crawlRes.json();

                    // Provide a status summary for crawl
                    const crawlCount = crawlData.results?.length || 0;
                    result = `Crawl complete. Discovered and analyzed ${crawlCount} nested pages/resources from the target URL.`;
                    break;

                case 'map':
                    payload = { url: node.data.url || inputs.url };
                    const mapRes = await fetch(`${API_BASE_URL}/map/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!mapRes.ok) throw new Error(await mapRes.text());
                    const mapData = await mapRes.json();

                    // Provide a status summary for map
                    const mapCount = mapData.results?.length || 0;
                    result = `Mapping complete. Identified ${mapCount} unique endpoints and logical routes within the site structure.`;
                    break;

                case 'qa':
                    // Enhanced QA Logic
                    let question = node.data.question;
                    const context = node.data.context || inputs.context;

                    if (context) {
                        question = `${question}\n\nContext:\n${context}`;
                    }

                    const qPayload = { queries: [question], include_answer: true };
                    const qaRes = await fetch(`${API_BASE_URL}/web_search/search`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(qPayload)
                    });
                    if (!qaRes.ok) throw new Error(await qaRes.text());
                    const qaData = await qaRes.json();

                    // Extract the direct answer
                    result = qaData.results?.[0]?.answer || "No specific answer could be determined from the provided question and context.";
                    break;

                default:
                    result = "Unknown node type";
            }

            updateNodeData(node.id, { status: 'completed', result: result });
            return result;

        } catch (error) {
            console.error("Node execution error:", error);
            updateNodeData(node.id, { status: 'error', result: error.message });
            return null;
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
                    // Extract context (text) and URL for downstream nodes
                    if (parent.type === 'extract') {
                        const text = parentResult.answer || parentResult.results?.[0]?.raw_content || parentResult.results?.[0]?.content;
                        if (text) inputs.context = text;
                    }

                    if (parent.type === 'search') {
                        // For search, 'answer' is the most useful context
                        const text = parentResult.answer;
                        if (text) inputs.context = text;

                        const url = parentResult.url;
                        if (url) inputs.url = url;
                    }

                    if (parent.type === 'crawl' || parent.type === 'map') {
                        const url = parentResult.results?.[0]?.url;
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
