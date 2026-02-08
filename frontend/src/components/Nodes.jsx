import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const nodeStyles = {
    background: 'rgba(17, 24, 39, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '1rem',
    minWidth: '200px',
    color: '#fff',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
};

const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    color: '#9CA3AF',
};

const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
};

export const SearchNode = memo(({ data }) => {
    return (
        <div style={nodeStyles}>
            <Handle type="target" position={Position.Top} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🔍</span>
                <strong style={{ fontSize: '1rem' }}>Search</strong>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
                <label style={labelStyle}>Query</label>
                <input
                    className="nodrag"
                    style={inputStyle}
                    placeholder="Search query..."
                    defaultValue={data.query}
                    onChange={(evt) => data.onChange(evt.target.value)}
                />
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
});

export const CrawlNode = memo(({ data }) => {
    return (
        <div style={nodeStyles}>
            <Handle type="target" position={Position.Top} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🕷️</span>
                <strong style={{ fontSize: '1rem' }}>Crawl</strong>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
                <label style={labelStyle}>URL</label>
                <input
                    className="nodrag"
                    style={inputStyle}
                    placeholder="https://..."
                    defaultValue={data.url}
                    onChange={(evt) => data.onUrlChange(evt.target.value)}
                />
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
});

export const ExtractNode = memo(({ data }) => {
    return (
        <div style={nodeStyles}>
            <Handle type="target" position={Position.Top} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📄</span>
                <strong style={{ fontSize: '1rem' }}>Extract</strong>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
                <label style={labelStyle}>Question (Opt)</label>
                <input
                    className="nodrag"
                    style={inputStyle}
                    placeholder="Specific question..."
                    defaultValue={data.query}
                    onChange={(evt) => data.onChange(evt.target.value)}
                />
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
});

export const MapNode = memo(({ data }) => {
    return (
        <div style={nodeStyles}>
            <Handle type="target" position={Position.Top} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🗺️</span>
                <strong style={{ fontSize: '1rem' }}>Map</strong>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
                <label style={labelStyle}>Target URL</label>
                <input
                    className="nodrag"
                    style={inputStyle}
                    placeholder="https://..."
                    defaultValue={data.url}
                    onChange={(evt) => data.onUrlChange(evt.target.value)}
                />
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
});
