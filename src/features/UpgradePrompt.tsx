// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import React from 'react';
import { Lock } from 'lucide-react';
import { useAccess } from '../context/AccessContext';

export const UpgradePrompt: React.FC<{ feature: string }> = ({ feature }) => {
    useAccess(); // ensure inside AccessProvider

    return (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px dashed var(--border)', margin: '2rem 1rem' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', display: 'inline-block' }}>
                <Lock size={32} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
                Coming soon
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                The <strong>{feature.replace(/_/g, ' ')}</strong> feature is on our roadmap and currently in development.
            </p>
        </div>
    );
};
