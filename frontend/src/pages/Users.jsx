import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_USERS = 'http://localhost:5000/api/users';
const API_BRANCHES = 'http://localhost:5000/api/branches';

function UserForm({ initial, branches, onSave, onCancel }) {
    const [form, setForm] = useState({
        username: initial?.username || '',
        password: '',
        branch: initial?.branch?._id || initial?.branch || ''
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.branch) return setError('Select a branch.');
        if (!initial && !form.password) return setError('Password is required for new users.');
        setError(''); setSaving(true);
        try {
            const payload = { branch: form.branch };
            if (!initial) { payload.username = form.username; payload.password = form.password; }
            if (initial && form.password) payload.password = form.password;
            await onSave(payload);
        } catch (err) { setError(err.message); }
        finally { setSaving(false); }
    };

    return (
        <div className="inline-form-panel fade-in">
            <div className="inline-form-header">
                <h3>{initial ? `Editing: ${initial.username}` : 'New Branch User'}</h3>
                <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>✕ Cancel</button>
            </div>
            <form onSubmit={handleSubmit} className="inline-form-body">
                {error && <div className="alert-error">{error}</div>}
                <div className="field-row">
                    {!initial && (
                        <div className="field">
                            <label>Username *</label>
                            <input placeholder="e.g. hyd_user" value={form.username}
                                onChange={e => set('username', e.target.value)} required />
                        </div>
                    )}
                    <div className="field">
                        <label>{initial ? 'Set Temp Password (leave blank to keep current)' : 'Password *'}</label>
                        <input type="password" placeholder={initial ? 'Enter new password…' : 'Min 6 characters'}
                            value={form.password} onChange={e => set('password', e.target.value)}
                            required={!initial} />
                    </div>
                    <div className="field">
                        <label>Branch *</label>
                        <select value={form.branch} onChange={e => set('branch', e.target.value)} required>
                            <option value="">— Select Branch —</option>
                            {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving…' : initial ? '✓ Update' : '✓ Create User'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function Users() {
    const { authHeaders } = useAuth();
    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editUser, setEditUser] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [uRes, bRes] = await Promise.all([
                fetch(API_USERS, { headers: authHeaders() }),
                fetch(API_BRANCHES, { headers: authHeaders() })
            ]);
            const [uData, bData] = await Promise.all([uRes.json(), bRes.json()]);
            if (uData.success) setUsers(uData.data);
            if (bData.success) setBranches(bData.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleSave = async (payload) => {
        const url = editUser ? `${API_USERS}/${editUser._id}` : API_USERS;
        const method = editUser ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to save');
        setShowForm(false); setEditUser(null); fetchAll();
    };

    const handleDelete = async (id) => {
        await fetch(`${API_USERS}/${id}`, { method: 'DELETE', headers: authHeaders() });
        fetchAll();
    };

    const openAdd = () => { setEditUser(null); setShowForm(true); };
    const openEdit = (u) => { setShowForm(false); setEditUser(u); };
    const closeAll = () => { setShowForm(false); setEditUser(null); };

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="topbar-title">Users</div>
                    <div className="topbar-sub">Manage branch login accounts</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span className="stat-chip">👤 {users.length} users</span>
                    {!showForm && !editUser && (
                        <button className="btn btn-primary" onClick={openAdd}>+ Add User</button>
                    )}
                </div>
            </div>
            <div className="page-content">
                {(showForm || editUser) && (
                    <UserForm initial={editUser} branches={branches} onSave={handleSave} onCancel={closeAll} />
                )}
                {loading ? (
                    <p style={{ color: 'var(--ink-muted)' }}>Loading…</p>
                ) : users.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">👤</div>
                        <h3>No branch users yet</h3>
                        <p>Create a branch first, then add a user to it.</p>
                    </div>
                ) : (
                    <div className="table-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Branch</th>
                                    <th>Created</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <UserRow key={u._id} user={u} onEdit={openEdit} onDelete={handleDelete} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

function UserRow({ user, onEdit, onDelete }) {
    const [confirming, setConfirming] = useState(false);
    const date = new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    return (
        <tr className="fade-in">
            <td style={{ fontWeight: 600 }}>
                <span style={{ fontFamily: 'monospace', background: 'var(--cream-dark)', padding: '0.15em 0.5em', borderRadius: 4 }}>
                    {user.username}
                </span>
            </td>
            <td>{user.branch?.name || <span style={{ color: 'var(--ink-muted)', fontSize: '0.78rem' }}>—</span>}</td>
            <td style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{date}</td>
            <td className="td-actions">
                {confirming ? (
                    <div className="delete-confirm">
                        <span>Delete user?</span>
                        <button className="btn btn-danger btn-sm" onClick={() => { onDelete(user._id); setConfirming(false); }}>Yes</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>No</button>
                    </div>
                ) : (
                    <>
                        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(user)}>Edit</button>
                        <button className="btn btn-danger btn-sm" style={{ marginLeft: 4 }} onClick={() => setConfirming(true)}>Delete</button>
                    </>
                )}
            </td>
        </tr>
    );
}
