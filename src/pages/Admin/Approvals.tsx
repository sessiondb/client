// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import React, { useState } from 'react';
import { Check, X, Shield, Clock, Database, ChevronRight, ChevronDown, User, AlertCircle, Key, RefreshCw } from 'lucide-react';
import { useApprovals, useApproveRequest, useRejectRequest, ApprovalRequest } from '../../hooks/useApprovals';
import { useInstance } from '../../context/InstanceContext';
import RequestModal from './RequestModal';
import styles from './Admin.module.css';

/** Items to show for a request: prefer requestedItems, else map requestedPermissions to similar shape. */
function getDisplayItems(req: ApprovalRequest): Array<{ instanceId?: string; database: string; table: string; privileges: string[] }> {
    if (req.requestedItems && req.requestedItems.length > 0) {
        return req.requestedItems;
    }
    return (req.requestedPermissions || []).map((p: any) => ({
        database: p.database,
        table: p.table,
        privileges: Array.isArray(p.privileges) ? p.privileges : (p.privileges ? [p.privileges] : [])
    }));
}

const Approvals: React.FC = () => {
    const { data: requests = [], isLoading, isError, error, refetch } = useApprovals();
    const { instances } = useInstance();
    const approveMutation = useApproveRequest();
    const rejectMutation = useRejectRequest();

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedPerms, setSelectedPerms] = useState<Record<string, number[]>>({});
    const [showCreds, setShowCreds] = useState<{ open: boolean, data?: any }>({ open: false });
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [rejectModal, setRejectModal] = useState<{ id: string; reason: string } | null>(null);

    const pendingRequests = requests.filter((r: ApprovalRequest) => r.status === 'pending');

    const resolveInstanceName = (instanceId: string) => {
        const inst = instances.find((i: { id: string }) => i.id === instanceId);
        return inst ? (inst as { name: string }).name : instanceId;
    };

    const handleToggleExpand = (id: string, request: ApprovalRequest) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            const items = getDisplayItems(request);
            setSelectedPerms({ ...selectedPerms, [id]: items.map((_, i) => i) });
        }
    };

    const togglePermSelection = (reqId: string, permIdx: number) => {
        const current = selectedPerms[reqId] || [];
        if (current.includes(permIdx)) {
            setSelectedPerms({ ...selectedPerms, [reqId]: current.filter(i => i !== permIdx) });
        } else {
            setSelectedPerms({ ...selectedPerms, [reqId]: [...current, permIdx] });
        }
    };

    const handleApprove = (req: ApprovalRequest) => {
        const items = getDisplayItems(req);
        const selectedIndices = selectedPerms[req.id] || [];
        if (selectedIndices.length === 0) {
            alert("Please select at least one permission to approve.");
            return;
        }
        const finalPerms = items.filter((_: any, i: number) => selectedIndices.includes(i));
        approveMutation.mutate({
            id: req.id,
            status: 'approved',
            partialPermissions: finalPerms
        });
        setShowCreds({
            open: true,
            data: {
                user: req.requester,
                tempPassword: Math.random().toString(36).substr(2, 12),
                host: 'sessiondb-prod-01.internal',
                port: 5432,
                expiry: req.type === 'TEMP_USER' ? '24 hours' : 'Permanent'
            }
        });
    };

    const handleRejectClick = (reqId: string) => {
        setRejectModal({ id: reqId, reason: '' });
    };

    const handleRejectConfirm = () => {
        if (!rejectModal) return;
        rejectMutation.mutate({ id: rejectModal.id, rejectionReason: rejectModal.reason.trim() || undefined });
        setRejectModal(null);
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Pending Approvals</h1>
                    <p className={styles.pageSubtitle}>Review and manage requests for temporary access and role changes.</p>
                </div>
                <button className={styles.refreshBtn} onClick={() => refetch()} disabled={isLoading} title="Refresh list">
                    <RefreshCw size={18} className={isLoading ? 'spin' : ''} />
                    Refresh
                </button>
            </div>

            {isLoading && <div className={styles.loadingState}>Loading requests...</div>}
            {isError && <div className={styles.errorState}>Error loading requests: {(error as any)?.message || 'Unknown error'}</div>}

            {!isLoading && !isError && (
                <div className={styles.requestGrid}>
                    {pendingRequests.map((req: any) => (
                        <div key={req.id} className={`${styles.requestCard} ${expandedId === req.id ? styles.activeCard : ''}`}>
                            <div className={styles.reqMain} onClick={() => handleToggleExpand(req.id, req)}>
                                <div className={styles.reqHeader}>
                                    <div className={styles.reqIcon}>
                                        {req.type === 'TEMP_USER' ? <User size={20} /> : <Shield size={20} />}
                                    </div>
                                    <div className={styles.reqInfo}>
                                        <div className={styles.reqType}>
                                            {(req.type || 'UNKNOWN').replace('_', ' ')}
                                            {expandedId === req.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </div>
                                        <div className={styles.requester}>From: <strong>{req.requester}</strong></div>
                                    </div>
                                    <div className={styles.reqTimestamp}>{req.timestamp}</div>
                                </div>
                                <p className={styles.reqDesc}>{req.description}</p>

                                <div className={styles.reqMeta}>
                                    <div className={styles.reqBadge}>
                                        <Database size={14} /> {(getDisplayItems(req)).length} Objects
                                    </div>
                                    {req.type === 'TEMP_USER' && (
                                        <div className={styles.reqBadge} style={{ color: '#ff9800' }}>
                                            <Clock size={14} /> Expires in 24h
                                        </div>
                                    )}
                                </div>
                            </div>

                            {expandedId === req.id && (
                                <div className={styles.reqDetails}>
                                    <div className={styles.divider}></div>
                                    <div className={styles.partialSection}>
                                        <div className={styles.detailsHeader}>
                                            <AlertCircle size={14} />
                                            <span>Select partitions to grant access (Partial Approval)</span>
                                        </div>
                                        <div className={styles.permsListDetail}>
                                            {getDisplayItems(req).map((perm: any, pIdx: number) => (
                                                <div key={pIdx} className={styles.permSelectItem}>
                                                    <input
                                                        type="checkbox"
                                                        checked={(selectedPerms[req.id] || []).includes(pIdx)}
                                                        onChange={() => togglePermSelection(req.id, pIdx)}
                                                    />
                                                    <div className={styles.permDisplay}>
                                                        {perm.instanceId != null && (
                                                            <span className={styles.permInstance}>{resolveInstanceName(perm.instanceId)}</span>
                                                        )}
                                                        <code>{perm.database}.{perm.table}</code>
                                                        <span className={styles.permPrivs}>{(perm.privileges || []).join(', ')}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.reqActions}>
                                        <button className={styles.rejectBtn} onClick={() => handleRejectClick(req.id)}>
                                            <X size={16} /> Reject
                                        </button>
                                        <button className={styles.approveBtn} onClick={() => handleApprove(req)}>
                                            <Check size={16} />
                                            {(selectedPerms[req.id] || []).length < getDisplayItems(req).length ? 'Partial Approve' : 'Approve Request'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {pendingRequests.length === 0 && (
                        <div className={styles.emptyState}>
                            <Check size={48} />
                            <h3>All clear!</h3>
                            <p>No pending access requests at the moment.</p>
                        </div>
                    )}
                </div>
            )}

            {showCreds.open && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} card`} style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <div className={styles.reqIcon} style={{ margin: '0 auto 16px', width: '64px', height: '64px' }}>
                            <Key size={32} />
                        </div>
                        <h2>Credentials Generated</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            Access has been granted to <strong>{showCreds.data.user}</strong>. Please share these credentials securely.
                        </p>

                        <div className={styles.partialSection} style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)' }}>
                            <div className={styles.formGroup}>
                                <label>User</label>
                                <code>{showCreds.data.user}</code>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Temporary Password</label>
                                <code style={{ color: '#ffeb3b' }}>{showCreds.data.tempPassword}</code>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Host</label>
                                <code>{showCreds.data.host}:{showCreds.data.port}</code>
                            </div>
                        </div>

                        <button className="btn-primary" onClick={() => setShowCreds({ open: false })} style={{ width: '100%' }}>
                            Done
                        </button>
                    </div>
                </div>
            )}
            {rejectModal && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} card`} style={{ maxWidth: '420px' }}>
                        <h3>Reject request</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '12px', fontSize: '14px' }}>
                            Optionally provide a reason (shown to the requester).
                        </p>
                        <textarea
                            className={styles.rejectReasonInput}
                            value={rejectModal.reason}
                            onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                            placeholder="Rejection reason (optional)"
                            rows={3}
                        />
                        <div className={styles.modalActions} style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button className={styles.secondaryBtn} onClick={() => setRejectModal(null)}>Cancel</button>
                            <button className={styles.rejectBtn} onClick={handleRejectConfirm} disabled={rejectMutation.isPending}>
                                {rejectMutation.isPending ? 'Rejecting…' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isRequestModalOpen && (
                <RequestModal onClose={() => setIsRequestModalOpen(false)} />
            )}
        </div>
    );
};

export default Approvals;
