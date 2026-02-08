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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { SearchNode, CrawlNode, ExtractNode, MapNode } from './Nodes';

const nodeTypes = {
    search: SearchNode,
    crawl: CrawlNode,
    extract: ExtractNode,
    map: MapNode,
};

const initialNodes = [];
const initialEdges = [];

let id = 0;
const getId = () => `dndnode_${id++}`;

const Dashboard = () => {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

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
                data: { label: `${type} node`, onChange: (val) => console.log(val), onUrlChange: (val) => console.log(val) },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="dndflow" style={{ width: '100%', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="glass-panel" style={{
                marginBottom: '1rem',
                padding: '1rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center'
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
