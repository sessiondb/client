// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
/**
 * Reports page (Phase 6 — premium). Definitions CRUD, run, executions list.
 */
import React, { useEffect, useState } from 'react';
import {
  getReportDefinitions,
  createReportDefinition,
  updateReportDefinition,
  deleteReportDefinition,
  runReport,
  getReportExecutions,
  type ReportDefinition,
  type ReportExecution,
  type CreateReportDefinitionBody,
} from '../../api/reports';
import { getApiErrorMessage } from '../../api/errors';
import styles from '../../pages/Admin/Admin.module.css';

const Reports: React.FC = () => {
  const [definitions, setDefinitions] = useState<ReportDefinition[]>([]);
  const [executions, setExecutions] = useState<ReportExecution[]>([]);
  const [selectedDefId, setSelectedDefId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateReportDefinitionBody>({
    name: '',
    description: '',
    dataSources: {},
    format: 'csv',
    isEnabled: true,
  });

  const loadDefinitions = async () => {
    try {
      const list = await getReportDefinitions();
      setDefinitions(list);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const loadExecutions = async () => {
    if (!selectedDefId) return;
    try {
      const list = await getReportExecutions(selectedDefId);
      setExecutions(list);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  useEffect(() => {
    loadDefinitions();
  }, []);

  useEffect(() => {
    if (selectedDefId) loadExecutions();
    else setExecutions([]);
  }, [selectedDefId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await updateReportDefinition(editingId, form);
      } else {
        await createReportDefinition(form);
      }
      setFormOpen(false);
      setEditingId(null);
      setForm({
        name: '',
        description: '',
        dataSources: {},
        format: 'csv',
        isEnabled: true,
      });
      loadDefinitions();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this report definition?')) return;
    setLoading(true);
    setError(null);
    try {
      await deleteReportDefinition(id);
      if (selectedDefId === id) setSelectedDefId(null);
      loadDefinitions();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async (definitionId: string) => {
    setLoading(true);
    setError(null);
    try {
      await runReport(definitionId);
      if (selectedDefId === definitionId) loadExecutions();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Reports (Planned)</h1>
          <p className={styles.pageSubtitle}>Report definitions and executions</p>
        </div>
      </div>
      {error && (
        <div style={{ color: 'var(--error)', marginBottom: 12, fontSize: 14 }}>
          {error}
        </div>
      )}

      <section className={styles.formSection} style={{ marginBottom: 32 }}>
        <h2 style={{ marginTop: 0 }}>Definitions</h2>
        <button
          type="button"
          onClick={() => {
            setFormOpen(true);
            setEditingId(null);
          }}
          className="btn-primary"
          style={{ marginBottom: 12 }}
        >
          Add definition
        </button>
        {formOpen && (
          <form
            onSubmit={handleSubmit}
            className={styles.formSection}
            style={{ marginBottom: 16 }}
          >
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <input
                placeholder="Description"
                value={form.description ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Format</label>
              <select
                value={form.format}
                onChange={(e) =>
                  setForm((f) => ({ ...f, format: e.target.value }))}
              >
                <option value="csv">csv</option>
                <option value="json">json</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setEditingId(null);
              }}
              className={styles.actionBtn}
              style={{ marginLeft: 8 }}
            >
              Cancel
            </button>
          </form>
        )}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {definitions.map((d) => (
            <li
              key={d.id}
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                padding: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDefId(selectedDefId === d.id ? null : d.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration:
                      selectedDefId === d.id ? 'underline' : 'none',
                    color: 'inherit',
                    padding: 0,
                  }}
                >
                  {d.name}
                </button>{' '}
                — {d.format} {d.isEnabled ? '✓' : 'off'}
              </span>
              <span className={styles.actions}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleRun(d.id)}
                  disabled={loading}
                >
                  Run now
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => {
                    setForm({
                      name: d.name,
                      description: d.description,
                      dataSources: d.dataSources,
                      format: d.format,
                      isEnabled: d.isEnabled,
                    });
                    setEditingId(d.id);
                    setFormOpen(true);
                  }}
                  style={{ marginLeft: 4 }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => handleDelete(d.id)}
                  style={{ marginLeft: 4 }}
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {selectedDefId && (
        <section className={styles.formSection}>
          <h2 style={{ marginTop: 0 }}>Executions</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {executions.map((e) => (
              <li
                key={e.id}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  padding: 8,
                }}
              >
                {e.status} — started {e.startedAt}
                {e.completedAt && `, completed ${e.completedAt}`}
                {e.resultUrl && (
                  <a
                    href={e.resultUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ marginLeft: 8 }}
                  >
                    Result
                  </a>
                )}
                {e.error && (
                  <span style={{ color: 'var(--error)', marginLeft: 8 }}>
                    {e.error}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default Reports;
