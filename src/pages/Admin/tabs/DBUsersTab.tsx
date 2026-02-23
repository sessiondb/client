import React, { useState } from 'react';
import { Search, Edit2, Database, Shield, Link as LinkIcon, ChevronDown, ChevronUp, Key } from 'lucide-react';
import { useDBUsers, DBUser, DBPrivilege } from '../../../hooks/useDBUsers';
import { useInstance } from '../../../context/InstanceContext';
import DBUserModal from '../modals/DBUserModal';
import styles from '../Admin.module.css';

/* ---- Inline expanded detail row ---- */
const PrivilegesPanel: React.FC<{ user: DBUser }> = ({ user }) => {
    const rolePrivileges = user.rolePrivileges ?? [];
    const directPrivileges = user.directPrivileges ?? [];

    const privilegeColor = (type: string) => {
        const t = type.toUpperCase();
        if (t === 'ALL') return { bg: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.25)' };
        if (['SELECT', 'READ'].includes(t)) return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' };
        if (['INSERT', 'UPDATE', 'DELETE', 'WRITE'].includes(t)) return { bg: 'rgba(249, 115, 22, 0.1)', color: '#f97316', border: '1px solid rgba(249, 115, 22, 0.2)' };
        if (t === 'EXECUTE') return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.2)' };
        return { bg: 'rgba(107, 114, 128, 0.1)', color: '#9ca3af', border: '1px solid rgba(107, 114, 128, 0.2)' };
    };

    const renderPrivilegeList = (list: DBPrivilege[], title: string, subtitle?: string) => (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                <Key size={14} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {title} {subtitle && <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: '4px' }}>— {subtitle}</span>}
                </span>
            </div>
            {list.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>No explicit grants in this section.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {list.map((p: DBPrivilege, idx: number) => {
                        const c = privilegeColor(p.type);
                        return (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', padding: '5px 0' }}>
                                <span style={{ fontFamily: 'monospace', color: 'var(--text)', minWidth: '180px' }}>{p.object}</span>
                                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, ...c }}>{p.type.toUpperCase()}</span>
                                {p.grantable && (
                                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                        WITH GRANT
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return (
        <tr>
            <td colSpan={7} style={{ padding: 0, background: 'var(--bg-secondary, rgba(0,0,0,0.25))', borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
                    {renderPrivilegeList(rolePrivileges, 'Role Privileges', `From role: ${user.role}`)}
                    {renderPrivilegeList(directPrivileges, 'Direct Privileges', 'User-level grants')}
                    {rolePrivileges.length === 0 && directPrivileges.length === 0 && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>No privileges recorded for this user.</p>
                    )}
                </div>
            </td>
        </tr>
    );
};

/* ---- Main tab ---- */
const DBUsersTab: React.FC = () => {
    const { currentInstanceId, currentInstance } = useInstance();
    const [search, setSearch] = useState('');
    const [editingUser, setEditingUser] = useState<DBUser | undefined>(undefined);
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

    const { data: dbUsers = [], isLoading, isError, error } = useDBUsers(currentInstanceId ?? undefined);

    const filteredUsers = dbUsers.filter((u: DBUser) =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.instanceName.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );

    const toggleExpand = (id: string) =>
        setExpandedUserId(prev => (prev === id ? null : id));

    return (
        <div>
            {/* Context label */}
            {currentInstance && (
                <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Database size={14} />
                    Showing DB users for <strong style={{ color: 'var(--text)' }}>{currentInstance.name}</strong>
                    &nbsp;— change the instance from the selector in the top bar.
                </div>
            )}

            {/* Search */}
            <div className={styles.filtersArea}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by username, instance or role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading && <div className={styles.loadingState}>Loading database users...</div>}
            {isError && (
                <div className={styles.errorState}>
                    Error loading DB users: {(error as any)?.message || 'Unknown error'}
                </div>
            )}

            {!isLoading && !isError && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>DB Username</th>
                                <th>Instance</th>
                                <th>Role</th>
                                <th>Linked User</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th style={{ width: '120px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user: DBUser) => {
                                    const isExpanded = expandedUserId === user.id;
                                    return (
                                        <React.Fragment key={user.id}>
                                            <tr>
                                                <td>
                                                    <div className={styles.userInfo}>
                                                        <div
                                                            className={styles.avatarSmall}
                                                            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                                                        >
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span style={{ fontFamily: 'monospace' }}>{user.username}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.roleTag} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                                        <Database size={14} />
                                                        {user.instanceName}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.roleTag}>
                                                        <Shield size={14} />
                                                        {user.role}
                                                    </div>
                                                </td>
                                                <td>
                                                    {user.linkedUserName ? (
                                                        <div className={styles.roleTag} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                                            <LinkIcon size={13} />
                                                            {user.linkedUserName}
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={user.status === 'active' ? styles.statusActive : styles.statusInactive}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <div className={styles.actions}>
                                                        {/* View More / Less */}
                                                        <button
                                                            className={styles.iconBtn}
                                                            onClick={() => toggleExpand(user.id)}
                                                            title={isExpanded ? 'Collapse' : 'View Privileges'}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.75rem' }}
                                                        >
                                                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                            {isExpanded ? 'Less' : 'More'}
                                                        </button>
                                                        {/* Edit */}
                                                        <button
                                                            className={styles.iconBtn}
                                                            onClick={() => setEditingUser(user)}
                                                            title="Edit / Link User"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expandable privileges row */}
                                            {isExpanded && <PrivilegesPanel user={user} />}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                                        {currentInstance
                                            ? `No database users found for "${currentInstance.name}".`
                                            : 'No database users found matching your search.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {editingUser && (
                <DBUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(undefined)}
                />
            )}
        </div>
    );
};

export default DBUsersTab;
