// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
/**
 * Sessions page (Phase 4 — premium). Start/end ephemeral credential sessions per instance.
 */
import React, { useEffect, useState } from 'react';
import {
  startSession,
  endSession,
  getActiveSession,
  type ActiveSessionResponse,
} from '../../api/session';
import { getApiErrorMessage, getApiErrorCode } from '../../api/errors';
import { useInstance } from '../../context/InstanceContext';
import styles from '../../pages/Admin/Admin.module.css';

const Sessions: React.FC = () => {
  const { instances, isLoading: instancesLoading } = useInstance();
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('');
  const [activeSession, setActiveSession] = useState<ActiveSessionResponse | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [ttlMinutes, setTtlMinutes] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (instances.length && !selectedInstanceId) {
      setSelectedInstanceId(instances[0].id);
    }
  }, [instances, selectedInstanceId]);

  const loadActiveSession = async () => {
    if (!selectedInstanceId) return;
    setError(null);
    try {
      const res = await getActiveSession(selectedInstanceId);
      setActiveSession(res);
    } catch (err) {
      const ax = err as { response?: { status?: number } };
      if (ax?.response?.status === 404) {
        setActiveSession({ active: false });
        return;
      }
      setError(getApiErrorMessage(err));
    }
  };

  useEffect(() => {
    if (selectedInstanceId) loadActiveSession();
    else setActiveSession(null);
  }, [selectedInstanceId]);

  const handleStartSession = async () => {
    if (!selectedInstanceId) return;
    setLoading(true);
    setError(null);
    setPassword(null);
    try {
      const res = await startSession(selectedInstanceId, ttlMinutes);
      setPassword(res.password);
      setActiveSession({
        active: true,
        sessionId: res.sessionId,
        dbUsername: res.dbUsername,
        expiresAt: res.expiresAt,
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession || !('sessionId' in activeSession)) return;
    setLoading(true);
    setError(null);
    try {
      await endSession(activeSession.sessionId);
      setActiveSession({ active: false });
      setPassword(null);
    } catch (err) {
      const code = getApiErrorCode(err);
      if (code === 'AUTH002' || code === 'Forbidden') {
        setError('You are not allowed to end this session.');
      } else {
        setError(getApiErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Sessions (Planned)</h1>
          <p className={styles.pageSubtitle}>Ephemeral credential sessions per instance</p>
        </div>
      </div>
      {error && (
        <div style={{ color: 'var(--error)', marginBottom: 12, fontSize: 14 }}>
          {error}
        </div>
      )}

      <div className={styles.formGroup}>
        <label>Instance</label>
        <select
          value={selectedInstanceId}
          onChange={(e) => setSelectedInstanceId(e.target.value)}
          disabled={loading || instancesLoading}
          style={{ minWidth: 200 }}
        >
          <option value="">Select instance</option>
          {instances.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
      </div>

      {activeSession && 'active' in activeSession && activeSession.active ? (
        <div style={{ border: '1px solid var(--border-subtle)', padding: 16, borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>Active session</h3>
          <p>DB user: <strong>{activeSession.dbUsername}</strong></p>
          <p>Expires: {activeSession.expiresAt}</p>
          {password && (
            <p style={{ marginTop: 8 }}>
              Password (copy now): <code style={{ background: 'var(--bg-subtle)', padding: 4, borderRadius: 4 }}>{password}</code>
            </p>
          )}
          <button type="button" onClick={handleEndSession} disabled={loading} className="btn-primary">
            End session
          </button>
        </div>
      ) : (
        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label>TTL (minutes)</label>
            <input
              type="number"
              min={1}
              value={ttlMinutes}
              onChange={(e) => setTtlMinutes(Number(e.target.value))}
              style={{ width: 100 }}
            />
          </div>
          <button
            type="button"
            onClick={handleStartSession}
            disabled={loading || !selectedInstanceId}
            className="btn-primary"
          >
            Start session
          </button>
        </div>
      )}
    </div>
  );
};

export default Sessions;
