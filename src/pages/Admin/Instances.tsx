// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, RefreshCw, Server, Activity } from 'lucide-react';
import { useAdminInstances, useCreateInstance, useUpdateInstance, useDeleteInstance, useSyncInstance } from '../../hooks/useAdminInstances';
import { DBInstance } from '../../context/InstanceContext';
import styles from './Admin.module.css';

const InstanceManagement: React.FC = () => {
    const { data: instances = [], isLoading, isError } = useAdminInstances();
    const createMutation = useCreateInstance();
    const updateMutation = useUpdateInstance();
    const deleteMutation = useDeleteInstance();
    const syncMutation = useSyncInstance();

    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInstance, setEditingInstance] = useState<DBInstance | null>(null);

    const filteredInstances = instances.filter((i: DBInstance) =>
        (i.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (i.host || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenCreate = () => {
        setEditingInstance(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (inst: DBInstance) => {
        setEditingInstance(inst);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete instance ${name}? This will remove all associated permissions and logs.`)) {
            deleteMutation.mutate(id);
        }
    };

    const handleSync = (id: string) => {
        syncMutation.mutate(id);
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Database Instances</h1>
                    <p className={styles.pageSubtitle}>Manage database connections, credentials, and metadata synchronization.</p>
                </div>
                <button className="btn-primary" onClick={handleOpenCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} />
                    Add Instance
                </button>
            </div>

            <div className={styles.filtersArea}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name or host..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className={styles.loadingState}>
                    <div className="spinner"></div>
                    <p>Loading instances...</p>
                </div>
            ) : isError ? (
                <div className={styles.errorState}>
                    <p>Error loading instances. Please check your connection.</p>
                </div>
            ) : (
                <div className="card">
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Instance Name</th>
                                <th>Type / Host</th>
                                <th>Status</th>
                                <th>Last Sync</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInstances.map((inst: DBInstance) => (
                                <tr key={inst.id}>
                                    <td>
                                        <div className={styles.userNameArea}>
                                            <div className={styles.avatar}>
                                                <Server size={18} />
                                            </div>
                                            <div className={styles.userInfo}>
                                                <span className={styles.userName}>{inst.name}</span>
                                                <span className={styles.userRole}>ID: {inst.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{inst.type.toUpperCase()}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inst.host}:{inst.port}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.statusLabel}>
                                            <div className={`${styles.statusDot} ${inst.status === 'online' ? styles.statusActive : inst.status === 'offline' ? styles.statusInactive : styles.statusPending}`}></div>
                                            {inst.status.charAt(0).toUpperCase() + inst.status.slice(1)}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Activity size={14} className={styles.dimIcon} />
                                            <span style={{ fontSize: '0.85rem' }}>{inst.lastSync || 'Never'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button className={styles.actionBtn} onClick={() => handleSync(inst.id)} title="Sync Metadata" disabled={syncMutation.isPending && syncMutation.variables === inst.id}>
                                                <RefreshCw size={16} className={syncMutation.isPending && syncMutation.variables === inst.id ? 'spin' : ''} />
                                            </button>
                                            <button className={styles.actionBtn} onClick={() => handleOpenEdit(inst)} title="Edit Configuration">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(inst.id, inst.name)} title="Delete Instance">
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

            {isModalOpen && (
                <InstanceModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    instance={editingInstance}
                    onSave={(data) => {
                        if (editingInstance) {
                            const updatePayload: Record<string, unknown> = {
                                name: data.name,
                                host: data.host,
                                port: data.port,
                                type: data.type,
                                username: data.username,
                                id: editingInstance.id,
                            };
                            if (data.type === 'postgres' || data.type === 'mysql') updatePayload.sslMode = data.sslMode ?? '';
                            if (data.password) updatePayload.password = data.password;
                            updateMutation.mutate(updatePayload as Partial<DBInstance> & { id: string });
                        } else {
                            createMutation.mutate({
                                name: data.name,
                                host: data.host,
                                port: data.port,
                                type: data.type,
                                username: data.username,
                                password: data.password,
                                ...(data.type === 'postgres' || data.type === 'mysql' ? { sslMode: data.sslMode ?? '' } : {}),
                            });
                        }
                        setIsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

interface InstanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    instance: DBInstance | null;
    onSave: (data: any) => void;
}

const SSL_MODE_OPTIONS = [
    { value: '', label: 'Disable (default)' },
    { value: 'require', label: 'Require' },
    { value: 'verify-ca', label: 'Verify CA' },
    { value: 'verify-full', label: 'Verify Full' },
] as const;

const InstanceModal: React.FC<InstanceModalProps> = ({ onClose, instance, onSave }) => {
    const [formData, setFormData] = useState({
        name: instance?.name || '',
        host: instance?.host || '',
        port: instance?.port ?? 3306,
        type: (instance?.type || 'mysql') as 'mysql' | 'postgres' | 'mongodb',
        username: (instance as any)?.username ?? '',
        password: '',
        sslMode: instance?.sslMode ?? '',
    });

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>{instance ? 'Edit Instance' : 'Add New Instance'}</h2>
                <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label>Display Name</label>
                        <input
                            type="text"
                            className={styles.formInput}
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Production MySQL"
                        />
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup} style={{ flex: 2 }}>
                            <label>Host</label>
                            <input
                                type="text"
                                className={styles.formInput}
                                value={formData.host}
                                onChange={e => setFormData({ ...formData, host: e.target.value })}
                                placeholder="localhost or db.example.com"
                            />
                        </div>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label>Port</label>
                            <input
                                type="number"
                                className={styles.formInput}
                                value={formData.port}
                                onChange={e => setFormData({ ...formData, port: Number.parseInt(e.target.value, 10) || 0 })}
                            />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Database Type</label>
                        <select
                            className={styles.formInput}
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value as 'mysql' | 'postgres' | 'mongodb' })}
                        >
                            <option value="mysql">MySQL</option>
                            <option value="postgres">PostgreSQL</option>
                            <option value="mongodb">MongoDB</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>SSL Mode {(formData.type === 'postgres' || formData.type === 'mysql') ? '' : '(PostgreSQL/MySQL only)'}</label>
                        <select
                            className={styles.formInput}
                            value={formData.sslMode}
                            onChange={e => setFormData({ ...formData, sslMode: e.target.value })}
                            title="Use &quot;Require&quot; when the server requires SSL (e.g. cloud Postgres/MySQL)"
                            disabled={formData.type === 'mongodb'}
                        >
                            {SSL_MODE_OPTIONS.map((opt) => (
                                <option key={opt.value || 'disable'} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Username</label>
                            <input
                                type="text"
                                className={styles.formInput}
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Password</label>
                            <input
                                type="password"
                                className={styles.formInput}
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder={instance ? "••••••••" : ""}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.modalFooter}>
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={() => onSave(formData)}>
                        {instance ? 'Update Instance' : 'Save Instance'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstanceManagement;
