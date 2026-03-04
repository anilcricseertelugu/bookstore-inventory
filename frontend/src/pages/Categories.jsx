import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/categories';

const PRESET_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#3b82f6', '#06b6d4',
];

function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
}

function CategoryForm({ initial, onSave, onCancel }) {
    const [form, setForm] = useState({
        name: initial?.name || '',
        description: initial?.description || '',
        colorTag: initial?.colorTag || '#6366f1',
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
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="alert-error">{error}</div>}

            <div className="field">
                <label htmlFor="cat-name">Category Name *</label>
                <input id="cat-name" type="text" placeholder="e.g. Science Fiction" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>

            <div className="field">
                <label htmlFor="cat-desc">Description</label>
                <textarea id="cat-desc" placeholder="A brief description of this genre..." rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            <div className="field">
                <label>Theme Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {PRESET_COLORS.map(c => (
                        <button key={c} type="button" onClick={() => set('colorTag', c)}
                            style={{
                                width: 24, height: 24, borderRadius: '50%', background: c,
                                border: `2px solid ${form.colorTag === c ? '#fff' : 'transparent'}`,
                                cursor: 'pointer', transition: 'border-color 0.15s', flexShrink: 0
                            }}
                            title={c}
                        />
                    ))}
                    <input type="color" value={form.colorTag} onChange={e => set('colorTag', e.target.value)}
                        style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'none', padding: 0 }}
                        title="Custom color"
                    />
                </div>
            </div>

            <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : initial ? 'Update' : 'Save Category'}
                </button>
            </div>
        </form>
    );
}

function CategoryCard({ cat, onEdit, onDelete }) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const handleDelete = async () => {
        await onDelete(cat._id);
        setConfirmingDelete(false);
    };

    return (
        <div className="cat-card fade-in">
            <div className="cat-card-accent" style={{ background: cat.colorTag }} />
            <div className="cat-card-header">
                <div className="cat-dot" style={{ background: cat.colorTag }} />
                <h3>{cat.name}</h3>
            </div>
            {cat.description && <p className="cat-desc">{cat.description}</p>}
            <div className="cat-card-actions">
                {confirmingDelete ? (
                    <div className="delete-confirm">
                        <span>Delete?</span>
                        <button className="btn btn-danger-ghost btn-sm" onClick={handleDelete}>Yes, delete</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setConfirmingDelete(false)}>Cancel</button>
                    </div>
                ) : (
                    <>
                        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(cat)}>Edit</button>
                        <button className="btn btn-danger-ghost btn-sm" onClick={() => setConfirmingDelete(true)}>Delete</button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCat, setEditingCat] = useState(null);

    const fetchAll = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            if (data.success) setCategories(data.data);
        } catch (err) {
            console.error('Fetch error', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const openAdd = () => { setEditingCat(null); setModalOpen(true); };
    const openEdit = (cat) => { setEditingCat(cat); setModalOpen(true); };
    const closeModal = () => setModalOpen(false);

    const handleSave = async (payload) => {
        const method = editingCat ? 'PUT' : 'POST';
        const url = editingCat ? `${API_URL}/${editingCat._id}` : API_URL;
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to save');
        closeModal();
        fetchAll();
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) fetchAll();
        } catch (err) {
            console.error('Delete error', err);
        }
    };

    return (
        <div className="container fade-in">
            <div className="page-header">
                <div>
                    <h1>Book Categories</h1>
                    <p>Manage the genres and sections of your bookstore inventory.</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Category</button>
            </div>

            {isLoading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
            ) : categories.length === 0 ? (
                <div className="empty-state">
                    <h3>No categories yet</h3>
                    <p>Click <strong>+ Add Category</strong> to create your first one.</p>
                </div>
            ) : (
                <div className="card-grid">
                    {categories.map(cat => (
                        <CategoryCard key={cat._id} cat={cat} onEdit={openEdit} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={closeModal} title={editingCat ? 'Edit Category' : 'New Category'}>
                <CategoryForm initial={editingCat} onSave={handleSave} onCancel={closeModal} />
            </Modal>
        </div>
    );
}
