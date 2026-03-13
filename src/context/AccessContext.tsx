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

// Normalize role to a key so we match both API role name ("Super Admin") and key ("super_admin").
function roleKey(role: string | { name?: string; key?: string } | undefined): string {
    if (!role) return '';
    if (typeof role !== 'string') {
        const r = role as { name?: string; key?: string };
        return roleKey(r.key ?? r.name);
    }
    return role.toLowerCase().replace(/\s+/g, '_');
}

function getDefaultPermissionsForRole(role: string): string[] {
    switch (role) {
        case 'super_admin': return ['users:read', 'users:write', 'roles:manage', 'instances:manage', 'logs:view', 'metrics:view', 'insights:view', 'ttl:manage', 'approvals:manage'];
        case 'maintainer': return ['users:read', 'instances:manage', 'logs:view', 'metrics:view', 'approvals:manage'];
        case 'developer': return ['users:read', 'instances:read'];
        case 'analyst': return ['instances:read', 'logs:view'];
        default: return [];
    }
}

export const AccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    const role = roleKey(user?.role);
    const currentPermissions = (user?.rbacPermissions && user.rbacPermissions.length > 0)
        ? user.rbacPermissions
        : getDefaultPermissionsForRole(role);

    // Roadmap features (in development) — index signature allows string key access without TS7053
    const currentFeatures: Record<string, { enabled: boolean; minimumPlan?: string; reason?: string }> = user?.tenantFeatures || {
        'audit_logs': { enabled: true },
        'audit_logs_export': { enabled: false, minimumPlan: 'Planned', reason: 'feature_in_development' },
        'query_insights': { enabled: false, minimumPlan: 'Planned', reason: 'feature_in_development' },
        'db_metrics': { enabled: false, minimumPlan: 'Planned', reason: 'feature_in_development' },
        'sessions': { enabled: false, minimumPlan: 'Planned', reason: 'feature_in_development' },
        'alerts': { enabled: false, minimumPlan: 'Planned', reason: 'feature_in_development' },
        'reports': { enabled: false, minimumPlan: 'Planned', reason: 'feature_in_development' },
        'auto_creds_expiry': { enabled: false, minimumPlan: 'Planned', reason: 'feature_in_development' },
        'ttl_table_access': { enabled: false, minimumPlan: 'Planned', reason: 'feature_in_development' }
    };

    const value = useMemo(() => {
        return {
            hasPermission: (permission: string) => {
                if (!user) return false;
                if (role === 'super_admin') return true;
                return currentPermissions.includes(permission);
            },
            hasAnyPermission: (permissions: string[]) => {
                if (!user) return false;
                if (role === 'super_admin') return true;
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
    }, [user, role, currentPermissions, currentFeatures]);

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
