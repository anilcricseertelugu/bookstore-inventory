import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BOOKS = `${BASE_URL}/api/books`;
const API_CUSTOMERS = `${BASE_URL}/api/customers`;
const API_ORDERS = `${BASE_URL}/api/orders`;

/* ══════════════════════════════════════
   Customer Search
══════════════════════════════════════ */
function CustomerSearch({ selected, onSelect, onClear, authHeaders }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (!query.trim()) { setResults([]); return; }
        const t = setTimeout(async () => {
            try {
                const res = await fetch(`${API_CUSTOMERS}?search=${encodeURIComponent(query)}`, { headers: authHeaders() });
                const data = await res.json();
                if (data.success) setResults(data.data.slice(0, 8));
            } catch (e) { console.error(e); }
        }, 300);
        return () => clearTimeout(t);
    }, [query]);

    if (selected) {
        return (
            <div className="selected-customer">
                <span className="customer-id-badge">{selected.customerId}</span>
                <span className="sel-cust-name">{selected.name}</span>
                {selected.phone && <span className="sel-cust-meta">📞 {selected.phone}</span>}
                <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>✕ Remove</button>
            </div>
        );
    }

    return (
        <div className="book-search-wrap">
            <div className="search-wrap">
                <input
                    className="search-input"
                    placeholder="Search by name, phone or Customer ID… (leave blank for walk-in)"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{ paddingLeft: '0.875rem' }}
                />
            </div>
            {query.trim() && results.length > 0 && (
                <div className="book-search-results">
                    {results.map(c => (
                        <div key={c._id} className="bsr-row"
                            style={{ cursor: 'pointer' }}
                            onClick={() => { onSelect(c); setQuery(''); setResults([]); }}>
                            <div className="bsr-info">
                                <span className="bsr-title">{c.name}</span>
                                <span className="bsr-meta">
                                    {c.phone && `📞 ${c.phone}`}
                                    {c.phone && c.email && ' · '}
                                    {c.email && c.email}
                                </span>
                            </div>
                            <span className="customer-id-badge">{c.customerId}</span>
                        </div>
                    ))}
                </div>
            )}
            {query.trim() && results.length === 0 && (
                <div className="book-search-results">
                    <div className="bsr-row" style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                        No customers found — will record as walk-in
                    </div>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════
   Book Search (per order)
══════════════════════════════════════ */
function BookSearch({ onAdd, cartBookIds, authHeaders }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query.trim()) { setResults([]); return; }
        const t = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(API_BOOKS, { headers: authHeaders() });
                const data = await res.json();
                if (data.success) {
                    const q = query.toLowerCase();
                    setResults(data.data.filter(b =>
                        b.title.toLowerCase().includes(q) ||
                        b.author.toLowerCase().includes(q) ||
                        (b.language || '').toLowerCase().includes(q)
                    ));
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        }, 300);
        return () => clearTimeout(t);
    }, [query]);

    const stockClass = q => q === 0 ? 'stock-low' : q <= 5 ? 'stock-warn' : 'stock-ok';

    return (
        <div className="book-search-wrap">
            <div className="search-wrap">
                <input
                    className="search-input"
                    placeholder="Search books by title, author or language…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{ paddingLeft: '0.875rem' }}
                />
            </div>
            {query.trim() && (
                <div className="book-search-results">
                    {loading && <div className="bsr-row" style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>Searching…</div>}
                    {!loading && results.length === 0 && (
                        <div className="bsr-row" style={{ color: 'var(--ink-muted)' }}>No books match "{query}"</div>
                    )}
                    {results.map(b => {
                        const inCart = cartBookIds.includes(b._id);
                        const noStock = b.quantity === 0;
                        return (
                            <div key={b._id} className="bsr-row">
                                <div className="bsr-info">
                                    <span className="bsr-title">{b.title}</span>
                                    <span className="bsr-meta">{b.author}{b.language ? ` · ${b.language}` : ''}</span>
                                </div>
                                <div className="bsr-right">
                                    <span className={`stock-badge ${stockClass(b.quantity)}`}>{b.quantity} in stock</span>
                                    <span className="bsr-price">₹{Number(b.price).toFixed(2)}</span>
                                    <button className="btn btn-primary btn-sm"
                                        disabled={noStock || inCart}
                                        onClick={() => { onAdd(b); setQuery(''); setResults([]); }}>
                                        {inCart ? '✓ Added' : noStock ? 'Out of stock' : '+ Add'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════
   Cart Item
══════════════════════════════════════ */
function CartItem({ item, onQtyChange, onRemove }) {
    return (
        <div className="cart-item">
            <div className="cart-item-info">
                <span className="cart-item-title">{item.bookTitle}</span>
                {item.language && <span className="cart-item-lang">{item.language}</span>}
            </div>
            <div className="cart-item-controls">
                <span className="cart-unit-price">₹{Number(item.unitPrice).toFixed(2)} each</span>
                <div className="qty-stepper">
                    <button className="qty-btn" type="button" onClick={() => onQtyChange(item.bookId, item.quantity - 1)}>−</button>
                    <span className="qty-val">{item.quantity}</span>
                    <button className="qty-btn" type="button" onClick={() => onQtyChange(item.bookId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxQty}>+</button>
                </div>
                <span className="cart-subtotal">₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => onRemove(item.bookId)}>✕</button>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════
   New Order / Sale Form
══════════════════════════════════════ */
function OrderForm({ onSave, onCancel, authHeaders }) {
    const [customer, setCustomer] = useState(null);
    const [cart, setCart] = useState([]);
    const [amountReceived, setAmt] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const total = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const received = parseFloat(amountReceived) || 0;
    const discount = total - received;

    const addBook = (book) => {
        setCart(c => [...c, {
            bookId: book._id, bookTitle: book.title,
            language: book.language || '', unitPrice: book.price,
            quantity: 1, maxQty: book.quantity
        }]);
        if (amountReceived === '' || parseFloat(amountReceived) === 0) {
            setAmt(Number((total + book.price).toFixed(2)).toString());
        }
    };

    const setQty = (bookId, qty) =>
        setCart(c => c.map(i => i.bookId === bookId
            ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxQty)) } : i));

    const removeBook = (bookId) => setCart(c => c.filter(i => i.bookId !== bookId));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (cart.length === 0) return setError('Add at least one book to the order.');
        if (amountReceived === '' || isNaN(received) || received < 0)
            return setError('Please enter the amount received.');
        setSaving(true);
        try {
            await onSave({
                customer: customer?._id || null,
                customerId: customer?.customerId || '',
                customerName: customer?.name || '',
                customerPhone: customer?.phone || '',
                items: cart.map(i => ({ bookId: i.bookId, quantity: i.quantity })),
                amountReceived: received,
                notes: notes.trim()
            });
        } catch (err) { setError(err.message); }
        finally { setSaving(false); }
    };

    return (
        <div className="inline-form-panel fade-in">
            <div className="inline-form-header">
                <h3>New Sale</h3>
                <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>✕ Cancel</button>
            </div>
            <form onSubmit={handleSubmit} className="inline-form-body">
                {error && <div className="alert-error">{error}</div>}

                {/* Customer */}
                <div className="field">
                    <label>Customer <span style={{ fontWeight: 400, color: 'var(--ink-muted)' }}>(optional — leave blank for walk-in)</span></label>
                    <CustomerSearch selected={customer} onSelect={setCustomer} onClear={() => setCustomer(null)} authHeaders={authHeaders} />
                </div>

                {/* Book picker */}
                <div className="field" style={{ marginTop: '0.75rem' }}>
                    <label>Add Books *</label>
                    <BookSearch onAdd={addBook} cartBookIds={cart.map(i => i.bookId)} authHeaders={authHeaders} />
                </div>

                {/* Cart */}
                {cart.length > 0 && (
                    <div className="cart-list" style={{ marginTop: '0.75rem' }}>
                        <div className="cart-header">
                            <span>Book</span><span>Qty</span><span style={{ textAlign: 'right' }}>Subtotal</span>
                        </div>
                        {cart.map(item => (
                            <CartItem key={item.bookId} item={item} onQtyChange={setQty} onRemove={removeBook} />
                        ))}
                    </div>
                )}

                {cart.length === 0 && (
                    <p style={{ color: 'var(--ink-muted)', fontSize: '0.82rem', marginTop: '0.5rem' }}>
                        Search books above to add them to this sale.
                    </p>
                )}

                {/* Payment */}
                {cart.length > 0 && (
                    <div className="payment-panel">
                        <div className="payment-row">
                            <span className="payment-label">Bill Total</span>
                            <span className="payment-value bill-total">₹{total.toFixed(2)}</span>
                        </div>
                        <div className="payment-row">
                            <label className="payment-label" htmlFor="amt-recv">Amount Received *</label>
                            <input id="amt-recv" type="number" min="0" step="0.01"
                                className="payment-input" placeholder={total.toFixed(2)}
                                value={amountReceived} onChange={e => setAmt(e.target.value)} />
                        </div>
                        {discount > 0.005 && (
                            <div className="payment-row discount-row">
                                <span className="payment-label">Discount Given</span>
                                <span className="payment-value discount-val">− ₹{discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="field" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                            <label>Notes (optional)</label>
                            <input placeholder="Any note about this sale…" value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                            <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Processing…' : '✓ Confirm Sale'}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}

/* ══════════════════════════════════════
   Order Row (history table)
══════════════════════════════════════ */
function OrderRow({ order, onDelete }) {
    const [confirming, setConfirming] = useState(false);
    const date = new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return (
        <tr className="fade-in">
            <td>
                <span className="customer-id-badge"
                    style={{ background: 'rgba(5,150,105,0.1)', borderColor: 'rgba(5,150,105,0.3)', color: '#059669' }}>
                    {order.orderId}
                </span>
            </td>
            <td>
                {order.customerName
                    ? <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{order.customerName}</div>
                        {order.customerId && <div><span className="customer-id-badge" style={{ fontSize: '0.7rem' }}>{order.customerId}</span></div>}
                        {order.customerPhone && <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>📞 {order.customerPhone}</div>}
                    </div>
                    : <span style={{ color: 'var(--ink-muted)', fontSize: '0.78rem' }}>Walk-in</span>
                }
            </td>
            <td>
                {order.items.map((item, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
                        <strong>{item.bookTitle}</strong>
                        {item.language && <span style={{ color: 'var(--ink-muted)' }}> · {item.language}</span>}
                        <span style={{ color: 'var(--ink-muted)' }}> × {item.quantity}</span>
                    </div>
                ))}
            </td>
            <td style={{ fontWeight: 600 }}>₹{Number(order.totalAmount).toFixed(2)}</td>
            <td style={{ fontWeight: 600, color: 'var(--accent)' }}>₹{Number(order.amountReceived).toFixed(2)}</td>
            <td>
                {Number(order.discount) > 0
                    ? <span style={{ color: '#059669', fontWeight: 600 }}>₹{Number(order.discount).toFixed(2)}</span>
                    : <span style={{ color: 'var(--ink-muted)', fontSize: '0.78rem' }}>—</span>}
            </td>
            <td style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{date}<br />{time}</td>
            <td className="td-actions">
                {confirming ? (
                    <div className="delete-confirm">
                        <span>Delete &amp; restore?</span>
                        <button className="btn btn-danger btn-sm"
                            onClick={() => { onDelete(order._id); setConfirming(false); }}>Yes</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>No</button>
                    </div>
                ) : (
                    <button className="btn btn-danger btn-sm" onClick={() => setConfirming(true)}>Delete</button>
                )}
            </td>
        </tr>
    );
}

/* ══════════════════════════════════════
   Orders Page
══════════════════════════════════════ */
export default function Orders() {
    const { authHeaders } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_ORDERS, { headers: authHeaders() });
            const data = await res.json();
            if (data.success) setOrders(data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleSave = async (payload) => {
        const res = await fetch(API_ORDERS, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to save order');
        setShowForm(false);
        fetchAll();
    };

    const handleDelete = async (id) => {
        await fetch(`${API_ORDERS}/${id}`, { method: 'DELETE', headers: authHeaders() });
        fetchAll();
    };

    const totalRevenue = orders.reduce((s, o) => s + o.amountReceived, 0);
    const totalDiscount = orders.reduce((s, o) => s + (o.discount || 0), 0);

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="topbar-title">Orders</div>
                    <div className="topbar-sub">Walk-in sales · stock auto-deducted on confirmation</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="stat-chip">🛒 {orders.length} sales</span>
                    <span className="stat-chip">💰 ₹{totalRevenue.toFixed(2)} received</span>
                    {totalDiscount > 0 && (
                        <span className="stat-chip"
                            style={{ background: 'rgba(5,150,105,0.1)', color: '#059669', border: '1px solid rgba(5,150,105,0.2)' }}>
                            🏷️ ₹{totalDiscount.toFixed(2)} discounted
                        </span>
                    )}
                    {!showForm && (
                        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New Sale</button>
                    )}
                </div>
            </div>

            <div className="page-content">
                {showForm && <OrderForm onSave={handleSave} onCancel={() => setShowForm(false)} authHeaders={authHeaders} />}

                {loading ? (
                    <p style={{ color: 'var(--ink-muted)' }}>Loading…</p>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🛒</div>
                        <h3>No sales yet</h3>
                        <p>Click "+ New Sale" to record your first sale.</p>
                    </div>
                ) : (
                    <div className="table-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Books</th>
                                    <th>Bill Total</th>
                                    <th>Received</th>
                                    <th>Discount</th>
                                    <th>Date &amp; Time</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <OrderRow key={o._id} order={o} onDelete={handleDelete} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
