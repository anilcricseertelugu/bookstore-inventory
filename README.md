# 📚 BookStore — Inventory & Order Management System

A full-stack **MERN** (MongoDB, Express, React, Node.js) application for managing a bookstore's inventory and orders. The project follows a **split deployment** architecture — `backend` and `frontend` are independent services in the same repository.

---

## 📁 Project Structure

```
solitary-stellar/
├── backend/
│   ├── models/
│   │   ├── Category.js     # Mongoose schema for book categories
│   │   └── Book.js         # Mongoose schema for books (refs Category)
│   ├── routes/
│   │   ├── categories.js   # CRUD API for categories
│   │   └── books.js        # CRUD API for books
│   └── server.js           # Express entry point
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Books.jsx       # Book inventory page (table + inline form)
│       │   └── Categories.jsx  # Category management page (cards + inline form)
│       ├── App.jsx             # Sidebar layout + page routing
│       └── index.css           # Global design system (warm cream theme)
└── README.md
```

---

## ✨ Features

### Phase 1 — Book Categories ✅
- Add, edit, delete book categories
- Each category has a name, description, and a custom accent color
- Inline expand-to-form (no popup dialogs)

### Phase 2 — Book Inventory ✅
- Add, edit, delete books with full details:
  - Title, Author, Published Year, ISBN, Description
  - Price and Quantity in Stock
  - Multi-category tagging (checkboxes)
  - Spine / cover color picker
- Books displayed in a sortable data table
- Search by title or author; filter by category
- Stock badges (green = healthy, red = low ≤ 5)
- Inline edit form expands beneath the selected table row

### UI Design
- Warm cream/white light theme with amber-gold accent
- Fixed sidebar navigation with **Playfair Display** serif brand font and **Inter** for UI
- No modal dialogs — all forms expand inline within the page
- Sticky topbar with page title and live count chip

---

## 🛠 Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Database  | MongoDB (Mongoose ODM)             |
| Backend   | Node.js, Express 5                 |
| Frontend  | React 19, Vite 7                   |
| Styling   | Vanilla CSS (custom design system) |
| Fonts     | Google Fonts — Inter + Playfair Display |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally **or** a [MongoDB Atlas](https://www.mongodb.com/atlas) URI

### 1. Clone the repository

```bash
git clone https://github.com/anilcricseertelugu/bookstore-inventory.git
cd bookstore-inventory
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/bookstore
```

Start the backend:

```bash
node server.js
# → Server running on port 5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 🔌 API Reference

Base URL: `http://localhost:5000/api`

### Categories

| Method | Endpoint           | Description           |
|--------|--------------------|-----------------------|
| GET    | `/categories`      | Fetch all categories  |
| GET    | `/categories/:id`  | Fetch single category |
| POST   | `/categories`      | Create category       |
| PUT    | `/categories/:id`  | Update category       |
| DELETE | `/categories/:id`  | Delete category       |

**Category object:**
```json
{
  "_id": "...",
  "name": "Science Fiction",
  "description": "Futuristic science and space concepts.",
  "colorTag": "#7c3aed",
  "createdAt": "2026-03-04T12:00:00.000Z"
}
```

### Books

| Method | Endpoint        | Description                          |
|--------|-----------------|--------------------------------------|
| GET    | `/books`        | Fetch all books (`?category=id`)     |
| GET    | `/books/:id`    | Fetch single book                    |
| POST   | `/books`        | Create book                          |
| PUT    | `/books/:id`    | Update book                          |
| DELETE | `/books/:id`    | Delete book                          |

**Book object:**
```json
{
  "_id": "...",
  "title": "Dune",
  "author": "Frank Herbert",
  "publishedYear": 1965,
  "isbn": "978-0-441-17271-9",
  "description": "An epic science fiction novel.",
  "price": 499,
  "quantity": 12,
  "categories": [{ "_id": "...", "name": "Science Fiction", "colorTag": "#7c3aed" }],
  "coverColor": "#7c3aed",
  "createdAt": "2026-03-04T12:00:00.000Z"
}
```

**Create / Update payload:**
```json
{
  "title": "Dune",
  "author": "Frank Herbert",
  "publishedYear": 1965,
  "isbn": "978-0-441-17271-9",
  "description": "An epic science fiction novel.",
  "price": 499,
  "quantity": 12,
  "categories": ["<category_id>"],
  "coverColor": "#7c3aed"
}
```

---

## 🗺 Roadmap

- [x] Phase 1 — Book Category Management
- [x] Phase 2 — Book Inventory Management
- [ ] Phase 3 — Order Management
- [ ] Phase 4 — User Authentication & Roles
- [ ] Phase 5 — Reports & Dashboard

---

## 📄 License

MIT
