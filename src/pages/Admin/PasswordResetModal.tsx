// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import React, { useState } from 'react';
import { X, RefreshCw, Key } from 'lucide-react';
import { User } from '../../context/AuthContext';
import styles from './Admin.module.css';

interface PasswordResetModalProps {
    user: User;
    onClose: () => void;
    onReset: (userId: string, newPassword: string) => void;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ user, onClose, onReset }) => {
    const [password, setPassword] = useState('');

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        let generated = '';
        for (let i = 0; i < 12; i++) {
            generated += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(generated);
    };

    const handleReset = () => {
        if (!password) {
            alert('Please enter or generate a password');
            return;
        }
        onReset(user.id, password);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={`${styles.modalContent} card`} style={{ maxWidth: '450px' }}>
                <div className={styles.modalHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className={styles.roleIconCompact} style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
                            <Key size={18} />
                        </div>
                        <h3>Reset Platform Password</h3>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
                </div>

                <div className={styles.modalBody}>
                    <p className={styles.pageSubtitle} style={{ marginBottom: '1.5rem' }}>
                        Set a new login password for <strong>{user.name}</strong>. This will not affect their database credentials.
                    </p>

                    <div className={styles.formGroup}>
                        <label>New Password</label>
                        <div className={styles.inputWithAction}>
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter or generate secure password"
                                autoFocus
                            />
                            <button
                                type="button"
                                className={styles.actionBtn}
                                onClick={generatePassword}
                                title="Auto-generate password"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={handleReset} className="btn-primary">Update Password</button>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetModal;
