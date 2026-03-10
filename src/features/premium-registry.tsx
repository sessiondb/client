// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import { lazy } from 'react';
import { UpgradePrompt } from './UpgradePrompt';

export { UpgradePrompt };

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
    Sessions: lazy(() =>
        import('./Premium/Sessions').catch(() => ({
            default: () => <UpgradePrompt feature="sessions" />
        }))
    ),
    Alerts: lazy(() =>
        import('./Premium/Alerts').catch(() => ({
            default: () => <UpgradePrompt feature="alerts" />
        }))
    ),
    Reports: lazy(() =>
        import('./Premium/Reports').catch(() => ({
            default: () => <UpgradePrompt feature="reports" />
        }))
    ),
};
