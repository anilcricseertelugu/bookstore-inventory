import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import BooksPage from './pages/Books';
import CategoriesPage from './pages/Categories';
import CustomersPage from './pages/Customers';
import OrdersPage from './pages/Orders';
import BranchesPage from './pages/Branches';
import UsersPage from './pages/Users';
import './index.css';

/* ─── Owner App ──────────────────────────────────────────── */
function OwnerApp() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState('branches');
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">📚</span>
          <span className="brand-name">BookStore</span>
        </div>
        <div className="sidebar-label">Administration</div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${page === 'branches' ? 'active' : ''}`} onClick={() => setPage('branches')}>
            <span className="nav-icon">🏪</span> Branches
          </button>
          <button className={`nav-item ${page === 'users' ? 'active' : ''}`} onClick={() => setPage('users')}>
            <span className="nav-icon">👤</span> Users
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user" style={{ justifyContent: 'space-between' }}>
            <div>
              <span className="user-role-badge owner">Owner</span>
              <span className="user-name">{user.username}</span>
            </div>
            <button className="btn btn-ghost btn-sm" title="Change Password" onClick={() => setShowPwd(true)} style={{ padding: '0.2rem 0.4rem', fontSize: '0.9rem' }}>🔑</button>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '0.5rem' }} onClick={logout}>
            Sign Out
          </button>
        </div>
      </aside>
      <main className="main-content">
        {page === 'branches' && <BranchesPage />}
        {page === 'users' && <UsersPage />}
      </main>

      {showPwd && <ChangePasswordModal onClose={() => setShowPwd(false)} />}
    </div>
  );
}

/* ─── Branch User App ─────────────────────────────────────── */
function BranchApp() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState('books');
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">📚</span>
          <span className="brand-name">BookStore</span>
        </div>
        <div className="sidebar-label">Inventory</div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${page === 'books' ? 'active' : ''}`} onClick={() => setPage('books')}>
            <span className="nav-icon">📖</span> Books
          </button>
          <button className={`nav-item ${page === 'categories' ? 'active' : ''}`} onClick={() => setPage('categories')}>
            <span className="nav-icon">🏷️</span> Categories
          </button>
          <div className="sidebar-label" style={{ marginTop: '1.25rem' }}>Customers</div>
          <button className={`nav-item ${page === 'customers' ? 'active' : ''}`} onClick={() => setPage('customers')}>
            <span className="nav-icon">👥</span> Customers
          </button>
          <div className="sidebar-label" style={{ marginTop: '1.25rem' }}>Sales</div>
          <button className={`nav-item ${page === 'orders' ? 'active' : ''}`} onClick={() => setPage('orders')}>
            <span className="nav-icon">🛒</span> Orders
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user" style={{ justifyContent: 'space-between' }}>
            <div>
              <span className="user-role-badge branch">
                {user.branch?.name || 'Branch'}
              </span>
              <span className="user-name">{user.username}</span>
            </div>
            <button className="btn btn-ghost btn-sm" title="Change Password" onClick={() => setShowPwd(true)} style={{ padding: '0.2rem 0.4rem', fontSize: '0.9rem' }}>🔑</button>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '0.5rem' }} onClick={logout}>
            Sign Out
          </button>
        </div>
      </aside>
      <main className="main-content">
        {page === 'books' && <BooksPage />}
        {page === 'categories' && <CategoriesPage />}
        {page === 'customers' && <CustomersPage />}
        {page === 'orders' && <OrdersPage />}
      </main>

      {showPwd && <ChangePasswordModal onClose={() => setShowPwd(false)} />}
    </div>
  );
}

/* ─── Change Password Modal ─────────────────────────────── */
function ChangePasswordModal({ onClose }) {
  const { authHeaders } = useAuth();
  const [form, setForm] = useState({ oldPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.oldPassword || !form.newPassword) return setError('Both fields are required');
    if (form.newPassword.length < 6) return setError('New password must be at least 6 characters');
    setError(''); setSuccess(''); setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/password', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to change password');
      setSuccess('Password updated successfully!');
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content login-card" style={{ padding: '2rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--accent)' }}>Change Password</h3>
        {error && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success" style={{ background: '#d1fae5', color: '#065f46', padding: '0.625rem 0.875rem', borderRadius: 6, marginBottom: '1rem', border: '1px solid #10b981', fontSize: '0.85rem' }}>{success}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="field">
            <label>Current Password *</label>
            <input type="password" placeholder="Enter current password" value={form.oldPassword} onChange={e => setForm(f => ({ ...f, oldPassword: e.target.value }))} autoFocus />
          </div>
          <div className="field">
            <label>New Password *</label>
            <input type="password" placeholder="Min 6 characters" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : '✓ Update Password'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Root ────────────────────────────────────────────────── */
function Root() {
  const { user } = useAuth();
  if (!user) return <Login />;
  return user.role === 'owner' ? <OwnerApp /> : <BranchApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
