// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.css';
import { useLayout } from '../../context/LayoutContext';
import { useInstance } from '../../context/InstanceContext';

/**
 * Redirects to /no-access when user has no instance access (and not already on no-access).
 */
function NoAccessGuard({ children }: { children: React.ReactNode }) {
    const { instances, isLoading } = useInstance();
    const location = useLocation();
    if (location.pathname === '/no-access') return <>{children}</>;
    if (!isLoading && instances.length === 0) return <Navigate to="/no-access" replace />;
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
