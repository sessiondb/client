// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.css';
import { useLayout } from '../../context/LayoutContext';
import { useInstance } from '../../context/InstanceContext';
import { useAccess } from '../../context/AccessContext';

/**
 * Redirects to /no-access when user has no instance access and cannot add one.
 * Users with instances:manage (e.g. superadmin) are not redirected so they can add the first instance from Admin → Instances.
 */
function NoAccessGuard({ children }: { children: React.ReactNode }) {
    const { instances, isLoading } = useInstance();
    const { hasPermission } = useAccess();
    const location = useLocation();
    if (location.pathname === '/no-access') return <>{children}</>;
    const canManageInstances = hasPermission('instances:manage');
    if (!isLoading && instances.length === 0 && !canManageInstances) return <Navigate to="/no-access" replace />;
    return <>{children}</>;
}

const Layout: React.FC = () => {
    const { isSidebarCollapsed } = useLayout();
    const location = useLocation();
    const isQueryTab = location.pathname === '/query';

    return (
        <div className={styles.layout}>
            <Sidebar />
            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentExpanded : ''}`}>
                <Header />
                <div className={`${styles.contentArea} ${isQueryTab ? styles.noPadding : ''}`}>
                    <NoAccessGuard>
                        <Outlet />
                    </NoAccessGuard>
                </div>
            </main>
        </div>
    );
};

export default Layout;
