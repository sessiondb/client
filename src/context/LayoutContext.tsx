// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import React, { createContext, useContext, useState } from 'react';

interface LayoutContextType {
    isSidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <LayoutContext.Provider value={{ isSidebarCollapsed, setSidebarCollapsed }}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) throw new Error('useLayout must be used within LayoutProvider');
    return context;
};
