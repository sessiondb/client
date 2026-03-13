// Copyright (c) 2026 Sai Mouli Bandari. Licensed under Business Source License 1.1.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Database, RefreshCw } from 'lucide-react';
import { RequestAccessForm } from '../../components/RequestAccessForm';
import styles from './NoAccess.module.css';

/**
 * No-access page shown when the user has no permissions to any instance.
 * Offers "Request access" (opens shared form) and "Check my access" (refetch and redirect if access exists).
 */
export default function NoAccess() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSuccessMessage, setRequestSuccessMessage] = useState<string | null>(null);

  const handleRefreshAccess = async () => {
    await queryClient.refetchQueries({ queryKey: ['instances'] });
    const data = queryClient.getQueryData<any[]>(['instances']);
    const list = Array.isArray(data) ? data : [];
    if (list.length > 0) {
      navigate('/query', { replace: true });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <Database size={48} className={styles.icon} />
        </div>
        <h1 className={styles.title}>You don&apos;t have access to any database yet</h1>
        <p className={styles.subtitle}>
          Request access from an administrator, or wait until you&apos;re granted permissions.
        </p>
        {requestSuccessMessage && (
          <div className={styles.successMessage}>{requestSuccessMessage}</div>
        )}
        <div className={styles.actions}>
          <button type="button" className={styles.primaryBtn} onClick={() => setShowRequestForm(true)}>
            Request access
          </button>
          <button type="button" className={styles.secondaryBtn} onClick={handleRefreshAccess}>
            <RefreshCw size={16} />
            Check my access
          </button>
        </div>
      </div>

      {showRequestForm && (
        <RequestAccessForm
          asModal
          onClose={() => setShowRequestForm(false)}
          onSuccess={() => {
            setShowRequestForm(false);
            setRequestSuccessMessage('Request submitted. An administrator will review it.');
          }}
        />
      )}
    </div>
  );
}
