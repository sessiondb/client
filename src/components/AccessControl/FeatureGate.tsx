// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import React, { ReactNode, useState } from 'react';
import { useAccess } from '../../context/AccessContext';
import { Lock } from 'lucide-react';
import { registerNotifyMe } from '../../api/notifyMe';

interface FeatureGateProps {
    featureKey: string;
    children: ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ featureKey, children }) => {
    const { isFeatureEnabled } = useAccess();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string>('');

    const handleNotifyMe = async () => {
        setStatus('loading');
        setMessage('');
        try {
            const res = await registerNotifyMe(featureKey);
            setMessage(res.message ?? "Thanks! We'll notify you when this feature is ready.");
            setStatus('success');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Request failed. Please try again.';
            setMessage(msg);
            setStatus('error');
        }
    };

    if (!isFeatureEnabled(featureKey)) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem',
                textAlign: 'center',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                border: '1px dashed var(--border)',
                margin: '2rem 1rem'
            }}>
                <div style={{
                    background: 'rgba(168, 85, 247, 0.1)',
                    color: '#a855f7',
                    padding: '1rem',
                    borderRadius: '50%',
                    marginBottom: '1rem'
                }}>
                    <Lock size={32} />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
                    Coming soon
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '450px' }}>
                    The <strong>{featureKey.replace(/_/g, ' ')}</strong> feature is on our roadmap and not yet available. We’re building it next.
                </p>
                {message && (
                    <p style={{
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        color: status === 'error' ? 'var(--error, #dc3545)' : 'var(--text-muted)'
                    }}>
                        {message}
                    </p>
                )}
                <button
                    type="button"
                    className="btn-primary"
                    onClick={handleNotifyMe}
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? 'Registering…' : 'Notify me when this is ready'}
                </button>
            </div>
        );
    }

    return <>{children}</>;
};
