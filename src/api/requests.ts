// Copyright (c) 2026 Sai Mouli Bandari. Licensed under Business Source License 1.1.
import apiClient from './client';

/**
 * One requested access item: instance, database, table, and privileges.
 * @typedef {Object} RequestedItem
 * @property {string} instanceId - UUID of the target instance
 * @property {string} database - Database name
 * @property {string} table - Table name
 * @property {string[]} privileges - e.g. ['SELECT', 'INSERT']
 */

export interface RequestedItem {
  instanceId: string;
  database: string;
  table: string;
  privileges: string[];
}

/**
 * Body for creating an access request.
 * @typedef {Object} CreateRequestBody
 * @property {string} type - e.g. 'DB_ACCESS'
 * @property {string} description - Required description
 * @property {string} justification - Required justification
 * @property {RequestedItem[]} requestedItems - At least one item; each validated by backend
 */

export interface CreateRequestBody {
  type: string;
  description: string;
  justification: string;
  requestedItems: RequestedItem[];
}

/**
 * Creates an access request. Uses apiClient (Bearer token attached by interceptor).
 * @param {CreateRequestBody} body - type, description, justification, requestedItems
 * @returns {Promise<any>} API response data
 */
export async function createRequest(body: CreateRequestBody): Promise<any> {
  const res = await apiClient.post('/requests', body);
  return res.data;
}

/**
 * Fetches all requests (for admin list). Uses apiClient auth.
 * @returns {Promise<any[]>} Array of request objects (include requestedItems)
 */
export async function getRequests(): Promise<any[]> {
  const res = await apiClient.get('/requests');
  const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  return data;
}

/**
 * Updates request status (approve or reject).
 * @param {string} id - Request ID
 * @param {string} status - 'approved' | 'rejected'
 * @param {string} [rejectionReason] - Optional reason when rejecting
 * @returns {Promise<any>} API response data
 */
export async function updateRequestStatus(
  id: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string
): Promise<any> {
  const body: { status: string; rejectionReason?: string } = { status };
  if (status === 'rejected' && rejectionReason != null && rejectionReason !== '') {
    body.rejectionReason = rejectionReason;
  }
  const res = await apiClient.put(`/requests/${id}`, body);
  return res.data?.data ?? res.data;
}
