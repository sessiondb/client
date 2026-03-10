// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
/**
 * AI provider configuration page (Phase 3 BYOK).
 * GET/PUT /ai/config; never displays API key.
 */
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from './Admin.module.css';
import { getAIConfig, updateAIConfig, updateGlobalAIConfig, getAIUsage, getAdminAIUsage } from '../../api/ai';
import { getApiErrorMessage } from '../../api/errors';
import { useAccess } from '../../context/AccessContext';
import { Bot, Check, Loader2, Building2, BarChart3 } from 'lucide-react';

const PROVIDER_OPTIONS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'custom', label: 'Custom (OpenAI-compatible)' },
];

const SettingsAIConfig: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = useAccess();
  const isAdmin = hasPermission('instances:manage');

  const [providerType, setProviderType] = useState<string>('openai');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [modelName, setModelName] = useState('gpt-4o-mini');
  const [saveMessage, setSaveMessage] = useState<'success' | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [orgProviderType, setOrgProviderType] = useState<string>('openai');
  const [orgApiKey, setOrgApiKey] = useState('');
  const [orgBaseUrl, setOrgBaseUrl] = useState('');
  const [orgModelName, setOrgModelName] = useState('gpt-4o-mini');
  const [orgSaveMessage, setOrgSaveMessage] = useState<'success' | null>(null);
  const [orgFormError, setOrgFormError] = useState<string | null>(null);

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['aiConfig'],
    queryFn: getAIConfig,
  });

  const { data: usage } = useQuery({
    queryKey: ['aiUsage'],
    queryFn: getAIUsage,
  });

  const { data: adminUsage } = useQuery({
    queryKey: ['adminAIUsage'],
    queryFn: getAdminAIUsage,
    enabled: isAdmin,
  });

  useEffect(() => {
    if (config) {
      setProviderType(config.providerType ?? 'openai');
      setBaseUrl(config.baseUrl ?? '');
      setModelName(config.modelName ?? 'gpt-4o-mini');
    }
  }, [config]);

  const updateMutation = useMutation({
    mutationFn: updateAIConfig,
    onSuccess: () => {
      setSaveMessage('success');
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ['aiConfig'] });
      setApiKey('');
      setTimeout(() => setSaveMessage(null), 3000);
    },
    onError: (err) => {
      setFormError(getApiErrorMessage(err));
    },
  });

  const updateGlobalMutation = useMutation({
    mutationFn: updateGlobalAIConfig,
    onSuccess: () => {
      setOrgSaveMessage('success');
      setOrgFormError(null);
      queryClient.invalidateQueries({ queryKey: ['aiConfig'] });
      setOrgApiKey('');
      setTimeout(() => setOrgSaveMessage(null), 3000);
    },
    onError: (err) => {
      setOrgFormError(getApiErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!apiKey.trim()) {
      setFormError('API key is required to save.');
      return;
    }
    if (!modelName.trim()) {
      setFormError('Model name is required.');
      return;
    }
    updateMutation.mutate({
      providerType,
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim() || undefined,
      modelName: modelName.trim(),
    });
  };

  if (configLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>AI Configuration</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <Loader2 size={18} className="spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>AI Configuration</h1>
          <p className={styles.pageSubtitle}>
            Configure your AI provider for &quot;Generate SQL&quot; and &quot;Explain query&quot; (BYOK). Your API key is never stored in plain text on the server.
          </p>
        </div>
      </div>

      {config?.configured && (
        <div className={styles.formSection} style={{ marginBottom: '24px' }}>
          <div className={styles.detailsHeader}>
            <Check size={18} style={{ color: 'var(--success)' }} />
            <span>AI is configured</span>
            {config.source === 'user' && (
              <span style={{ marginLeft: '12px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                Using your key
              </span>
            )}
            {config.source === 'global' && (
              <span style={{ marginLeft: '12px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                Using organization key
              </span>
            )}
          </div>
          <p className={styles.pageSubtitle} style={{ marginTop: '8px' }}>
            Provider: <strong>{config.providerType ?? '—'}</strong>
            {config.modelName && <> · Model: <strong>{config.modelName}</strong></>}
            {config.baseUrl && <> · Base URL: <strong>{config.baseUrl}</strong></>}
          </p>
        </div>
      )}

      {isAdmin && (
        <div className={styles.formSection} style={{ marginBottom: '24px' }}>
          <div className={styles.detailsHeader}>
            <Building2 size={18} />
            <span>Organization AI config</span>
          </div>
          <p className={styles.pageSubtitle} style={{ marginTop: '8px' }}>
            Set a shared API key for all users who have not set their own. Users can override with their own key.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setOrgFormError(null);
              if (!orgApiKey.trim()) {
                setOrgFormError('API key is required.');
                return;
              }
              if (!orgModelName.trim()) {
                setOrgFormError('Model name is required.');
                return;
              }
              updateGlobalMutation.mutate({
                providerType: orgProviderType,
                apiKey: orgApiKey.trim(),
                baseUrl: orgBaseUrl.trim() || undefined,
                modelName: orgModelName.trim(),
              });
            }}
          >
            <div className={styles.formGroup}>
              <label htmlFor="org-ai-provider">Provider type</label>
              <select
                id="org-ai-provider"
                value={orgProviderType}
                onChange={(e) => setOrgProviderType(e.target.value)}
              >
                {PROVIDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="org-ai-apikey">API key</label>
              <input
                id="org-ai-apikey"
                type="password"
                value={orgApiKey}
                onChange={(e) => setOrgApiKey(e.target.value)}
                placeholder="Enter organization API key"
                autoComplete="off"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="org-ai-baseurl">Base URL (optional)</label>
              <input
                id="org-ai-baseurl"
                type="url"
                value={orgBaseUrl}
                onChange={(e) => setOrgBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="org-ai-model">Model name</label>
              <input
                id="org-ai-model"
                type="text"
                value={orgModelName}
                onChange={(e) => setOrgModelName(e.target.value)}
                placeholder="e.g. gpt-4o-mini"
              />
            </div>
            {orgFormError && (
              <div style={{ color: 'var(--error)', marginBottom: '12px', fontSize: '14px' }}>{orgFormError}</div>
            )}
            {orgSaveMessage === 'success' && (
              <div style={{ color: 'var(--success)', marginBottom: '12px', fontSize: '14px' }}>Organization config saved.</div>
            )}
            <div className={styles.formGroup}>
              <button type="submit" className="btn-primary" disabled={updateGlobalMutation.isPending}>
                {updateGlobalMutation.isPending ? (
                  <><Loader2 size={16} className="spin" style={{ marginRight: '8px' }} />Saving...</>
                ) : (
                  'Save organization config'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.formSection}>
        <div className={styles.detailsHeader}>
          <Bot size={18} />
          <span>Your AI config</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="ai-provider">Provider type</label>
            <select
              id="ai-provider"
              value={providerType}
              onChange={(e) => setProviderType(e.target.value)}
            >
              {PROVIDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="ai-apikey">API key</label>
            <input
              id="ai-apikey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={config?.configured ? 'Leave blank to keep current' : 'Enter your API key'}
              autoComplete="off"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="ai-baseurl">Base URL (optional)</label>
            <input
              id="ai-baseurl"
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="ai-model">Model name</label>
            <input
              id="ai-model"
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="e.g. gpt-4o-mini"
            />
          </div>

          {formError && (
            <div style={{ color: 'var(--error)', marginBottom: '12px', fontSize: '14px' }}>{formError}</div>
          )}
          {saveMessage === 'success' && (
            <div style={{ color: 'var(--success)', marginBottom: '12px', fontSize: '14px' }}>Saved.</div>
          )}

          <div className={styles.formGroup}>
            <button
              type="submit"
              className="btn-primary"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 size={16} className="spin" style={{ marginRight: '8px' }} />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className={styles.formSection} style={{ marginTop: '24px' }}>
        <div className={styles.detailsHeader}>
          <BarChart3 size={18} />
          <span>AI usage</span>
          {usage != null && (
            <span style={{ marginLeft: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
              Your requests (last 30 days): <strong>{usage.total}</strong>
            </span>
          )}
        </div>
        {isAdmin && adminUsage != null && (
          <>
            <p className={styles.pageSubtitle} style={{ marginTop: '8px' }}>
              Global (last 30 days): <strong>{adminUsage.global.count}</strong> requests
              {adminUsage.global.inputTokens + adminUsage.global.outputTokens > 0 && (
                <> · Input: {adminUsage.global.inputTokens} · Output: {adminUsage.global.outputTokens} tokens</>
              )}
            </p>
            {adminUsage.byUser.length > 0 && (
              <div style={{ marginTop: '12px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '8px' }}>User ID</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>Requests</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>Input tokens</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>Output tokens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsage.byUser.map((row: { UserID: string; Count: number; Input: number; Output: number }) => (
                      <tr key={row.UserID} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '8px' }}><code>{row.UserID}</code></td>
                        <td style={{ textAlign: 'right', padding: '8px' }}>{row.Count}</td>
                        <td style={{ textAlign: 'right', padding: '8px' }}>{row.Input}</td>
                        <td style={{ textAlign: 'right', padding: '8px' }}>{row.Output}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsAIConfig;
