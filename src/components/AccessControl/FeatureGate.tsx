// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import React, { ReactNode } from 'react';
import { useAccess } from '../../context/AccessContext';
import { Lock } from 'lucide-react';

interface FeatureGateProps {
    featureKey: string;
    children: ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ featureKey, children }) => {
    const { isFeatureEnabled, getFeature } = useAccess();

    if (!isFeatureEnabled(featureKey)) {
        const feature = getFeature(featureKey);

        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem',
                textAlign: 'center',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                border: '1px dashed var(--border)',
                margin: '2rem 1rem'
            }}>
                <div style={{
                    background: 'rgba(168, 85, 247, 0.1)',
                    color: '#a855f7',
                    padding: '1rem',
                    borderRadius: '50%',
                    marginBottom: '1rem'
                }}>
                    <Lock size={32} />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
                    Unlock Premium Features
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '450px' }}>
                    The <strong>{featureKey.replace(/_/g, ' ')}</strong> feature is only available on the {feature?.minimumPlan || 'Pro'} plan. Upgrade your workspace to get access.
                </p>
                <button
                    className="btn-primary"
                    onClick={() => alert(`Redirecting to upgrade to ${feature?.minimumPlan || 'Pro'}...`)}
                >
                    Upgrade to {feature?.minimumPlan || 'Pro'}
                </button>
            </div>
        );
    }

    return <>{children}</>;
};
