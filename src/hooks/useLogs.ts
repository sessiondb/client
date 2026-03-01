// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface AuditLog {
    id: string;
    timestamp: string;
    user: string;
    session_user?: string;
    action: string;
    resource: string;
    table?: string;
    query?: string;
    status: 'Success' | 'Failure' | 'Warning';
}

export const useLogs = () => {
    return useQuery({
        queryKey: ['logs'],
        queryFn: async () => {
            const res = await apiClient.get('/logs');
            return Array.isArray(res.data) ? res.data : (res.data.data || []);
        }
    });
};
