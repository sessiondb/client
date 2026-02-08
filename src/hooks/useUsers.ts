import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { User } from '../context/AuthContext';

// Hook to fetch users
export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await apiClient.get('/users');
            // Docs say response is [ ... ], so use res.data. 
            // Fallback to res.data.data just in case it is wrapped.
            return Array.isArray(res.data) ? res.data : (res.data.data || []);
        }
    });
};

// Hook to fetch a single user
export const useUser = (id: string) => {
    return useQuery({
        queryKey: ['users', id],
        queryFn: async () => {
            const res = await apiClient.get(`/users/${id}`);
            return res.data.data;
        },
        enabled: !!id
    });
};

// Hook for Create User
export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userData: Partial<User>) => {
            const res = await apiClient.post('/users', userData);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
};

// Hook for Update User
export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userData: Partial<User> & { id: string }) => {
            const { id, ...data } = userData;
            const res = await apiClient.put(`/users/${id}`, data);
            return res.data.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['users', data.id] });
        }
    });
};

// Hook for Delete User
export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiClient.delete(`/users/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
};
