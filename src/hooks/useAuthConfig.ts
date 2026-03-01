// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface AuthConfig {
    type: 'password' | 'sso';
}

export const useAuthConfig = () => {
    return useQuery({
        queryKey: ['authConfig'],
        queryFn: async () => {
            try {
                const res = await apiClient.get('/config/auth');
                return res.data;
            } catch (e) {
                return { type: 'password' };
            }
        },
        initialData: { type: 'password' }
    });
};

export const useUpdateAuthConfig = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (config: AuthConfig) => {
            const res = await apiClient.put('/config/auth', config);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['authConfig'], data);
            queryClient.invalidateQueries({ queryKey: ['authConfig'] });
        }
    });
};
