import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface DBPrivilege {
    object: string;       // table / schema / database name
    type: string;         // SELECT, INSERT, UPDATE, DELETE, EXECUTE, ALL, etc.
    grantable: boolean;   // WITH GRANT OPTION
}

export interface DBUser {
    id: string;
    username: string;
    instanceId: string;
    instanceName: string;
    role: string;
    rolePrivileges?: DBPrivilege[];   // inherited from role
    directPrivileges?: DBPrivilege[]; // granted directly to the user
    status: 'active' | 'inactive' | 'expired' | 'locked';
    created_at: string;
    linkedUserId?: string;   // platform user linked to this DB user
    linkedUserName?: string; // display name of linked platform user
}

export const useDBUsers = (instanceId?: string) => {
    return useQuery({
        queryKey: ['db-users', instanceId ?? 'all'],
        queryFn: async () => {
            const params = instanceId ? { instanceId: instanceId } : {};
            const res = await apiClient.get('/db-users', { params });
            // Handle both plain array and wrapped { success, data } responses
            return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        },
        enabled: true, // always fetch; no instance = all users (future fallback)
    });
};

export const useUpdateDBUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (user: Partial<DBUser> & { id: string }) => {
            const { data } = await apiClient.put<{ success: boolean; data: DBUser }>(`/db-users/${user.id}`, user);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['db-users'] });
        }
    });
};

/** Link (or unlink) a platform user to a DB user */
export const useLinkPlatformUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ dbUserId, platformUserId }: { dbUserId: string; platformUserId: string | null }) => {
            const { data } = await apiClient.put<{ success: boolean; data: DBUser }>(
                `/db-users/${dbUserId}/link`,
                { platform_user_id: platformUserId }
            );
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['db-users'] });
        }
    });
};
