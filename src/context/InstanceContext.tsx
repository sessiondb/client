// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface DBInstance {
    id: string;
    name: string;
    host: string;
    port: number;
    type: 'mysql' | 'postgres' | 'mongodb';
    /** PostgreSQL only: disable | require | verify-ca | verify-full. Empty = disable. */
    sslMode?: string;
    lastSync?: string;
    status: 'online' | 'offline' | 'syncing';
}

interface InstanceContextType {
    currentInstance: DBInstance | null;
    currentInstanceId: string | null;
    instances: DBInstance[];
    setCurrentInstanceId: (id: string) => void;
    isLoading: boolean;
}

const InstanceContext = createContext<InstanceContextType | undefined>(undefined);

export const InstanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentInstanceId, setInternalInstanceId] = useState<string | null>(
        localStorage.getItem('sdb_current_instance_id')
    );

    const { data: instances = [], isLoading } = useQuery({
        queryKey: ['instances'],
        queryFn: async () => {
            const res = await apiClient.get('/instances');
            return Array.isArray(res.data) ? res.data : (res.data.data || []);
        }
    });

    useEffect(() => {
        if (!currentInstanceId && instances.length > 0) {
            setInternalInstanceId(instances[0].id);
        }
    }, [instances, currentInstanceId]);

    const setCurrentInstanceId = (id: string) => {
        setInternalInstanceId(id);
        localStorage.setItem('sdb_current_instance_id', id);
    };

    const currentInstance = instances.find((i: DBInstance) => i.id === currentInstanceId) || null;

    return (
        <InstanceContext.Provider value={{
            currentInstance,
            currentInstanceId,
            instances,
            setCurrentInstanceId,
            isLoading
        }}>
            {children}
        </InstanceContext.Provider>
    );
};

export const useInstance = () => {
    const context = useContext(InstanceContext);
    if (!context) throw new Error('useInstance must be used within InstanceProvider');
    return context;
};
