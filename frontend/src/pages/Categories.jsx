import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/categories`;

const PRESET_COLORS = [
    '#b45309', '#7c3aed', '#be185d', '#dc2626',
    '#0891b2', '#059669', '#d97706', '#2563eb',
];

/* ── Inline Category Form ── */
function CategoryForm({ initial, onSave, onCancel }) {
    const [form, setForm] = useState({
        name: initial?.name || '',
        description: initial?.description || '',
        colorTag: initial?.colorTag || '#b45309',
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name.trim()) { setError('Category name is required.'); return; }
        setSaving(true);
        try {
            await onSave({ name: form.name.trim(), description: form.description.trim(), colorTag: form.colorTag });
        } catch (err) { setError(err.message); }
        finally { setSaving(false); }
    };

    return (
        <div className="inline-form-panel fade-in">
            <div className="inline-form-header">
                <h3>{initial ? `Editing: ${initial.name}` : 'New Category'}</h3>
                <button className="btn btn-ghost btn-sm" onClick={onCancel}>✕ Cancel</button>
            </div>
            <form onSubmit={handleSubmit} className="inline-form-body">
                {error && <div className="alert-error">{error}</div>}
                <div className="field-row align-center">
                    <div className="field" style={{ flex: 2 }}>
                        <label>Category Name *</label>
                        <input placeholder="e.g. Science Fiction" value={form.name}
                            onChange={e => set('name', e.target.value)} required />
                    </div>
                    <div className="field" style={{ flex: 3 }}>
                        <label>Description</label>
                        <input placeholder="A brief description of this genre…"
                            value={form.description} onChange={e => set('description', e.target.value)} />
                    </div>
                    <div className="field" style={{ flex: 'none' }}>
                        <label>Accent Color</label>
                        <div className="color-presets">
                            {PRESET_COLORS.map(c => (
                                <button key={c} type="button"
                                    className={`color-dot ${form.colorTag === c ? 'selected' : ''}`}
                                    style={{ background: c }} onClick={() => set('colorTag', c)} title={c}
                                />
                            ))}
                            <input type="color" value={form.colorTag}
                                onChange={e => set('colorTag', e.target.value)}
                                style={{
                                    width: 24, height: 24, borderRadius: '50%', border: 'none',
                                    cursor: 'pointer', padding: 0, flexShrink: 0
                                }}
                            />
                        </div>
                    </div>
                    <div className="field" style={{ flex: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ opacity: 0 }}>.</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving…' : initial ? '✓ Update' : '✓ Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

/* ── Category Card ── */
function CatCard({ cat, onEdit, onDelete }) {
    const [confirming, setConfirming] = useState(false);
    return (
        <div className="cat-card fade-in">
            <div className="cat-card-stripe" style={{ background: cat.colorTag }} />
            <div className="cat-card-body">
                <h3>{cat.name}</h3>
                {cat.description && (
                    <p className="cat-desc" style={{ marginTop: '0.25rem' }}>{cat.description}</p>
                )}
            </div>
            <div className="cat-card-footer">
                {confirming ? (
                    <div className="delete-confirm">
                        <span>Delete?</span>
                        <button className="btn btn-danger btn-sm"
                            onClick={() => { onDelete(cat._id); setConfirming(false); }}>Yes</button>
                        <button className="btn btn-ghost btn-sm"
                            onClick={() => setConfirming(false)}>No</button>
                    </div>
                ) : (
                    <>
                        <button className="btn btn-outline btn-sm" onClick={() => onEdit(cat)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirming(true)}>Delete</button>
                    </>
                )}
            </div>
        </div>
    );
}

/* ── Categories Page ── */
export default function Categories() {
    const { authHeaders } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editCat, setEditCat] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL, { headers: authHeaders() });
            const data = await res.json();
            if (data.success) setCategories(data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const openAdd = () => { setEditCat(null); setShowForm(true); };
    const openEdit = (c) => { setShowForm(false); setEditCat(c); };
    const closeAll = () => { setShowForm(false); setEditCat(null); };

    const handleSave = async (payload) => {
        const url = editCat ? `${API_URL}/${editCat._id}` : API_URL;
        const res = await fetch(url, {
            method: editCat ? 'PUT' : 'POST',
            headers: authHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to save');
        closeAll(); fetchAll();
    };

    const handleDelete = async (id) => {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: authHeaders() });
        fetchAll();
    };

    return (
        <>
            {/* Topbar */}
            <div className="topbar">
                <div>
                    <div className="topbar-title">Categories</div>
                    <div className="topbar-sub">Organise books into genres &amp; sections</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span className="stat-chip">🏷️ {categories.length} total</span>
                    {!showForm && !editCat && (
                        <button className="btn btn-primary" onClick={openAdd}>+ Add Category</button>
                    )}
                </div>
            </div>

            <div className="page-content">
                {/* Add form */}
                {showForm && (
                    <CategoryForm onSave={handleSave} onCancel={closeAll} />
                )}

                {/* Edit form — above the grid */}
                {editCat && (
                    <CategoryForm initial={editCat} onSave={handleSave} onCancel={closeAll} />
                )}

                {loading ? (
                    <p style={{ color: 'var(--ink-muted)' }}>Loading…</p>
                ) : categories.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🏷️</div>
                        <h3>No categories yet</h3>
                        <p>Click "+ Add Category" to create your first one.</p>
                    </div>
                ) : (
                    <div className="cat-grid">
                        {categories.map(cat => (
                            <CatCard key={cat._id} cat={cat} onEdit={openEdit} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
