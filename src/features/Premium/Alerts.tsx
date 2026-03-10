// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
/**
 * Alerts page (Phase 5 — premium). Rules CRUD and events list.
 */
import React, { useEffect, useState } from 'react';
import {
  getAlertRules,
  getAlertEvents,
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
  type AlertRule,
  type AlertEvent,
  type CreateAlertRuleBody,
} from '../../api/alerts';
import { getApiErrorMessage } from '../../api/errors';
import styles from '../../pages/Admin/Admin.module.css';

const Alerts: React.FC = () => {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAlertRuleBody>({
    name: '',
    description: '',
    eventSource: 'query_execution',
    condition: { metric: 'duration_ms', op: '>', value: 5000 },
    severity: 'medium',
    isEnabled: true,
  });

  const loadRules = async () => {
    try {
      const list = await getAlertRules();
      setRules(list);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const loadEvents = async () => {
    try {
      const list = await getAlertEvents(
        filterStatus ? { status: filterStatus } : undefined
      );
      setEvents(list);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  useEffect(() => {
    loadEvents();
  }, [filterStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await updateAlertRule(editingId, form);
      } else {
        await createAlertRule(form);
      }
      setFormOpen(false);
      setEditingId(null);
      setForm({
        name: '',
        description: '',
        eventSource: 'query_execution',
        condition: { metric: 'duration_ms', op: '>', value: 5000 },
        severity: 'medium',
        isEnabled: true,
      });
      loadRules();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this rule?')) return;
    setLoading(true);
    setError(null);
    try {
      await deleteAlertRule(id);
      loadRules();
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
          <h1 className={styles.pageTitle}>Alerts (Premium)</h1>
          <p className={styles.pageSubtitle}>Alert rules and events</p>
        </div>
      </div>
      {error && (
        <div style={{ color: 'var(--error)', marginBottom: 12, fontSize: 14 }}>
          {error}
        </div>
      )}

      <section className={styles.formSection} style={{ marginBottom: 32 }}>
        <h2 style={{ marginTop: 0 }}>Rules</h2>
        <button
          type="button"
          onClick={() => {
            setFormOpen(true);
            setEditingId(null);
          }}
          className="btn-primary"
          style={{ marginBottom: 12 }}
        >
          Add rule
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
              <label>Event source</label>
              <select
                value={form.eventSource}
                onChange={(e) =>
                  setForm((f) => ({ ...f, eventSource: e.target.value }))}
              >
                <option value="query_execution">query_execution</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Condition (JSON)</label>
              <input
                style={{ width: '100%' }}
                value={JSON.stringify(form.condition ?? {})}
                onChange={(e) => {
                  try {
                    setForm((f) => ({
                      ...f,
                      condition: JSON.parse(e.target.value || '{}'),
                    }));
                  } catch {
                    // ignore invalid JSON while typing
                  }
                }}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Severity</label>
              <select
                value={form.severity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, severity: e.target.value }))}
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="critical">critical</option>
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
          {rules.map((r) => (
            <li
              key={r.id}
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                padding: 8,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>
                {r.name} — {r.eventSource} ({r.severity}) {r.isEnabled ? '✓' : 'off'}
              </span>
              <span className={styles.actions}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => {
                    setForm({
                      ...r,
                      condition: (r.condition as Record<string, unknown>) ?? {},
                    });
                    setEditingId(r.id);
                    setFormOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => handleDelete(r.id)}
                  style={{ marginLeft: 4 }}
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.formSection}>
        <h2 style={{ marginTop: 0 }}>Events</h2>
        <div className={styles.formGroup}>
          <label>Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: 160 }}
          >
            <option value="">All</option>
            <option value="open">open</option>
            <option value="acknowledged">acknowledged</option>
            <option value="resolved">resolved</option>
          </select>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
          {events.map((ev) => (
            <li
              key={ev.id}
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                padding: 8,
              }}
            >
              <strong>{ev.title}</strong> — {ev.severity} / {ev.status} (
              {ev.createdAt ?? ''})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Alerts;
