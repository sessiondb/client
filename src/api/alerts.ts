// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
/**
 * Alert API (Phase 5 — premium). Rules and events.
 * @module api/alerts
 */
import apiClient from './client';

export type AlertRule = {
  id: string;
  name: string;
  description?: string;
  eventSource: string;
  condition?: Record<string, unknown>;
  severity: string;
  isEnabled: boolean;
  channels?: unknown;
  createdAt?: string;
};

export type AlertEvent = {
  id: string;
  ruleId: string;
  severity: string;
  title: string;
  description?: string;
  status: string;
  source?: string;
  createdAt?: string;
};

export type CreateAlertRuleBody = {
  name: string;
  description?: string;
  eventSource: string;
  condition?: Record<string, unknown>;
  severity?: string;
  isEnabled?: boolean;
  channels?: unknown;
};

export async function getAlertRules(): Promise<AlertRule[]> {
  const { data } = await apiClient.get<AlertRule[]>('/alerts/rules');
  return data;
}

export async function getAlertRule(id: string): Promise<AlertRule> {
  const { data } = await apiClient.get<AlertRule>(`/alerts/rules/${id}`);
  return data;
}

export async function createAlertRule(
  body: CreateAlertRuleBody
): Promise<AlertRule> {
  const { data } = await apiClient.post<AlertRule>('/alerts/rules', body);
  return data;
}

export async function updateAlertRule(
  id: string,
  body: Partial<CreateAlertRuleBody>
): Promise<AlertRule> {
  const { data } = await apiClient.put<AlertRule>(`/alerts/rules/${id}`, body);
  return data;
}

export async function deleteAlertRule(id: string): Promise<void> {
  await apiClient.delete(`/alerts/rules/${id}`);
}

export type GetAlertEventsParams = {
  ruleId?: string;
  status?: string;
};

export async function getAlertEvents(
  params?: GetAlertEventsParams
): Promise<AlertEvent[]> {
  const { data } = await apiClient.get<AlertEvent[]>('/alerts/events', { params });
  return data;
}
