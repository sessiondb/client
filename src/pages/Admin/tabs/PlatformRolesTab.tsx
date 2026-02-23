import React, { useState } from 'react';
import { Lock, Edit3, Trash2, Users, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { Role } from '../../../hooks/useRoles';
import styles from '../Admin.module.css';

const ROLES_PER_PAGE = 9;

interface PlatformRolesTabProps {
    roles: Role[];
    isLoading: boolean;
    isError: boolean;
    error: any;
    onEdit: (role: Role) => void;
    onDelete: (id: string, name: string) => void;
    onCreate: () => void;
}

const PlatformRolesTab: React.FC<PlatformRolesTabProps> = ({
    roles, isLoading, isError, error, onEdit, onDelete
}) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(roles.length / ROLES_PER_PAGE);
    const startIndex = (currentPage - 1) * ROLES_PER_PAGE;
    const paginatedRoles = roles.slice(startIndex, startIndex + ROLES_PER_PAGE);

    return (
        <div>
            {isLoading && <div className={styles.loadingState}>Loading roles...</div>}
            {isError && <div className={styles.errorState}>Error loading roles: {(error as any)?.message || 'Unknown error'}</div>}

            {!isLoading && !isError && (
                <div className={styles.compactRolesGrid}>
                    {paginatedRoles.map((role: Role) => (
                        <div key={role.id} className={`${styles.compactRoleCard} card`}>
                            <div className={styles.roleHeaderCompact}>
                                <div className={styles.roleIconCompact}>
                                    <Lock size={14} />
                                </div>
                                <div className={styles.roleInfoCompact}>
                                    <h3 style={{ marginBottom: '2px' }}>{role.name}</h3>
                                    {role.dbKey && (
                                        <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                            {role.dbKey}
                                        </div>
                                    )}
                                    <div className={styles.roleStatsCompact}>
                                        <span><Users size={11} /> {role.userCount}</span>
                                        <span><Database size={11} /> {(role.permissions || []).length}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.rolePermsCompact}>
                                {(role.permissions || []).slice(0, 2).map((p: any, i: number) => (
                                    <span key={i} className={styles.miniPermTag}>
                                        {p.database}.{p.table}
                                    </span>
                                ))}
                                {(role.permissions || []).length > 2 && (
                                    <span className={styles.morePermTag}>+{(role.permissions || []).length - 2} more</span>
                                )}
                            </div>

                            <div className={styles.roleActionsCompact}>
                                <button className={styles.iconBtn} onClick={() => onEdit(role)} title="Edit Role">
                                    <Edit3 size={13} />
                                </button>
                                <button className={styles.iconBtn} onClick={() => onDelete(role.id, role.name)} style={{ color: 'var(--danger)' }} title="Delete Role">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className={styles.paginationArea}>
                    <button
                        className={styles.pageBtn}
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className={styles.pageIndicator}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className={styles.pageBtn}
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PlatformRolesTab;
