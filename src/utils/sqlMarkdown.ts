// Copyright (c) 2026 Sai Mouli Bandari. Licensed under Business Source License 1.1.

/**
 * Strips markdown code fence (```sql or ```) from AI-generated SQL so the editor shows plain SQL.
 * @param sql - Raw string from generate SQL API (may contain markdown)
 * @returns Plain SQL with no code fences
 */
export function stripSqlFromMarkdown(sql: string): string {
  let s = (sql ?? '').trim();
  const sqlMatch = /^\s*```\s*sql\s*\n?([\s\S]*?)```\s*$/i.exec(s);
  if (sqlMatch) return sqlMatch[1].trim();
  const genericMatch = /^\s*```\s*\n?([\s\S]*?)```\s*$/.exec(s);
  if (genericMatch) return genericMatch[1].trim();
  return s;
}
