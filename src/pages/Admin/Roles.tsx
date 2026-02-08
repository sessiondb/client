import React, { useState } from 'react';
import { Lock, Edit3, Trash2, Plus, Users, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole, Role } from '../../hooks/useRoles';
import RoleModal from './RoleModal';
import styles from './Admin.module.css';

const ROLES_PER_PAGE = 9;

const RoleManagement: React.FC = () => {
    // Hooks
    const { data: roles = [], isLoading, isError, error } = useRoles();
    const createRoleMutation = useCreateRole();
    const updateRoleMutation = useUpdateRole();
    const deleteRoleMutation = useDeleteRole();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(1);

    const handleOpenCreate = () => {
        setEditingRole(undefined);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (role: Role) => {
        setEditingRole(role);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Delete role "${name}"? This may affect users assigned to it.`)) {
            deleteRoleMutation.mutate(id);
            // Pagination adjustment logic
            const newTotalPages = Math.ceil((roles.length - 1) / ROLES_PER_PAGE);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }
        }
    };

    const handleSaveRole = (role: Role) => {
        if (editingRole) {
            updateRoleMutation.mutate({ ...role, id: editingRole.id });
        } else {
            createRoleMutation.mutate(role);
        }
        setIsModalOpen(false);
    };

    // Pagination Logic
    const totalPages = Math.ceil(roles.length / ROLES_PER_PAGE);
    const startIndex = (currentPage - 1) * ROLES_PER_PAGE;
    const paginatedRoles = roles.slice(startIndex, startIndex + ROLES_PER_PAGE);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Role Management</h1>
                    <p className={styles.pageSubtitle}>Define template roles with baseline database privileges.</p>
                </div>
                <button className="btn-primary" onClick={handleOpenCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} />
                    Create New Role Template
                </button>
            </div>

            {isLoading && <div className={styles.loadingState}>Loading roles...</div>}
            {isError && <div className={styles.errorState}>Error loading roles: {(error as any)?.message || 'Unknown error'}</div>}

            {!isLoading && !isError && (
                <div className={styles.compactRolesGrid}>
                    {paginatedRoles.map(role => (
                        <div key={role.id} className={`${styles.compactRoleCard} card`}>
                            <div className={styles.roleHeaderCompact}>
                                <div className={styles.roleIconCompact}>
                                    <Lock size={14} />
                                </div>
                                <div className={styles.roleInfoCompact}>
                                    <h3>{role.name}</h3>
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
                                <button className={styles.iconBtn} onClick={() => handleOpenEdit(role)} title="Edit Role">
                                    <Edit3 size={13} />
                                </button>
                                <button className={styles.iconBtn} onClick={() => handleDelete(role.id, role.name)} style={{ color: 'var(--danger)' }} title="Delete Role">
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

            {isModalOpen && (
                <RoleModal
                    role={editingRole}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveRole}
                />
            )}
        </div>
    );
};

export default RoleManagement;
