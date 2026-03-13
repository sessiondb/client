// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { getRequests, updateRequestStatus } from '../api/requests';

/** One requested access item returned by GET /v1/requests (requestedItems). */
export interface RequestedItem {
    instanceId: string;
    database: string;
    table: string;
    privileges: string[];
}

export interface ApprovalRequest {
    id: string;
    type: 'TEMP_USER' | 'ROLE_CHANGE' | 'PERM_UPGRADE' | string;
    requester: string;
    description: string;
    justification?: string;
    timestamp: string;
    status: 'pending' | 'approved' | 'rejected' | 'partially_approved';
    /** New shape from backend (instanceId, database, table, privileges). */
    requestedItems?: RequestedItem[];
    /** Legacy shape; prefer requestedItems when present. */
    requestedPermissions?: any[];
}

/**
 * Fetches approval requests (GET /v1/requests). Refetch via returned refetch().
 */
export const useApprovals = () => {
    return useQuery({
        queryKey: ['requests'],
        queryFn: getRequests
    });
};

export const useApproveRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, partialPermissions }: { id: string; status: 'approved'; partialPermissions?: any[] }) => {
            const body: { status: string; partialPermissions?: any[] } = { status: 'approved' };
            if (partialPermissions != null) body.partialPermissions = partialPermissions;
            const res = await apiClient.put(`/requests/${id}`, body);
            return res.data?.data ?? res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['requests'] });
        }
    });
};

/**
 * Rejects a request with optional reason. Sends PUT /v1/requests/:id { status: "rejected", rejectionReason?: string }.
 */
export const useRejectRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, rejectionReason }: { id: string; rejectionReason?: string }) => {
            return updateRequestStatus(id, 'rejected', rejectionReason);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['requests'] });
        }
    });
};
