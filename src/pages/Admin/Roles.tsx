import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole, Role } from '../../hooks/useRoles';
import RoleModal from './RoleModal';
import PlatformRolesTab from './tabs/PlatformRolesTab';
import DBRolesTab from './tabs/DBRolesTab';
import styles from './Admin.module.css';

const RoleManagement: React.FC = () => {
    // Hooks
    const { data: roles = [], isLoading, isError, error } = useRoles();
    const createRoleMutation = useCreateRole();
    const updateRoleMutation = useUpdateRole();
    const deleteRoleMutation = useDeleteRole();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<'platform_roles' | 'db_roles'>('platform_roles');

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

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Role Management</h1>
                    <p className={styles.pageSubtitle}>
                        {activeTab === 'platform_roles'
                            ? 'Define template roles with baseline database privileges.'
                            : 'View actual database roles from the connected instance.'}
                    </p>
                </div>
                {activeTab === 'platform_roles' && (
                    <button className="btn-primary" onClick={handleOpenCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} />
                        Create New Role Template
                    </button>
                )}
            </div>

            <div className={styles.tabsArea}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'platform_roles' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('platform_roles')}
                >
                    Platform Roles
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'db_roles' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('db_roles')}
                >
                    DB Roles
                </button>
            </div>

            {activeTab === 'platform_roles' && (
                <PlatformRolesTab
                    roles={roles}
                    isLoading={isLoading}
                    isError={isError}
                    error={error}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    onCreate={handleOpenCreate}
                />
            )}

            {activeTab === 'db_roles' && (
                <DBRolesTab />
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
