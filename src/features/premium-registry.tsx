// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import React, { lazy } from 'react';
import { Lock } from 'lucide-react';
import { useAccess } from '../context/AccessContext';

export const UpgradePrompt: React.FC<{ feature: string }> = ({ feature }) => {
    const { getFeature } = useAccess();
    const featureData = getFeature(feature);

    return (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px dashed var(--border)', margin: '2rem 1rem' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', display: 'inline-block' }}>
                <Lock size={32} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
                Unlock Premium Features
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                The <strong>{feature.replace(/_/g, ' ')}</strong> feature is only available on the {featureData?.minimumPlan || 'Pro'} plan.
            </p>
        </div>
    );
};

export const PremiumRegistry = {
    QueryInsights: lazy(() =>
        // @ts-ignore
        import('./Premium/QueryInsights').catch(() => ({
            default: () => <UpgradePrompt feature="query_insights" />
        }))
    ),
    DBMetrics: lazy(() =>
        // @ts-ignore
        import('./Premium/DBMetrics').catch(() => ({
            default: () => <UpgradePrompt feature="db_metrics" />
        }))
    ),
    AutoCredsExpiry: lazy(() =>
        // @ts-ignore
        import('./Premium/AutoCredsExpiry').catch(() => ({
            default: () => <UpgradePrompt feature="auto_creds_expiry" />
        }))
    ),
    TTLTableAccess: lazy(() =>
        // @ts-ignore
        import('./Premium/TTLTableAccess').catch(() => ({
            default: () => <UpgradePrompt feature="ttl_table_access" />
        }))
    ),
};
