import { useState } from 'react';
import BooksPage from './pages/Books';
import CategoriesPage from './pages/Categories';
import CustomersPage from './pages/Customers';
import './index.css';


export default function App() {
  const [page, setPage] = useState('books');

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>BookStore</h1>
          <p>Inventory Manager</p>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-label">Inventory</div>
          <button
            className={`nav-item ${page === 'books' ? 'active' : ''}`}
            onClick={() => setPage('books')}
          >
            <span className="nav-icon">📖</span>
            Books
          </button>
          <button
            className={`nav-item ${page === 'categories' ? 'active' : ''}`}
            onClick={() => setPage('categories')}
          >
            <span className="nav-icon">🏷️</span>
            Categories
          </button>
          <div className="sidebar-label" style={{ marginTop: '1.25rem' }}>Customers</div>
          <button
            className={`nav-item ${page === 'customers' ? 'active' : ''}`}
            onClick={() => setPage('customers')}
          >
            <span className="nav-icon">👤</span>
            Customers
          </button>
        </nav>
      </aside>

      {/* ── Main ── */}
      <div className="main-area">
        {page === 'books' && <BooksPage />}
        {page === 'categories' && <CategoriesPage />}
        {page === 'customers' && <CustomersPage />}
      </div>
    </div>
  );
}
