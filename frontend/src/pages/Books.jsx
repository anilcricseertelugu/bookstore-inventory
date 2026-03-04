import React, { useState, useEffect } from 'react';

const API_BOOKS = 'http://localhost:5000/api/books';
const API_CATS = 'http://localhost:5000/api/categories';

const PRESET_COLORS = [
    '#b45309', '#7c3aed', '#be185d', '#dc2626',
    '#0891b2', '#059669', '#d97706', '#2563eb',
];

const currentYear = new Date().getFullYear();

const LANGUAGES = [
    'English', 'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam',
    'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Urdu', 'Sanskrit',
    'French', 'German', 'Spanish', 'Japanese', 'Chinese', 'Arabic', 'Other',
];

const EMPTY_FORM = {
    title: '', author: '', isbn: '', description: '',
    publishedYear: '', price: '', quantity: 0,
    language: 'English', categories: [], coverColor: '#b45309',
};

/* ── Inline Book Form ── */
function BookForm({ initial, categories, onSave, onCancel }) {
    const [form, setForm] = useState(initial ? {
        title: initial.title || '',
        author: initial.author || '',
        isbn: initial.isbn || '',
        description: initial.description || '',
        publishedYear: initial.publishedYear || '',
        price: initial.price ?? '',
        quantity: initial.quantity ?? 0,
        language: initial.language || 'English',
        categories: initial.categories?.map(c => c._id || c) || [],
        coverColor: initial.coverColor || '#b45309',
    } : { ...EMPTY_FORM });

    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const toggleCat = (id) => setForm(f => ({
        ...f,
        categories: f.categories.includes(id)
            ? f.categories.filter(c => c !== id)
            : [...f.categories, id]
    }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.title.trim()) return setError('Title is required.');
        if (!form.author.trim()) return setError('Author is required.');
        if (!form.language) return setError('Language is required.');
        if (form.price === '' || Number(form.price) < 0) return setError('Enter a valid price.');
        setSaving(true);
        try {
            await onSave({
                title: form.title.trim(), author: form.author.trim(),
                isbn: form.isbn.trim() || '',
                description: form.description.trim(),
                publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
                price: Number(form.price), quantity: Number(form.quantity),
                language: form.language,
                categories: form.categories, coverColor: form.coverColor,
            });
        } catch (err) { setError(err.message); }
        finally { setSaving(false); }
    };

    return (
        <div className="inline-form-panel fade-in">
            <div className="inline-form-header">
                <h3>{initial ? `Editing: ${initial.title}` : 'Add New Book'}</h3>
                <button className="btn btn-ghost btn-sm" onClick={onCancel}>✕ Cancel</button>
            </div>

            <form onSubmit={handleSubmit} className="inline-form-body">
                {error && <div className="alert-error">{error}</div>}

                <div className="field-row">
                    <div className="field">
                        <label>Title *</label>
                        <input placeholder="e.g. Dune" value={form.title} onChange={e => set('title', e.target.value)} required />
                    </div>
                    <div className="field">
                        <label>Author *</label>
                        <input placeholder="e.g. Frank Herbert" value={form.author} onChange={e => set('author', e.target.value)} required />
                    </div>
                    <div className="field field-narrow">
                        <label>Language *</label>
                        <select value={form.language} onChange={e => set('language', e.target.value)} required>
                            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div className="field field-narrow">
                        <label>Published Year</label>
                        <input type="number" placeholder={currentYear} min="1000" max={currentYear}
                            value={form.publishedYear} onChange={e => set('publishedYear', e.target.value)} />
                    </div>
                    <div className="field field-narrow">
                        <label>ISBN</label>
                        <input placeholder="978-..." value={form.isbn} onChange={e => set('isbn', e.target.value)} />
                    </div>
                </div>

                <div className="field-row">
                    <div className="field">
                        <label>Description</label>
                        <input placeholder="Brief summary…" value={form.description} onChange={e => set('description', e.target.value)} />
                    </div>
                    <div className="field field-narrow">
                        <label>Price (₹) *</label>
                        <input type="number" placeholder="299" min="0" step="0.01"
                            value={form.price} onChange={e => set('price', e.target.value)} required />
                    </div>
                    <div className="field field-narrow">
                        <label>Quantity</label>
                        <input type="number" placeholder="0" min="0"
                            value={form.quantity} onChange={e => set('quantity', e.target.value)} />
                    </div>
                </div>

                <div className="field-row align-center">
                    {/* Categories */}
                    <div className="field" style={{ flex: 2 }}>
                        <label>Categories</label>
                        {categories.length === 0
                            ? <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>No categories yet.</p>
                            : <div className="cat-checkbox-grid">
                                {categories.map(cat => (
                                    <label key={cat._id}
                                        className={`cat-check-item ${form.categories.includes(cat._id) ? 'checked' : ''}`}>
                                        <input type="checkbox" checked={form.categories.includes(cat._id)}
                                            onChange={() => toggleCat(cat._id)} />
                                        <span style={{
                                            width: 8, height: 8, borderRadius: '50%', background: cat.colorTag,
                                            display: 'inline-block', flexShrink: 0
                                        }} />
                                        <span>{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        }
                    </div>

                    {/* Color */}
                    <div className="field" style={{ flex: 1 }}>
                        <label>Spine Color</label>
                        <div className="color-presets">
                            {PRESET_COLORS.map(c => (
                                <button key={c} type="button"
                                    className={`color-dot ${form.coverColor === c ? 'selected' : ''}`}
                                    style={{ background: c }} onClick={() => set('coverColor', c)} title={c}
                                />
                            ))}
                            <input type="color" value={form.coverColor}
                                onChange={e => set('coverColor', e.target.value)}
                                style={{
                                    width: 24, height: 24, borderRadius: '50%', border: 'none',
                                    cursor: 'pointer', background: 'none', padding: 0, flexShrink: 0
                                }}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="field" style={{ flex: 'none', justifyContent: 'flex-end', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ opacity: 0 }}>.</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving…' : initial ? '✓ Update' : '✓ Add Book'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

/* ── Table Row ── */
function BookRow({ book, editing, onEdit, onDelete }) {
    const [confirming, setConfirming] = useState(false);
    const isEditing = editing === book._id;
    return (
        <tr className={`fade-in ${isEditing ? 'row-editing' : ''}`}>
            <td className="td-title">
                <span className="spine-dot" style={{ background: book.coverColor }} />
                {book.title}
            </td>
            <td>{book.author}</td>
            <td>{book.language || '—'}</td>
            <td>{book.publishedYear || '—'}</td>
            <td>
                {book.categories?.length > 0
                    ? book.categories.map(c => (
                        <span key={c._id} className="tag"
                            style={{
                                background: `${c.colorTag}20`, color: c.colorTag,
                                border: `1px solid ${c.colorTag}40`, marginRight: 3
                            }}>
                            {c.name}
                        </span>
                    ))
                    : <span style={{ color: 'var(--ink-muted)', fontSize: '0.78rem' }}>—</span>
                }
            </td>
            <td style={{ fontWeight: 600 }}>₹{Number(book.price).toFixed(2)}</td>
            <td>
                <span className={`stock-badge ${book.quantity > 5 ? 'stock-ok' : 'stock-low'}`}>
                    {book.quantity} in stock
                </span>
            </td>
            <td className="td-actions">
                {confirming ? (
                    <div className="delete-confirm">
                        <span>Delete?</span>
                        <button className="btn btn-danger btn-sm"
                            onClick={() => { onDelete(book._id); setConfirming(false); }}>Yes</button>
                        <button className="btn btn-ghost btn-sm"
                            onClick={() => setConfirming(false)}>No</button>
                    </div>
                ) : (
                    <>
                        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(book)}>Edit</button>
                        <button className="btn btn-danger btn-sm" style={{ marginLeft: 4 }}
                            onClick={() => setConfirming(true)}>Delete</button>
                    </>
                )}
            </td>
        </tr>
    );
}

/* ── Books Page ── */
export default function Books() {
    const [books, setBooks] = useState([]);
    const [cats, setCats] = useState([]);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);   // add form
    const [editBook, setEditBook] = useState(null);     // edit a specific book

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [bRes, cRes] = await Promise.all([fetch(API_BOOKS), fetch(API_CATS)]);
            const [bData, cData] = await Promise.all([bRes.json(), cRes.json()]);
            if (bData.success) setBooks(bData.data);
            if (cData.success) setCats(cData.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const openAdd = () => { setEditBook(null); setShowForm(true); };
    const openEdit = (b) => { setShowForm(false); setEditBook(b); };
    const closeAll = () => { setShowForm(false); setEditBook(null); };

    const handleSave = async (payload) => {
        const url = editBook ? `${API_BOOKS}/${editBook._id}` : API_BOOKS;
        const res = await fetch(url, {
            method: editBook ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to save');
        closeAll(); fetchAll();
    };

    const handleDelete = async (id) => {
        await fetch(`${API_BOOKS}/${id}`, { method: 'DELETE' });
        fetchAll();
    };

    const displayed = books.filter(b => {
        const matchCat = filterCat ? b.categories?.some(c => c._id === filterCat) : true;
        const matchSearch = search.trim()
            ? b.title.toLowerCase().includes(search.toLowerCase()) ||
            b.author.toLowerCase().includes(search.toLowerCase())
            : true;
        return matchCat && matchSearch;
    });

    return (
        <>
            {/* Topbar */}
            <div className="topbar">
                <div>
                    <div className="topbar-title">Books</div>
                    <div className="topbar-sub">Manage your bookstore inventory</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span className="stat-chip">📖 {books.length} total</span>
                    {!showForm && !editBook && (
                        <button className="btn btn-primary" onClick={openAdd}>+ Add Book</button>
                    )}
                </div>
            </div>

            <div className="page-content">
                {/* Add form — inline expansion */}
                {showForm && (
                    <BookForm categories={cats} onSave={handleSave} onCancel={closeAll} />
                )}

                {/* Toolbar */}
                <div className="toolbar">
                    <div className="search-wrap">
                        <span className="search-icon">🔍</span>
                        <input className="search-input" placeholder="Search by title or author…"
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="toolbar-select" value={filterCat}
                        onChange={e => setFilterCat(e.target.value)}>
                        <option value="">All Categories</option>
                        {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>

                {/* Table */}
                {loading ? (
                    <p style={{ color: 'var(--ink-muted)' }}>Loading…</p>
                ) : displayed.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📚</div>
                        <h3>{books.length === 0 ? 'No books yet' : 'No results found'}</h3>
                        <p>{books.length === 0
                            ? 'Click "+ Add Book" to add your first title.'
                            : 'Try adjusting your search or filter.'}</p>
                    </div>
                ) : (
                    <>
                        <div className="table-card">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Author</th>
                                        <th>Language</th>
                                        <th>Year</th>
                                        <th>Categories</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayed.map(b => (
                                        <React.Fragment key={b._id}>
                                            <BookRow
                                                book={b}
                                                editing={editBook?._id}
                                                onEdit={openEdit}
                                                onDelete={handleDelete}
                                            />
                                            {/* Inline edit row */}
                                            {editBook?._id === b._id && (
                                                <tr>
                                                    <td colSpan={8} style={{ padding: 0, background: 'var(--cream)' }}>
                                                        <BookForm
                                                            initial={editBook}
                                                            categories={cats}
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
                    </>
                )}
            </div>
        </>
    );
}
