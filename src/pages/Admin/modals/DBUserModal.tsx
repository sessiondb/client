import React, { useState } from 'react';
import { X, Shield, Save, UserCheck, Link as LinkIcon } from 'lucide-react';
import { DBUser, useUpdateDBUser, useLinkPlatformUser } from '../../../hooks/useDBUsers';
import { useUsers } from '../../../hooks/useUsers';
import { User } from '../../../context/AuthContext';
import styles from '../Admin.module.css';

interface DBUserModalProps {
    user: DBUser;
    onClose: () => void;
}

const DBUserModal: React.FC<DBUserModalProps> = ({ user, onClose }) => {
    const [role, setRole] = useState(user.role);
    const [linkedUserId, setLinkedUserId] = useState<string>(user.linkedUserId ?? '');
    const [customRole, setCustomRole] = useState('');

    const updateDBUserMutation = useUpdateDBUser();
    const linkPlatformUserMutation = useLinkPlatformUser();
    const { data: platformUsers = [] } = useUsers();

    const effectiveRole = role === 'custom' ? customRole : role;

    const handleSave = async () => {
        try {
            // 1. Update role if changed
            if (effectiveRole !== user.role) {
                await updateDBUserMutation.mutateAsync({ id: user.id, role: effectiveRole });
            }

            // 2. Link / unlink platform user if changed
            const currentLinked = user.linkedUserId ?? '';
            if (linkedUserId !== currentLinked) {
                await linkPlatformUserMutation.mutateAsync({
                    dbUserId: user.id,
                    platformUserId: linkedUserId || null,
                });
            }

            onClose();
        } catch (error) {
            console.error('Failed to update DB user', error);
        }
    };

    const isSaving = updateDBUserMutation.isPending || linkPlatformUserMutation.isPending;

    const commonRoles = [
        'read_only',
        'read_write',
        'db_owner',
        'db_accessadmin',
        'db_securityadmin',
        'db_ddladmin',
    ];

    return (
        <div className={styles.modalOverlay}>
            <div className={`${styles.modalContent} card`} style={{ maxWidth: '520px', width: '95%' }}>
                <div className={styles.modalHeader}>
                    <h3>Update Database User</h3>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {/* Header info */}
                    <div className={styles.detailsHeaderSection}>
                        <div className={styles.detailAvatar}>{user.username.charAt(0).toUpperCase()}</div>
                        <div className={styles.detailMainInfo}>
                            <h4>{user.username}</h4>
                            <p>{user.instanceName}</p>
                            <div className={styles.statusRow}>
                                <span className={user.status === 'active' ? styles.statusActive : styles.statusInactive}>
                                    {user.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Role selector */}
                    <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                        <label>Database Role</label>
                        <div className={styles.inputWithAction}>
                            <Shield
                                size={18}
                                className={styles.icon}
                                style={{ position: 'absolute', left: '10px', top: '38px', color: 'var(--text-muted)' }}
                            />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                style={{ paddingLeft: '36px' }}
                            >
                                <option value="" disabled>Select a role</option>
                                {commonRoles.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                                <option value="custom">Custom...</option>
                            </select>
                        </div>
                        {role === 'custom' && (
                            <input
                                type="text"
                                placeholder="Enter custom role name"
                                value={customRole}
                                onChange={(e) => setCustomRole(e.target.value)}
                                style={{ marginTop: '0.5rem' }}
                            />
                        )}
                    </div>

                    {/* Link Platform User */}
                    <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <UserCheck size={15} />
                            Link Platform User
                        </label>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 8px' }}>
                            Associate a SessionDB platform user with this database account.
                        </p>
                        <div className={styles.inputWithAction}>
                            <LinkIcon
                                size={16}
                                style={{ position: 'absolute', left: '10px', top: '38px', color: 'var(--text-muted)' }}
                            />
                            <select
                                value={linkedUserId}
                                onChange={(e) => setLinkedUserId(e.target.value)}
                                style={{ paddingLeft: '34px' }}
                            >
                                <option value="">— No linked user —</option>
                                {(platformUsers as User[]).map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={handleSave} className="btn-primary" disabled={isSaving}>
                        {isSaving ? 'Saving...' : (
                            <>
                                <Save size={16} /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DBUserModal;
