import React, { useState } from 'react';
import { Search, Database, Users, ChevronDown, ChevronUp, Key, Lock } from 'lucide-react';
import { useDBRoles, DBRole } from '../../../hooks/useDBRoles';
import { DBPrivilege } from '../../../hooks/useDBUsers';
import { useInstance } from '../../../context/InstanceContext';
import styles from '../Admin.module.css';

/* ---- Inline expanded privileges panel ---- */
const DBRolePrivilegesPanel: React.FC<{ role: DBRole }> = ({ role }) => {
    const privileges = role.privileges ?? [];

    const privilegeColor = (type: string) => {
        const t = type.toUpperCase();
        if (t === 'ALL') return { bg: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.25)' };
        if (['SELECT', 'READ'].includes(t)) return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' };
        if (['INSERT', 'UPDATE', 'DELETE', 'WRITE'].includes(t)) return { bg: 'rgba(249, 115, 22, 0.1)', color: '#f97316', border: '1px solid rgba(249, 115, 22, 0.2)' };
        if (t === 'EXECUTE') return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.2)' };
        return { bg: 'rgba(107, 114, 128, 0.1)', color: '#9ca3af', border: '1px solid rgba(107, 114, 128, 0.2)' };
    };

    return (
        <tr>
            <td colSpan={6} style={{ padding: 0, background: 'var(--bg-secondary, rgba(0,0,0,0.25))', borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                        <Key size={14} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Granted Privileges
                        </span>
                    </div>
                    {privileges.length === 0 ? (
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                            No explicit privileges defined for this role.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {privileges.map((p: DBPrivilege, idx: number) => {
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
            </td>
        </tr>
    );
};

/* ---- Main DB Roles tab ---- */
const DBRolesTab: React.FC = () => {
    const { currentInstanceId, currentInstance } = useInstance();
    const [search, setSearch] = useState('');
    const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);

    const { data: dbRoles = [], isLoading, isError, error } = useDBRoles(currentInstanceId ?? undefined);

    const filteredRoles = dbRoles.filter((r: DBRole) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.dbKey.toLowerCase().includes(search.toLowerCase())
    );

    const toggleExpand = (id: string) =>
        setExpandedRoleId(prev => (prev === id ? null : id));

    return (
        <div>
            {/* Instance context label */}
            {currentInstance && (
                <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Database size={14} />
                    Showing DB roles for <strong style={{ color: 'var(--text)' }}>{currentInstance.name}</strong>
                    &nbsp;— change the instance from the selector in the top bar.
                </div>
            )}

            {/* Search */}
            <div className={styles.filtersArea}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by role name or DB key..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading && <div className={styles.loadingState}>Loading database roles...</div>}
            {isError && (
                <div className={styles.errorState}>
                    Error loading DB roles: {(error as any)?.message || 'Unknown error'}
                </div>
            )}

            {!isLoading && !isError && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Role Name</th>
                                <th>DB Key</th>
                                <th>Members</th>
                                <th>Privileges</th>
                                <th>Type</th>
                                <th style={{ width: '80px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoles.length > 0 ? (
                                filteredRoles.map((role: DBRole) => {
                                    const isExpanded = expandedRoleId === role.id;
                                    return (
                                        <React.Fragment key={role.id}>
                                            <tr>
                                                <td>
                                                    <div className={styles.userInfo}>
                                                        <div
                                                            className={styles.avatarSmall}
                                                            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                                                        >
                                                            <Lock size={14} />
                                                        </div>
                                                        <span style={{ fontWeight: 500 }}>{role.name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                                        {role.dbKey}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.roleTag} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                                        <Users size={13} />
                                                        {role.memberCount}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                        {(role.privileges || []).slice(0, 2).map((p, i) => (
                                                            <span key={i} style={{
                                                                padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem',
                                                                background: 'rgba(107, 114, 128, 0.1)', color: 'var(--text-muted)',
                                                                border: '1px solid rgba(107, 114, 128, 0.15)'
                                                            }}>
                                                                {p.object}: {p.type}
                                                            </span>
                                                        ))}
                                                        {(role.privileges || []).length > 2 && (
                                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                                +{(role.privileges || []).length - 2} more
                                                            </span>
                                                        )}
                                                        {(role.privileges || []).length === 0 && (
                                                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>—</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    {role.isSystemRole ? (
                                                        <span style={{
                                                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600,
                                                            background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7',
                                                            border: '1px solid rgba(168, 85, 247, 0.2)'
                                                        }}>
                                                            System
                                                        </span>
                                                    ) : (
                                                        <span style={{
                                                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600,
                                                            background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                                                            border: '1px solid rgba(16, 185, 129, 0.2)'
                                                        }}>
                                                            Custom
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        className={styles.iconBtn}
                                                        onClick={() => toggleExpand(role.id)}
                                                        title={isExpanded ? 'Collapse' : 'View Privileges'}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.75rem' }}
                                                    >
                                                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                        {isExpanded ? 'Less' : 'More'}
                                                    </button>
                                                </td>
                                            </tr>

                                            {isExpanded && <DBRolePrivilegesPanel role={role} />}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                                        {currentInstance
                                            ? `No database roles found for "${currentInstance.name}".`
                                            : 'No database roles found matching your search.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DBRolesTab;
