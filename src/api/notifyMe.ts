// Copyright (c) 2026 Sai Mouli Bandari. Licensed under Business Source License 1.1.

import apiClient from './client';

/**
 * Request body for registering "Notify me when this is ready" for a roadmap feature.
 */
export interface RegisterNotifyMeRequest {
  featureKey: string;
}

/**
 * Success response from POST /notify-me.
 */
export interface RegisterNotifyMeResponse {
  message: string;
  requestId?: string;
}

/**
 * Registers the current user to be notified when the given roadmap feature is ready.
 * Uses the authenticated user's email from the backend (JWT).
 *
 * @param featureKey - Feature key (e.g. 'sessions', 'alerts', 'reports')
 * @returns Resolved with the API response message; rejects on network or server error
 */
export async function registerNotifyMe(featureKey: string): Promise<RegisterNotifyMeResponse> {
  const { data } = await apiClient.post<RegisterNotifyMeResponse>('/notify-me', {
    featureKey,
  });
  return data;
}
