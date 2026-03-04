import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API = `${BASE_URL}/api/customers`;

/* ── Inline Customer Form ── */
function CustomerForm({ initial, onSave, onCancel }) {
    const [form, setForm] = useState({
        name: initial?.name || '',
        phone: initial?.phone || '',
        email: initial?.email || '',
        address: initial?.address || '',
        notes: initial?.notes || '',
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name.trim()) { setError('Customer name is required.'); return; }
        setSaving(true);
        try {
            await onSave({
                name: form.name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                address: form.address.trim(),
                notes: form.notes.trim(),
            });
        } catch (err) { setError(err.message); }
        finally { setSaving(false); }
    };

    return (
        <div className="inline-form-panel fade-in">
            <div className="inline-form-header">
                <h3>{initial ? `Editing: ${initial.name}` : 'Add New Customer'}</h3>
                <button className="btn btn-ghost btn-sm" onClick={onCancel}>✕ Cancel</button>
            </div>
            <form onSubmit={handleSubmit} className="inline-form-body">
                {error && <div className="alert-error">{error}</div>}

                <div className="field-row">
                    <div className="field" style={{ flex: 2 }}>
                        <label>Full Name *</label>
                        <input placeholder="e.g. Ravi Kumar" value={form.name}
                            onChange={e => set('name', e.target.value)} required />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                        <label>Phone</label>
                        <input placeholder="e.g. 9876543210" value={form.phone}
                            onChange={e => set('phone', e.target.value)} />
                    </div>
                    <div className="field" style={{ flex: 2 }}>
                        <label>Email</label>
                        <input type="email" placeholder="e.g. ravi@example.com" value={form.email}
                            onChange={e => set('email', e.target.value)} />
                    </div>
                </div>

                <div className="field-row align-center">
                    <div className="field" style={{ flex: 2 }}>
                        <label>Address</label>
                        <input placeholder="Street, City…" value={form.address}
                            onChange={e => set('address', e.target.value)} />
                    </div>
                    <div className="field" style={{ flex: 2 }}>
                        <label>Internal Notes</label>
                        <input placeholder="Staff notes (not visible to customer)…" value={form.notes}
                            onChange={e => set('notes', e.target.value)} />
                    </div>
                    <div className="field" style={{ flex: 'none', display: 'flex', flexDirection: 'column' }}>
                        <label style={{ opacity: 0 }}>.</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving…' : initial ? '✓ Update' : '✓ Add Customer'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

/* ── Customer Row ── */
function CustomerRow({ customer, editingId, onEdit, onDelete }) {
    const [confirming, setConfirming] = useState(false);

    const since = new Date(customer.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    return (
        <tr className="fade-in">
            <td>
                <span className="customer-id-badge">{customer.customerId}</span>
            </td>
            <td className="td-title">{customer.name}</td>
            <td>{customer.phone || <span style={{ color: 'var(--ink-muted)', fontSize: '0.78rem' }}>—</span>}</td>
            <td>{customer.email || <span style={{ color: 'var(--ink-muted)', fontSize: '0.78rem' }}>—</span>}</td>
            <td style={{ maxWidth: 200 }}>
                {customer.notes
                    ? <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontStyle: 'italic' }} title={customer.notes}>
                        {customer.notes.length > 40 ? customer.notes.slice(0, 40) + '…' : customer.notes}
                    </span>
                    : <span style={{ color: 'var(--ink-muted)', fontSize: '0.78rem' }}>—</span>
                }
            </td>
            <td style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{since}</td>
            <td className="td-actions">
                {confirming ? (
                    <div className="delete-confirm">
                        <span>Delete?</span>
                        <button className="btn btn-danger btn-sm"
                            onClick={() => { onDelete(customer._id); setConfirming(false); }}>Yes</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>No</button>
                    </div>
                ) : (
                    <>
                        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(customer)}>Edit</button>
                        <button className="btn btn-danger btn-sm" style={{ marginLeft: 4 }}
                            onClick={() => setConfirming(true)}>Delete</button>
                    </>
                )}
            </td>
        </tr>
    );
}

/* ── Customers Page ── */
export default function Customers() {
    const { authHeaders } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editCustomer, setEditCustomer] = useState(null);

    const fetchAll = async (q = '') => {
        setLoading(true);
        try {
            const url = q ? `${API}?search=${encodeURIComponent(q)}` : API;
            const res = await fetch(url, { headers: authHeaders() });
            const data = await res.json();
            if (data.success) setCustomers(data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    // Debounced search
    useEffect(() => {
        const t = setTimeout(() => fetchAll(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    const openAdd = () => { setEditCustomer(null); setShowForm(true); };
    const openEdit = (c) => { setShowForm(false); setEditCustomer(c); };
    const closeAll = () => { setShowForm(false); setEditCustomer(null); };

    const handleSave = async (payload) => {
        const url = editCustomer ? `${API}/${editCustomer._id}` : API;
        const res = await fetch(url, {
            method: editCustomer ? 'PUT' : 'POST',
            headers: authHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to save');
        closeAll(); fetchAll(search);
    };

    const handleDelete = async (id) => {
        await fetch(`${API}/${id}`, { method: 'DELETE', headers: authHeaders() });
        fetchAll(search);
    };

    return (
        <>
            {/* Topbar */}
            <div className="topbar">
                <div>
                    <div className="topbar-title">Customers</div>
                    <div className="topbar-sub">Manage your bookstore customers</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span className="stat-chip">👤 {customers.length} total</span>
                    {!showForm && !editCustomer && (
                        <button className="btn btn-primary" onClick={openAdd}>+ Add Customer</button>
                    )}
                </div>
            </div>

            <div className="page-content">
                {/* Inline add form */}
                {showForm && (
                    <CustomerForm onSave={handleSave} onCancel={closeAll} />
                )}
                {/* Inline edit form */}
                {editCustomer && !showForm && (
                    <CustomerForm initial={editCustomer} onSave={handleSave} onCancel={closeAll} />
                )}

                {/* Search toolbar */}
                <div className="toolbar">
                    <div className="search-wrap" style={{ flex: 1 }}>
                        <span className="search-icon">🔍</span>
                        <input
                            className="search-input"
                            placeholder="Search by name, phone, email or customer ID…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    {search && (
                        <button className="btn btn-outline btn-sm" onClick={() => setSearch('')}>Clear</button>
                    )}
                </div>

                {/* Customer ID tip */}
                <div className="customer-id-tip">
                    <span>💡</span>
                    <span>Every customer receives a unique <strong>Customer ID</strong> (e.g. <code>CST-A3F9</code>). Share it with them — they can quote it to be identified without sharing personal details.</span>
                </div>

                {/* Table */}
                {loading ? (
                    <p style={{ color: 'var(--ink-muted)', marginTop: '1rem' }}>Loading…</p>
                ) : customers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">👤</div>
                        <h3>{search ? 'No customers match your search' : 'No customers yet'}</h3>
                        <p>{search ? 'Try a different name, phone, email or ID.' : 'Click "+ Add Customer" to add your first customer.'}</p>
                    </div>
                ) : (
                    <div className="table-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Customer ID</th>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Notes</th>
                                    <th>Since</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map(c => (
                                    <React.Fragment key={c._id}>
                                        <CustomerRow
                                            customer={c}
                                            editingId={editCustomer?._id}
                                            onEdit={openEdit}
                                            onDelete={handleDelete}
                                        />
                                        {editCustomer?._id === c._id && (
                                            <tr>
                                                <td colSpan={7} style={{ padding: 0, background: 'var(--cream)' }}>
                                                    <CustomerForm
                                                        initial={editCustomer}
                                                        onSave={handleSave}
                                                        onCancel={closeAll}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
