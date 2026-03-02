// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import React, { useState } from 'react';
import { Search, Filter, Download, Clock, User, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLogs, AuditLog } from '../../hooks/useLogs';
import styles from './Logs.module.css';

const AuditLogs: React.FC = () => {
    const { data: logs = [], isLoading, isError, error } = useLogs();
    const [search, setSearch] = useState('');
    const [filterUser, setFilterUser] = useState('');
    const [filterSessionUser, setFilterSessionUser] = useState('');
    const [filterTable, setFilterTable] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const filteredLogs = logs.filter((log: AuditLog) => {
        const matchesSearch = !search ||
            (log.user || '').toLowerCase().includes(search.toLowerCase()) ||
            (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
            (log.resource || '').toLowerCase().includes(search.toLowerCase()) ||
            (log.query || '').toLowerCase().includes(search.toLowerCase());

        const matchesUser = !filterUser || (log.user || '').toLowerCase().includes(filterUser.toLowerCase());
        const matchesSessionUser = !filterSessionUser || (log.session_user || '').toLowerCase().includes(filterSessionUser.toLowerCase());
        const matchesTable = !filterTable || (log.table || '').toLowerCase().includes(filterTable.toLowerCase());

        return matchesSearch && matchesUser && matchesSessionUser && matchesTable;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Success': return <CheckCircle size={14} style={{ color: '#4caf50' }} />;
            case 'Failure': return <Zap size={14} style={{ color: '#f44336' }} />;
            case 'Warning': return <AlertTriangle size={14} style={{ color: '#ff9800' }} />;
            default: return null;
        }
    };

    return (
        <div className={styles.logsPage}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Audit Logs</h1>
                    <p className={styles.pageSubtitle}>Track all user activities, query executions, and system changes.</p>
                </div>
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            <div className={styles.filtersArea}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search logs (user, action, query)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    className={`${styles.filterBtn} ${showFilters ? styles.active : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={18} />
                    {showFilters ? 'Hide Filters' : 'Advanced Filters'}
                </button>
            </div>

            {showFilters && (
                <div className={`${styles.advancedFilters} card`}>
                    <div className={styles.filterGrid}>
                        <div className={styles.filterGroup}>
                            <label>Filter by User</label>
                            <input
                                type="text"
                                placeholder="Root user..."
                                value={filterUser}
                                onChange={(e) => setFilterUser(e.target.value)}
                            />
                        </div>
                        <div className={styles.filterGroup}>
                            <label>Filter by Session User</label>
                            <input
                                type="text"
                                placeholder="DB username..."
                                value={filterSessionUser}
                                onChange={(e) => setFilterSessionUser(e.target.value)}
                            />
                        </div>
                        <div className={styles.filterGroup}>
                            <label>Filter by Table</label>
                            <input
                                type="text"
                                placeholder="db.table..."
                                value={filterTable}
                                onChange={(e) => setFilterTable(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {isLoading && <div className={styles.loadingState}>Loading audit logs...</div>}
            {isError && <div className={styles.errorState}>Error loading logs: {(error as any)?.message || 'Unknown error'}</div>}

            {!isLoading && !isError && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Resource</th>
                                    <th>Query / Parameters</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log: any) => (
                                    <tr key={log.id}>
                                        <td>
                                            <div className={styles.timeLabel}>
                                                <Clock size={14} />
                                                {log.timestamp}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.userLabel}>
                                                <User size={14} />
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span>{log.user}</span>
                                                    {log.session_user && (
                                                        <span className={styles.sessionSubtext}>as {log.session_user}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.actionBadge}>{log.action}</span>
                                        </td>
                                        <td>
                                            <code>{log.resource}</code>
                                        </td>
                                        <td>
                                            {log.query ? (
                                                <div className={styles.queryCell}>
                                                    <code className={styles.queryInline} title={log.query}>{log.query}</code>
                                                </div>
                                            ) : (
                                                <span className={styles.dimmedText}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className={styles.statusLabel}>
                                                {getStatusIcon(log.status)}
                                                {log.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className={styles.emptyRow}>No log entries found matching your search.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
