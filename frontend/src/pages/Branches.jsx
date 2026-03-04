import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api/branches';

function BranchForm({ initial, onSave, onCancel, authHeaders }) {
    const [form, setForm] = useState({
        name: initial?.name || '',
        address: initial?.address || '',
        phone: initial?.phone || '',
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return setError('Branch name is required.');
        setError(''); setSaving(true);
        try {
            await onSave(form);
        } catch (err) { setError(err.message); }
        finally { setSaving(false); }
    };

    return (
        <div className="inline-form-panel fade-in">
            <div className="inline-form-header">
                <h3>{initial ? `Editing: ${initial.name}` : 'New Branch'}</h3>
                <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>✕ Cancel</button>
            </div>
            <form onSubmit={handleSubmit} className="inline-form-body">
                {error && <div className="alert-error">{error}</div>}
                <div className="field-row">
                    <div className="field">
                        <label>Branch Name *</label>
                        <input placeholder="e.g. Hyderabad Main" value={form.name} onChange={e => set('name', e.target.value)} required />
                    </div>
                    <div className="field">
                        <label>Phone</label>
                        <input placeholder="e.g. 9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                    </div>
                </div>
                <div className="field">
                    <label>Address</label>
                    <input placeholder="Street, City, State" value={form.address} onChange={e => set('address', e.target.value)} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving…' : initial ? '✓ Update' : '✓ Add Branch'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function Branches() {
    const { authHeaders } = useAuth();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editBranch, setEditBranch] = useState(null);
    const [error, setError] = useState('');

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await fetch(API, { headers: authHeaders() });
            const data = await res.json();
            if (data.success) setBranches(data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleSave = async (payload) => {
        const url = editBranch ? `${API}/${editBranch._id}` : API;
        const method = editBranch ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to save');
        setShowForm(false); setEditBranch(null); fetchAll();
    };

    const handleDelete = async (id) => {
        setError('');
        const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers: authHeaders() });
        const data = await res.json();
        if (!data.success) { setError(data.error); return; }
        fetchAll();
    };

    const openAdd = () => { setEditBranch(null); setShowForm(true); };
    const openEdit = (b) => { setShowForm(false); setEditBranch(b); };
    const closeAll = () => { setShowForm(false); setEditBranch(null); };

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="topbar-title">Branches</div>
                    <div className="topbar-sub">Manage store branches</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span className="stat-chip">🏪 {branches.length} branches</span>
                    {!showForm && !editBranch && (
                        <button className="btn btn-primary" onClick={openAdd}>+ Add Branch</button>
                    )}
                </div>
            </div>
            <div className="page-content">
                {error && <div className="alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
                {(showForm || editBranch) && (
                    <BranchForm initial={editBranch} onSave={handleSave} onCancel={closeAll} authHeaders={authHeaders} />
                )}
                {loading ? (
                    <p style={{ color: 'var(--ink-muted)' }}>Loading…</p>
                ) : branches.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🏪</div>
                        <h3>No branches yet</h3>
                        <p>Add your first branch to get started.</p>
                    </div>
                ) : (
                    <div className="table-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Branch Name</th>
                                    <th>Phone</th>
                                    <th>Address</th>
                                    <th>Users</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {branches.map(b => (
                                    <BranchRow key={b._id} branch={b} onEdit={openEdit} onDelete={handleDelete} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {editBranch && (
                    <div style={{ marginTop: '1rem' }}>
                        <BranchForm initial={editBranch} onSave={handleSave} onCancel={closeAll} authHeaders={authHeaders} />
                    </div>
                )}
            </div>
        </>
    );
}

function BranchRow({ branch, onEdit, onDelete }) {
    const [confirming, setConfirming] = useState(false);
    return (
        <tr className="fade-in">
            <td style={{ fontWeight: 600 }}>{branch.name}</td>
            <td>{branch.phone || <span style={{ color: 'var(--ink-muted)', fontSize: '0.78rem' }}>—</span>}</td>
            <td>{branch.address || <span style={{ color: 'var(--ink-muted)', fontSize: '0.78rem' }}>—</span>}</td>
            <td>
                <span className="stat-chip" style={{ fontSize: '0.75rem' }}>
                    {branch.userCount} user{branch.userCount !== 1 ? 's' : ''}
                </span>
            </td>
            <td className="td-actions">
                {confirming ? (
                    <div className="delete-confirm">
                        <span>Delete?</span>
                        <button className="btn btn-danger btn-sm" onClick={() => { onDelete(branch._id); setConfirming(false); }}>Yes</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>No</button>
                    </div>
                ) : (
                    <>
                        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(branch)}>Edit</button>
                        <button className="btn btn-danger btn-sm" style={{ marginLeft: 4 }} onClick={() => setConfirming(true)}>Delete</button>
                    </>
                )}
            </td>
        </tr>
    );
}
