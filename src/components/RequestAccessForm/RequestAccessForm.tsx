// Copyright (c) 2026 Sai Mouli Bandari. Licensed under Business Source License 1.1.
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useInstance } from '../../context/InstanceContext';
import { createRequest, type RequestedItem } from '../../api/requests';
import styles from './RequestAccessForm.module.css';

const PRIVILEGE_OPTIONS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] as const;

export interface RequestAccessFormProps {
  /** Prefill instance when opened from context (e.g. query editor). */
  initialInstanceId?: string;
  /** Prefill database name. */
  initialDatabase?: string;
  /** Prefill single table; will be added to tables list. */
  initialTable?: string;
  /** Called after successful submit; e.g. close modal and show message. */
  onSuccess?: () => void;
  /** Called when user cancels (e.g. close button). */
  onClose?: () => void;
  /** If true, render inside a modal overlay with header and close button. */
  asModal?: boolean;
}

/**
 * Shared "Request DB Access" form. Builds requestedItems (one per table) and submits via POST /v1/requests.
 * Uses instances from InstanceContext; supports optional prefill from query editor.
 */
export function RequestAccessForm({
  initialInstanceId,
  initialDatabase = '',
  initialTable,
  onSuccess,
  onClose,
  asModal = true
}: RequestAccessFormProps) {
  const { instances, isLoading: instancesLoading } = useInstance();
  const [instanceId, setInstanceId] = useState('');
  const [database, setDatabase] = useState('');
  const [tables, setTables] = useState<string[]>(['']);
  const [privileges, setPrivileges] = useState<string[]>(['SELECT']);
  const [description, setDescription] = useState('');
  const [justification, setJustification] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialInstanceId) setInstanceId(initialInstanceId);
  }, [initialInstanceId]);

  useEffect(() => {
    if (initialDatabase) setDatabase(initialDatabase);
  }, [initialDatabase]);

  useEffect(() => {
    if (initialTable) setTables([initialTable]);
  }, [initialTable]);

  useEffect(() => {
    if (!instanceId && instances.length > 0) setInstanceId(instances[0].id);
  }, [instances, instanceId]);

  const togglePrivilege = (priv: string) => {
    setPrivileges((prev) =>
      prev.includes(priv) ? prev.filter((p) => p !== priv) : [...prev, priv]
    );
  };

  const addTableRow = () => setTables((prev) => [...prev, '']);
  const setTableAt = (index: number, value: string) => {
    setTables((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };
  const removeTableAt = (index: number) => {
    setTables((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const tableList = tables.map((t) => t.trim()).filter(Boolean);
    if (!instanceId || !database.trim() || tableList.length === 0 || privileges.length === 0 || !description.trim() || !justification.trim()) {
      setSubmitError('Please fill instance, database, at least one table, privileges, description and justification.');
      return;
    }
    const requestedItems: RequestedItem[] = tableList.map((table) => ({
      instanceId,
      database: database.trim(),
      table,
      privileges: [...privileges]
    }));
    setIsSubmitting(true);
    try {
      await createRequest({
        type: 'DB_ACCESS',
        description: description.trim(),
        justification: justification.trim(),
        requestedItems
      });
      onSuccess?.();
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || err?.message || 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label>Instance</label>
        <select
          value={instanceId}
          onChange={(e) => setInstanceId(e.target.value)}
          required
          disabled={instancesLoading}
        >
          <option value="">Select instance</option>
          {instances.map((inst) => (
            <option key={inst.id} value={inst.id}>{inst.name}</option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label>Database</label>
        <input
          type="text"
          value={database}
          onChange={(e) => setDatabase(e.target.value)}
          placeholder="Database name"
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label>Tables</label>
        {tables.map((table, i) => (
          <div key={i} className={styles.tableRow}>
            <input
              type="text"
              value={table}
              onChange={(e) => setTableAt(i, e.target.value)}
              placeholder="Table name"
            />
            <button type="button" onClick={() => removeTableAt(i)} className={styles.iconBtn} title="Remove table">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button type="button" onClick={addTableRow} className={styles.addRow}>
          <Plus size={16} /> Add table
        </button>
      </div>
      <div className={styles.formGroup}>
        <label>Privileges</label>
        <div className={styles.privileges}>
          {PRIVILEGE_OPTIONS.map((p) => (
            <label key={p} className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={privileges.includes(p)}
                onChange={() => togglePrivilege(p)}
              />
              {p}
            </label>
          ))}
        </div>
      </div>
      <div className={styles.formGroup}>
        <label>Description (required)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description of the access needed"
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label>Justification (required)</label>
        <textarea
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          placeholder="Why you need this access"
          rows={3}
          required
        />
      </div>
      {submitError && <div className={styles.error}>{submitError}</div>}
      <div className={styles.actions}>
        {onClose && (
          <button type="button" onClick={onClose} className={styles.secondaryBtn}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={isSubmitting} className={styles.primaryBtn}>
          {isSubmitting ? 'Submitting…' : 'Submit request'}
        </button>
      </div>
    </form>
  );

  if (asModal && onClose) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h3>Request DB Access</h3>
            <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Close">
              <X size={20} />
            </button>
          </div>
          <div className={styles.body}>{formContent}</div>
        </div>
      </div>
    );
  }

  return formContent;
}

export default RequestAccessForm;
