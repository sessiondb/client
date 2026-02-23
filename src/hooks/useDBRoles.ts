import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { DBPrivilege } from './useDBUsers';

export interface DBRole {
    id: string;
    name: string;           // "Read Only" (Pascal Case display name)
    dbKey: string;          // "read_only" (actual DB identifier)
    instanceId: string;
    instanceName: string;
    memberCount: number;
    privileges: DBPrivilege[];
    isSystemRole: boolean;
    createdAt: string;
}

export const useDBRoles = (instanceId?: string) => {
    return useQuery({
        queryKey: ['db-roles', instanceId ?? 'all'],
        queryFn: async () => {
            const params = instanceId ? { instanceId } : {};
            const res = await apiClient.get('/db-roles', { params });
            return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        },
        enabled: true,
    });
};
