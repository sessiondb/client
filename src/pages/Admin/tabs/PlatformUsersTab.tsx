// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import React, { useState } from 'react';
import { Search, Edit2, Shield, Trash2, Key, Eye } from 'lucide-react';
import { User } from '../../../context/AuthContext';
import styles from '../Admin.module.css';

interface PlatformUsersTabProps {
    users: User[];
    isLoading: boolean;
    isError: boolean;
    error: any;
    onViewDetails: (user: User) => void;
    onEdit: (user: User) => void;
    onResetPassword: (user: User) => void;
    onDelete: (id: string, name: string) => void;
}

const PlatformUsersTab: React.FC<PlatformUsersTabProps> = ({
    users,
    isLoading,
    isError,
    error,
    onViewDetails,
    onEdit,
    onResetPassword,
    onDelete
}) => {
    const [search, setSearch] = useState('');

    const filteredUsers = users.filter((u: User) => {
        const roleName = typeof u.role === 'string' ? u.role : u.role?.name || '';
        return (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
            roleName.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div>
            <div className={styles.filtersArea}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name or role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading && <div className={styles.loadingState}>Loading users...</div>}
            {isError && <div className={styles.errorState}>Error loading users: {(error as any)?.message || 'Unknown error'}</div>}

            {!isLoading && !isError && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Permissions</th>
                                <th>Session Based</th>
                                <th>Status</th>
                                <th style={{ width: '120px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user: User) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className={styles.userInfo}>
                                            <div className={styles.avatarSmall}>{(user.name || '?').charAt(0).toUpperCase()}</div>
                                            <span>{user.name || 'Unknown User'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.roleTag}>
                                            <Shield size={14} />
                                            {typeof user.role === 'string' ? user.role : user.role?.name || 'No Role'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.permsSummary}>
                                            {(user.permissions || []).length > 0 ? (
                                                (user.permissions || []).slice(0, 2).map((p: any, i: number) => (
                                                    <span key={i} className={styles.permBadge}>
                                                        {p.database}.{p.table}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className={styles.noPerms}>No specific permissions</span>
                                            )}
                                            {(user.permissions || []).length > 2 && (
                                                <span className={styles.morePerms}>+{(user.permissions || []).length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={user.isSessionBased ? styles.statusActive : styles.statusInactive}>
                                            {user.isSessionBased ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={user.status === 'active' ? styles.statusActive : styles.statusInactive}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button className={styles.iconBtn} onClick={() => onViewDetails(user)} title="View Details">
                                                <Eye size={16} />
                                            </button>
                                            <button className={styles.iconBtn} onClick={() => onEdit(user)} title="Edit Privileges">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className={styles.iconBtn} onClick={() => onResetPassword(user)} title="Reset Password">
                                                <Key size={16} />
                                            </button>
                                            <button className={styles.iconBtn} onClick={() => onDelete(user.id, user.name)} title="Delete User">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PlatformUsersTab;
