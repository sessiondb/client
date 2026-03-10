// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
/**
 * Report API (Phase 6 — premium). Definitions and executions.
 * @module api/reports
 */
import apiClient from './client';

export type ReportDefinition = {
  id: string;
  name: string;
  description?: string;
  dataSources?: unknown;
  filters?: unknown;
  scheduleCron?: string | null;
  deliveryChannels?: unknown;
  format: string;
  isEnabled: boolean;
  lastRunAt?: string | null;
  createdAt?: string;
};

export type ReportExecution = {
  id: string;
  definitionId: string;
  status: string;
  startedAt: string;
  completedAt?: string | null;
  resultUrl?: string;
  error?: string;
};

export type CreateReportDefinitionBody = {
  name: string;
  description?: string;
  dataSources?: unknown;
  filters?: unknown;
  scheduleCron?: string | null;
  deliveryChannels?: unknown;
  format?: string;
  isEnabled?: boolean;
};

export async function getReportDefinitions(): Promise<ReportDefinition[]> {
  const { data } = await apiClient.get<ReportDefinition[]>('/reports/definitions');
  return data;
}

export async function getReportDefinition(
  id: string
): Promise<ReportDefinition> {
  const { data } = await apiClient.get<ReportDefinition>(
    `/reports/definitions/${id}`
  );
  return data;
}

export async function createReportDefinition(
  body: CreateReportDefinitionBody
): Promise<ReportDefinition> {
  const { data } = await apiClient.post<ReportDefinition>(
    '/reports/definitions',
    body
  );
  return data;
}

export async function updateReportDefinition(
  id: string,
  body: Partial<CreateReportDefinitionBody>
): Promise<ReportDefinition> {
  const { data } = await apiClient.put<ReportDefinition>(
    `/reports/definitions/${id}`,
    body
  );
  return data;
}

export async function deleteReportDefinition(id: string): Promise<void> {
  await apiClient.delete(`/reports/definitions/${id}`);
}

export async function runReport(
  definitionId: string
): Promise<ReportExecution> {
  const { data } = await apiClient.post<ReportExecution>(
    `/reports/definitions/${definitionId}/run`
  );
  return data;
}

export async function getReportExecutions(
  definitionId: string
): Promise<ReportExecution[]> {
  const { data } = await apiClient.get<ReportExecution[]>(
    `/reports/definitions/${definitionId}/executions`
  );
  return data;
}
