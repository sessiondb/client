// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
/**
 * Session API (Phase 4 — premium). Ephemeral credential sessions.
 * @module api/session
 */
import apiClient from './client';

export type StartSessionResponse = {
  sessionId: string;
  dbUsername: string;
  password: string;
  expiresAt: string;
};

export type ActiveSessionResponse =
  | { active: true; sessionId: string; dbUsername: string; expiresAt: string }
  | { active: false };

/**
 * Start an ephemeral credential session for an instance.
 * @param instanceId - Target instance UUID
 * @param ttlMinutes - Optional TTL in minutes
 * @returns Session credentials (password shown once)
 */
export async function startSession(
  instanceId: string,
  ttlMinutes?: number
): Promise<StartSessionResponse> {
  const { data } = await apiClient.post<StartSessionResponse>('/sessions/start', {
    instanceId,
    ttlMinutes,
  });
  return data;
}

/**
 * End an active session by ID.
 * @param sessionId - Session UUID
 */
export async function endSession(sessionId: string): Promise<void> {
  await apiClient.post(`/sessions/${sessionId}/end`);
}

/**
 * Get the active session for the current user on an instance.
 * @param instanceId - Instance UUID
 * @returns Active session or { active: false }
 */
export async function getActiveSession(
  instanceId: string
): Promise<ActiveSessionResponse> {
  const { data } = await apiClient.get<ActiveSessionResponse>('/sessions/active', {
    params: { instanceId },
  });
  return data;
}
