// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import React, { ReactNode } from 'react';
import { useAccess } from '../../context/AccessContext';

interface PermissionGateProps {
    children: ReactNode;
    required?: string;
    requiredAny?: string[];
    fallback?: ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
    children,
    required,
    requiredAny,
    fallback = null
}) => {
    const { hasPermission, hasAnyPermission } = useAccess();

    let isAuthorized = true;

    if (required && !hasPermission(required)) {
        isAuthorized = false;
    } else if (requiredAny && requiredAny.length > 0 && !hasAnyPermission(requiredAny)) {
        isAuthorized = false;
    }

    if (!isAuthorized) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
