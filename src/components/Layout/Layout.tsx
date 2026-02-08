import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.css';
import { useLayout } from '../../context/LayoutContext';

const Layout: React.FC = () => {
    const { isSidebarCollapsed } = useLayout();

    return (
        <div className={styles.layout}>
            <Sidebar />
            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.mainContentExpanded : ''}`}>
                <Header />
                <div className={styles.contentWrapper}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
