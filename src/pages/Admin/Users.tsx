// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import React, { useState } from 'react';
import { UserPlus, Key, Shield } from 'lucide-react';

import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, type CreateUserResponse } from '../../hooks/useUsers';
import { useAuthConfig, useUpdateAuthConfig } from '../../hooks/useAuthConfig';
import { User } from '../../context/AuthContext';
import UserModal from './UserModal';
import UserDetails from './UserDetails';
import PasswordResetModal from './PasswordResetModal';
import PlatformUsersTab from './tabs/PlatformUsersTab';
import DBUsersTab from './tabs/DBUsersTab';
import styles from './Admin.module.css';

const UserManagement: React.FC = () => {
    // Hooks
    const { data: users = [], isLoading, isError, error } = useUsers();
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const deleteUserMutation = useDeleteUser();
    const { data: authConfig } = useAuthConfig();
    const updateAuthConfigMutation = useUpdateAuthConfig();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
    const [resetPasswordUser, setResetPasswordUser] = useState<User | undefined>(undefined);
    const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<'platform_users' | 'db_users' | 'settings'>('platform_users');
    const [createMessage, setCreateMessage] = useState<string | null>(null);

    const handleOpenCreate = () => {
        setEditingUser(undefined);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleViewDetails = (user: User) => {
        setSelectedUserForDetails(user);
    };

    const handleSaveUser = (user: import('./UserModal').UserSavePayload) => {
        if (editingUser) {
            updateUserMutation.mutate(
                { ...user, id: editingUser.id },
                { onSuccess: () => setIsModalOpen(false) }
            );
        } else {
            createUserMutation.mutate(user, {
                onSuccess: (result: CreateUserResponse) => {
                    setIsModalOpen(false);
                    if (result?.emailSent) {
                        setCreateMessage('User created. Credentials have been sent by email.');
                    } else if (result?.emailSent === false && result?.emailError) {
                        setCreateMessage('User created. Email could not be sent; share credentials manually.');
                    } else {
                        setCreateMessage('User created.');
                    }
                    setTimeout(() => setCreateMessage(null), 5000);
                }
            });
        }
    };

    const handleResetPassword = (user: User) => {
        // We set the user to state, rendering the modal
        setResetPasswordUser(user);
    };

    const confirmResetPassword = (userId: string, newPassword: string) => {
        updateUserMutation.mutate({ id: userId, password: newPassword } as User);
        setResetPasswordUser(undefined);
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete user ${name}?`)) {
            deleteUserMutation.mutate(id);
        }
    };

    // For setAuthConfig
    const setAuthConfig = (config: { type: 'password' | 'sso' }) => {
        updateAuthConfigMutation.mutate(config);
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>User Management</h1>
                    <p className={styles.pageSubtitle}>Manage system users, granular DB permissions, and session access.</p>
                    {createMessage && (
                        <output style={{ display: 'block', marginTop: 8, padding: '8px 12px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 14 }}>
                            {createMessage}
                        </output>
                    )}
                </div>
                {activeTab === 'platform_users' && (
                    <button className="btn-primary" onClick={handleOpenCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserPlus size={18} />
                        Create New User
                    </button>
                )}
            </div>

            <div className={styles.tabsArea}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'platform_users' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('platform_users')}
                >
                    Platform Users
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'db_users' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('db_users')}
                >
                    DB Users
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    System Settings
                </button>
            </div>

            {activeTab === 'platform_users' && (
                <PlatformUsersTab
                    users={users}
                    isLoading={isLoading}
                    isError={isError}
                    error={error}
                    onViewDetails={handleViewDetails}
                    onEdit={handleOpenEdit}
                    onResetPassword={handleResetPassword}
                    onDelete={handleDelete}
                />
            )}

            {activeTab === 'db_users' && (
                <DBUsersTab />
            )}

            {activeTab === 'settings' && (
                <div className="card" style={{ maxWidth: '600px' }}>
                    <h3>Security & Authentication</h3>
                    <p className={styles.pageSubtitle}>Select the system-wide login method for all users.</p>

                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div
                            className={`${styles.configPlate} ${authConfig?.type === 'password' ? styles.configActive : ''}`}
                            onClick={() => setAuthConfig({ type: 'password' })}
                        >
                            <div className={styles.configIcon}>
                                <Key size={24} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600 }}>Password Based</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Users login using their system username and password.</div>
                            </div>
                            <div className={styles.radio}>
                                {authConfig?.type === 'password' && <div className={styles.radioInner} />}
                            </div>
                        </div>

                        <div
                            className={`${styles.configPlate} ${authConfig?.type === 'sso' ? styles.configActive : ''}`}
                            onClick={() => setAuthConfig({ type: 'sso' })}
                        >
                            <div className={styles.configIcon}>
                                <Shield size={24} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600 }}>Single Sign-On (SSO)</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Force users to authenticate via enterprise provider (GitHub).</div>
                            </div>
                            <div className={styles.radio}>
                                {authConfig?.type === 'sso' && <div className={styles.radioInner} />}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                        <div style={{ color: '#eab308', fontWeight: 600, fontSize: '0.85rem' }}>Important: Login Method Change</div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>
                            Changing the login method will apply globally. Users currently logged in will NOT be logged out, but new sessions must use the new method.
                        </p>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <UserModal
                    user={editingUser}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveUser}
                />
            )}

            {resetPasswordUser && (
                <PasswordResetModal
                    user={resetPasswordUser}
                    onClose={() => setResetPasswordUser(undefined)}
                    onReset={confirmResetPassword}
                />
            )}

            {selectedUserForDetails && (
                <UserDetails
                    user={selectedUserForDetails}
                    onClose={() => setSelectedUserForDetails(undefined)}
                />
            )}
        </div>
    );
};

export default UserManagement;
