import React, { memo } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';

const nodeStyles = {
    background: 'rgba(17, 24, 39, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '1rem',
    minWidth: '200px',
    height: '100%',
    width: '100%',
    color: '#fff',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column'
};

const titleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '0.5rem'
};

const labelStyle = {
    display: 'block',
    marginBottom: '0.25rem',
    fontSize: '0.75rem',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    marginBottom: '0.5rem'
};

const statusStyle = (status) => ({
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    marginTop: 'auto', // Push to bottom if flex column
    background: status === 'running' ? 'rgba(59, 130, 246, 0.2)' :
        status === 'completed' ? 'rgba(16, 185, 129, 0.2)' :
            status === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
    color: status === 'running' ? '#60A5FA' :
        status === 'completed' ? '#34D399' :
            status === 'error' ? '#F87171' : '#9CA3AF',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
});

const ResultDisplay = ({ result }) => {
    if (!result) return null;
    return (
        <div style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '6px',
            fontSize: '0.75rem',
            maxHeight: '100px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace'
        }}>
            {typeof result === 'object' ? JSON.stringify(result, null, 2) : result}
        </div>
    );
};

export const SearchNode = memo(({ data, selected }) => {
    return (
        <>
            <NodeResizer minWidth={250} minHeight={200} isVisible={selected} lineStyle={{ border: '1px solid #3b82f6' }} handleStyle={{ width: 8, height: 8 }} />
            <div style={nodeStyles}>
                <Handle type="target" position={Position.Top} id="in" />

                <div style={titleStyle}>
                    <span style={{ fontSize: '1.25rem' }}>🔍</span>
                    <strong style={{ fontSize: '1rem' }}>Search</strong>
                </div>

                <div>
                    <label style={labelStyle}>Query</label>
                    <input
                        className="nodrag"
                        style={inputStyle}
                        placeholder="Search query..."
                        defaultValue={data.query}
                        onChange={(evt) => data.onChange(evt.target.value)}
                    />
                </div>

                <div style={statusStyle(data.status)}>
                    {data.status === 'running' && <span className="animate-spin">⌛</span>}
                    {data.status || 'Idle'}
                </div>

                <ResultDisplay result={data.result} />

                <Handle type="source" position={Position.Bottom} id="out" />
            </div>
        </>
    );
});

export const CrawlNode = memo(({ data, selected }) => {
    return (
        <>
            <NodeResizer minWidth={250} minHeight={200} isVisible={selected} lineStyle={{ border: '1px solid #3b82f6' }} handleStyle={{ width: 8, height: 8 }} />
            <div style={nodeStyles}>
                <Handle type="target" position={Position.Top} id="in" />

                <div style={titleStyle}>
                    <span style={{ fontSize: '1.25rem' }}>🕷️</span>
                    <strong style={{ fontSize: '1rem' }}>Crawl</strong>
                </div>

                <div>
                    <label style={labelStyle}>URL</label>
                    <input
                        className="nodrag"
                        style={inputStyle}
                        placeholder="https://..."
                        defaultValue={data.url}
                        onChange={(evt) => data.onUrlChange(evt.target.value)}
                    />
                </div>

                <div style={statusStyle(data.status)}>
                    {data.status === 'running' && <span className="animate-spin">⌛</span>}
                    {data.status || 'Idle'}
                </div>

                <ResultDisplay result={data.result} />

                <Handle type="source" position={Position.Bottom} id="out" />
            </div>
        </>
    );
});

export const ExtractNode = memo(({ data, selected }) => {
    return (
        <>
            <NodeResizer minWidth={250} minHeight={200} isVisible={selected} lineStyle={{ border: '1px solid #3b82f6' }} handleStyle={{ width: 8, height: 8 }} />
            <div style={nodeStyles}>
                <Handle type="target" position={Position.Top} id="in" />

                <div style={titleStyle}>
                    <span style={{ fontSize: '1.25rem' }}>📄</span>
                    <strong style={{ fontSize: '1rem' }}>Extract</strong>
                </div>

                <div>
                    <label style={labelStyle}>URL</label>
                    <input
                        className="nodrag"
                        style={inputStyle}
                        placeholder="https://..."
                        defaultValue={data.url}
                        onChange={(evt) => data.onUrlChange(evt.target.value)}
                    />
                </div>

                <div style={statusStyle(data.status)}>
                    {data.status === 'running' && <span className="animate-spin">⌛</span>}
                    {data.status || 'Idle'}
                </div>

                <ResultDisplay result={data.result} />

                <Handle type="source" position={Position.Bottom} id="out" />
            </div>
        </>
    );
});

export const MapNode = memo(({ data, selected }) => {
    return (
        <>
            <NodeResizer minWidth={250} minHeight={200} isVisible={selected} lineStyle={{ border: '1px solid #3b82f6' }} handleStyle={{ width: 8, height: 8 }} />
            <div style={nodeStyles}>
                <Handle type="target" position={Position.Top} id="in" />

                <div style={titleStyle}>
                    <span style={{ fontSize: '1.25rem' }}>🗺️</span>
                    <strong style={{ fontSize: '1rem' }}>Map</strong>
                </div>

                <div>
                    <label style={labelStyle}>Target URL</label>
                    <input
                        className="nodrag"
                        style={inputStyle}
                        placeholder="https://..."
                        defaultValue={data.url}
                        onChange={(evt) => data.onUrlChange(evt.target.value)}
                    />
                </div>

                <div style={statusStyle(data.status)}>
                    {data.status === 'running' && <span className="animate-spin">⌛</span>}
                    {data.status || 'Idle'}
                </div>

                <ResultDisplay result={data.result} />

                <Handle type="source" position={Position.Bottom} id="out" />
            </div>
        </>
    );
});

export const QANode = memo(({ data, selected }) => {
    return (
        <>
            <NodeResizer minWidth={250} minHeight={200} isVisible={selected} lineStyle={{ border: '1px solid #3b82f6' }} handleStyle={{ width: 8, height: 8 }} />
            <div style={nodeStyles}>
                <Handle type="target" position={Position.Top} id="in" />

                <div style={titleStyle}>
                    <span style={{ fontSize: '1.25rem' }}>🧠</span>
                    <strong style={{ fontSize: '1rem' }}>Ask / QA</strong>
                </div>

                <div>
                    <label style={labelStyle}>Context (Optional)</label>
                    <textarea
                        className="nodrag"
                        style={{ ...inputStyle, minHeight: '60px', fontSize: '0.75rem' }}
                        placeholder="Connect output from other nodes or type context..."
                        defaultValue={data.context}
                        onChange={(evt) => data.onContextChange(evt.target.value)}
                    />
                </div>

                <div>
                    <label style={labelStyle}>Question</label>
                    <input
                        className="nodrag"
                        style={inputStyle}
                        placeholder="Ask a question..."
                        defaultValue={data.question}
                        onChange={(evt) => data.onQuestionChange(evt.target.value)}
                    />
                </div>

                <div style={statusStyle(data.status)}>
                    {data.status === 'running' && <span className="animate-spin">⌛</span>}
                    {data.status || 'Idle'}
                </div>

                <ResultDisplay result={data.result} />

                <Handle type="source" position={Position.Bottom} id="out" />
            </div>
        </>
    );
});
