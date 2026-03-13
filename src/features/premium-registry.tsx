// Copyright (c) 2026 Sai Mouli Bandari. Licensed under Business Source License 1.1.
// Open Core: Premium modules are optional. When src/features/Premium/ is removed
// (Community Edition), dynamic imports fail and .catch() returns a null component
// so the build and runtime stay stable.
import React, { lazy } from 'react';

/** Null component used when a Premium module is missing (e.g. Community Edition build). */
const NullComponent: React.FC = () => null;

/**
 * Lazily load a Premium module. If the module is missing (folder deleted), the promise
 * rejects and we return a no-op component so the app does not crash.
 */
function lazyPremium(loader: () => Promise<{ default: React.ComponentType<any> }>) {
  return lazy(() =>
    loader().catch(() => ({ default: NullComponent }))
  );
}

/** Type for the registry so dynamic key access does not cause TS7053. */
export interface PremiumRegistryType {
  QueryInsights: React.LazyExoticComponent<React.ComponentType<any>>;
  DBMetrics: React.LazyExoticComponent<React.ComponentType<any>>;
  AutoCredsExpiry: React.LazyExoticComponent<React.ComponentType<any>>;
  TTLTableAccess: React.LazyExoticComponent<React.ComponentType<any>>;
  Sessions: React.LazyExoticComponent<React.ComponentType<any>>;
  Alerts: React.LazyExoticComponent<React.ComponentType<any>>;
  Reports: React.LazyExoticComponent<React.ComponentType<any>>;
  [key: string]: React.LazyExoticComponent<React.ComponentType<any>> | undefined;
}

/** Stable registry of lazy Premium components. Missing modules resolve to a null component. */
export const PremiumRegistry: PremiumRegistryType = {
  QueryInsights: lazyPremium(() =>
    // @ts-ignore - Premium module may be missing in Community Edition (folder removed)
    import('./Premium/QueryInsights')
  ),
  DBMetrics: lazyPremium(() =>
    // @ts-ignore
    import('./Premium/DBMetrics')
  ),
  AutoCredsExpiry: lazyPremium(() =>
    // @ts-ignore
    import('./Premium/AutoCredsExpiry')
  ),
  TTLTableAccess: lazyPremium(() =>
    // @ts-ignore
    import('./Premium/TTLTableAccess')
  ),
  Sessions: lazyPremium(() =>
    // @ts-ignore
    import('./Premium/Sessions')
  ),
  Alerts: lazyPremium(() =>
    // @ts-ignore
    import('./Premium/Alerts')
  ),
  Reports: lazyPremium(() =>
    // @ts-ignore
    import('./Premium/Reports')
  ),
};
