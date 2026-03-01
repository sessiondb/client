// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { DBInstance } from '../context/InstanceContext';

export const useAdminInstances = () => {
    return useQuery({
        queryKey: ['admin-instances'],
        queryFn: async () => {
            const res = await apiClient.get('/admin/instances');
            return Array.isArray(res.data) ? res.data : (res.data.data || []);
        }
    });
};

export const useCreateInstance = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (instance: Partial<DBInstance>) => {
            const res = await apiClient.post('/admin/instances', instance);
            return res.data.data || res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instances'] });
            queryClient.invalidateQueries({ queryKey: ['admin-instances'] });
        }
    });
};

export const useUpdateInstance = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...data }: Partial<DBInstance> & { id: string }) => {
            const res = await apiClient.put(`/admin/instances/${id}`, data);
            return res.data.data || res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instances'] });
            queryClient.invalidateQueries({ queryKey: ['admin-instances'] });
        }
    });
};

export const useDeleteInstance = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/admin/instances/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instances'] });
            queryClient.invalidateQueries({ queryKey: ['admin-instances'] });
        }
    });
};

export const useSyncInstance = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiClient.post(`/admin/instances/sync/${id}`);
            return res.data.data || res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instances'] });
            queryClient.invalidateQueries({ queryKey: ['admin-instances'] });
            queryClient.invalidateQueries({ queryKey: ['schema'] });
        }
    });
};
