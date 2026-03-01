// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

interface AccessContextType {
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    getFeature: (featureKey: string) => { enabled: boolean; minimumPlan?: string; isBeta?: boolean } | null;
    isFeatureEnabled: (featureKey: string) => boolean;
}

const AccessContext = createContext<AccessContextType | undefined>(undefined);

export const AccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    // Fallback Mock Data for Development
    const currentPermissions = user?.rbacPermissions || (
        user?.role === 'super_admin' ? ['users:read', 'users:write', 'roles:manage', 'instances:manage', 'logs:view', 'metrics:view', 'insights:view', 'ttl:manage'] :
            user?.role === 'maintainer' ? ['users:read', 'instances:manage', 'logs:view', 'metrics:view'] :
                [] // viewer
    );

    // Provide the required "Pro Features" specified by the user as false for Community mode
    const currentFeatures = user?.tenantFeatures || {
        'audit_logs': { enabled: true },
        'query_insights': { enabled: false, minimumPlan: 'Pro', reason: 'plan_upgrade_required' },
        'db_metrics': { enabled: false, minimumPlan: 'Pro', reason: 'plan_upgrade_required' },
        'auto_creds_expiry': { enabled: false, minimumPlan: 'Enterprise', reason: 'plan_upgrade_required' },
        'ttl_table_access': { enabled: false, minimumPlan: 'Enterprise', reason: 'plan_upgrade_required' }
    };

    const value = useMemo(() => {
        return {
            hasPermission: (permission: string) => {
                if (!user) return false;
                if (user.role === 'super_admin') return true;
                return currentPermissions.includes(permission);
            },
            hasAnyPermission: (permissions: string[]) => {
                if (!user) return false;
                if (user.role === 'super_admin') return true;
                return permissions.some(p => currentPermissions.includes(p));
            },
            getFeature: (featureKey: string) => {
                return currentFeatures[featureKey] || null;
            },
            isFeatureEnabled: (featureKey: string) => {
                const feature = currentFeatures[featureKey];
                return feature ? feature.enabled : false;
            }
        };
    }, [user, currentPermissions, currentFeatures]);

    return (
        <AccessContext.Provider value={value}>
            {children}
        </AccessContext.Provider>
    );
};

export const useAccess = () => {
    const context = useContext(AccessContext);
    if (!context) {
        throw new Error('useAccess must be used within an AccessProvider');
    }
    return context;
};
