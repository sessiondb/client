import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.css';
import { useLayout } from '../../context/LayoutContext';

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
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
