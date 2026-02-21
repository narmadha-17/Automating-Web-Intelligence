import React, { memo, useState } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';

const nodeStyles = {
    background: 'linear-gradient(135deg, rgba(20, 28, 50, 0.95) 0%, rgba(25, 35, 60, 0.95) 100%)',
    border: '2px solid rgba(212, 163, 115, 0.3)',
    borderRadius: '16px',
    padding: '1.5rem',
    minWidth: '320px',
    minHeight: '300px',
    height: '100%',
    width: '100%',
    color: '#fff',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Outfit, sans-serif'
};

const titleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
    borderBottom: '2px solid rgba(212, 163, 115, 0.2)',
    paddingBottom: '0.75rem'
};

const labelStyle = {
    display: 'block',
    marginBottom: '0.4rem',
    fontSize: '0.75rem',
    color: '#D4A373',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: '600'
};

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1.5px solid rgba(212, 163, 115, 0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'all 0.3s',
    marginBottom: '0.75rem',
    fontFamily: 'Outfit, sans-serif'
};

const inputStyle_focus = {
    ...inputStyle,
    borderColor: 'rgba(212, 163, 115, 0.6)',
    background: 'rgba(0, 0, 0, 0.35)',
    boxShadow: '0 0 12px rgba(212, 163, 115, 0.15)'
};

const statusStyle = (status) => ({
    fontSize: '0.75rem',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    marginTop: '0.75rem',
    background: status === 'running' ? 'rgba(59, 130, 246, 0.15)' :
        status === 'completed' ? 'rgba(16, 185, 129, 0.15)' :
            status === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(212, 163, 115, 0.1)',
    color: status === 'running' ? '#60A5FA' :
        status === 'completed' ? '#34D399' :
            status === 'error' ? '#F87171' : '#D4A373',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '600'
});

const ResultDisplay = ({ result }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!result) return null;

    // Special handling for results that are arrays of URLs
    let isUrlArray = false;
    let displayContent = result;
    
    if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'string' && result[0].startsWith('http')) {
        isUrlArray = true;
        displayContent = result.map((url, idx) => `${idx + 1}. ${url}`).join('\n');
    } else if (typeof result === 'object' && result.results && Array.isArray(result.results)) {
        // Handle objects with results array
        if (result.results.length > 0 && typeof result.results[0] === 'string' && result.results[0].startsWith('http')) {
            isUrlArray = true;
            displayContent = result.results.map((url, idx) => `${idx + 1}. ${url}`).join('\n');
        } else {
            displayContent = JSON.stringify(result, null, 2);
        }
    } else {
        displayContent = typeof result === 'object' ? JSON.stringify(result, null, 2) : result;
    }

    const isLongResult = displayContent.length > 250;

    return (
        <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1.5px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '10px',
            fontSize: '0.8rem',
            overflow: isExpanded ? 'auto' : 'hidden',
            maxHeight: isExpanded ? '500px' : '160px',
            lineHeight: '1.7',
            color: '#E5E7EB',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            transition: 'all 0.3s',
            flex: isExpanded ? 'initial' : '1',
            minHeight: '80px',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {displayContent}
            </div>
            {isLongResult && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        marginTop: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(212, 163, 115, 0.2)',
                        border: '1px solid rgba(212, 163, 115, 0.4)',
                        borderRadius: '6px',
                        color: '#D4A373',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        alignSelf: 'flex-start'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(212, 163, 115, 0.3)';
                        e.target.style.borderColor = 'rgba(212, 163, 115, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(212, 163, 115, 0.2)';
                        e.target.style.borderColor = 'rgba(212, 163, 115, 0.4)';
                    }}
                >
                    {isExpanded ? '↑ Collapse' : '↓ Expand'}
                </button>
            )}
        </div>
    );
};

export const SearchNode = memo(({ data, selected }) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
        <>
            <NodeResizer minWidth={320} minHeight={300} isVisible={selected} lineStyle={{ border: '2px solid rgba(212, 163, 115, 0.6)' }} handleStyle={{ width: 10, height: 10, background: '#D4A373' }} />
            <div style={nodeStyles}>
                <Handle type="target" position={Position.Top} id="in" />

                <div style={titleStyle}>
                    <span style={{ fontSize: '1.5rem' }}>🔍</span>
                    <strong style={{ fontSize: '1.1rem', color: '#D4A373' }}>Search</strong>
                </div>

                <div style={{ marginBottom: '0.5rem', flex: '0 0 auto' }}>
                    <label style={labelStyle}>Search Query</label>
                    <input
                        className="nodrag"
                        style={isFocused ? inputStyle_focus : inputStyle}
                        placeholder="Enter your search query..."
                        defaultValue={data.query}
                        onChange={(evt) => data.onChange(evt.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                </div>

                <div style={statusStyle(data.status)}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {data.status === 'running' && <span className="animate-spin">⌛</span>}
                        <span>{data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Idle'}</span>
                    </span>
                </div>

                <ResultDisplay result={data.result} />

                <Handle type="source" position={Position.Bottom} id="out" />
            </div>
        </>
    );
});

export const CrawlNode = memo(({ data, selected }) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
        <>
            <NodeResizer minWidth={320} minHeight={300} isVisible={selected} lineStyle={{ border: '2px solid rgba(212, 163, 115, 0.6)' }} handleStyle={{ width: 10, height: 10, background: '#D4A373' }} />
            <div style={nodeStyles}>
                <Handle type="target" position={Position.Top} id="in" />

                <div style={titleStyle}>
                    <span style={{ fontSize: '1.5rem' }}>🕷️</span>
                    <strong style={{ fontSize: '1.1rem', color: '#D4A373' }}>Crawl</strong>
                </div>

                <div style={{ marginBottom: '0.5rem', flex: '0 0 auto' }}>
                    <label style={labelStyle}>Website URL</label>
                    <input
                        className="nodrag"
                        style={isFocused ? inputStyle_focus : inputStyle}
                        placeholder="https://example.com"
                        defaultValue={data.url}
                        onChange={(evt) => data.onUrlChange(evt.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                </div>

                <div style={statusStyle(data.status)}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {data.status === 'running' && <span className="animate-spin">⌛</span>}
                        <span>{data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Idle'}</span>
                    </span>
                </div>

                <ResultDisplay result={data.result} />

                <Handle type="source" position={Position.Bottom} id="out" />
            </div>
        </>
    );
});

export const ExtractNode = memo(({ data, selected }) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
        <>
            <NodeResizer minWidth={320} minHeight={300} isVisible={selected} lineStyle={{ border: '2px solid rgba(212, 163, 115, 0.6)' }} handleStyle={{ width: 10, height: 10, background: '#D4A373' }} />
            <div style={nodeStyles}>
                <Handle type="target" position={Position.Top} id="in" />

                <div style={titleStyle}>
                    <span style={{ fontSize: '1.5rem' }}>📄</span>
                    <strong style={{ fontSize: '1.1rem', color: '#D4A373' }}>Extract</strong>
                </div>

                <div style={{ marginBottom: '0.5rem', flex: '0 0 auto' }}>
                    <label style={labelStyle}>Page URL</label>
                    <input
                        className="nodrag"
                        style={isFocused ? inputStyle_focus : inputStyle}
                        placeholder="https://example.com"
                        defaultValue={data.url}
                        onChange={(evt) => data.onUrlChange(evt.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                </div>

                <div style={statusStyle(data.status)}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {data.status === 'running' && <span className="animate-spin">⌛</span>}
                        <span>{data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Idle'}</span>
                    </span>
                </div>

                <ResultDisplay result={data.result} />

                <Handle type="source" position={Position.Bottom} id="out" />
            </div>
        </>
    );
});

export const MapNode = memo(({ data, selected }) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
        <>
            <NodeResizer minWidth={320} minHeight={300} isVisible={selected} lineStyle={{ border: '2px solid rgba(212, 163, 115, 0.6)' }} handleStyle={{ width: 10, height: 10, background: '#D4A373' }} />
            <div style={nodeStyles}>
                <Handle type="target" position={Position.Top} id="in" />

                <div style={titleStyle}>
                    <span style={{ fontSize: '1.5rem' }}>🗺️</span>
                    <strong style={{ fontSize: '1.1rem', color: '#D4A373' }}>Map</strong>
                </div>

                <div style={{ marginBottom: '0.5rem', flex: '0 0 auto' }}>
                    <label style={labelStyle}>Target URL</label>
                    <input
                        className="nodrag"
                        style={isFocused ? inputStyle_focus : inputStyle}
                        placeholder="https://example.com"
                        defaultValue={data.url}
                        onChange={(evt) => data.onUrlChange(evt.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                </div>

                <div style={statusStyle(data.status)}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {data.status === 'running' && <span className="animate-spin">⌛</span>}
                        <span>{data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Idle'}</span>
                    </span>
                </div>

                <ResultDisplay result={data.result} />

                <Handle type="source" position={Position.Bottom} id="out" />
            </div>
        </>
    );
});

export const QANode = memo(({ data, selected }) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
        <>
            <NodeResizer minWidth={320} minHeight={300} isVisible={selected} lineStyle={{ border: '2px solid rgba(212, 163, 115, 0.6)' }} handleStyle={{ width: 10, height: 10, background: '#D4A373' }} />
            <div style={nodeStyles}>
                <Handle type="target" position={Position.Top} id="in" />

                <div style={titleStyle}>
                    <span style={{ fontSize: '1.5rem' }}>🧠</span>
                    <strong style={{ fontSize: '1.1rem', color: '#D4A373' }}>Ask / QA</strong>
                </div>

                <div style={{ marginBottom: '0.5rem', flex: '0 0 auto' }}>
                    <label style={labelStyle}>Your Question</label>
                    <input
                        className="nodrag"
                        style={isFocused ? inputStyle_focus : inputStyle}
                        placeholder="Ask a question..."
                        defaultValue={data.question}
                        onChange={(evt) => data.onQuestionChange(evt.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                </div>

                <div style={statusStyle(data.status)}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {data.status === 'running' && <span className="animate-spin">⌛</span>}
                        <span>{data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Idle'}</span>
                    </span>
                </div>

                <ResultDisplay result={data.result} />

                <Handle type="source" position={Position.Bottom} id="out" />
            </div>
        </>
    );
});
