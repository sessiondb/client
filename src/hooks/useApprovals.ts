// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface ApprovalRequest {
    id: string;
    type: 'TEMP_USER' | 'ROLE_CHANGE' | 'PERM_UPGRADE';
    requester: string;
    description: string;
    timestamp: string;
    status: 'pending' | 'approved' | 'rejected' | 'partially_approved';
    requestedPermissions: any[];
}

export const useApprovals = () => {
    return useQuery({
        queryKey: ['requests'],
        queryFn: async () => {
            const res = await apiClient.get('/requests');
            return Array.isArray(res.data) ? res.data : (res.data.data || []);
        }
    });
};

export const useApproveRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string, status: 'approved', partialPermissions?: any[] }) => {
            const res = await apiClient.put(`/requests/${id}`, data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['requests'] });
        }
    });
};

export const useRejectRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiClient.put(`/requests/${id}`, { status: 'rejected' });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['requests'] });
        }
    });
};
