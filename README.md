# 📚 BookStore — Inventory & Order Management System

A full-stack **MERN** (MongoDB, Express, React, Node.js) application for managing a bookstore's inventory and orders. The project uses a **split deployment** architecture with the backend and frontend kept as independent services.

> **Current Phase:** Category Management (Phase 1)

---

## 📁 Project Structure

```
solitary-stellar/
├── backend/          # Node.js + Express REST API
│   ├── models/       # Mongoose data models
│   ├── routes/       # Express route handlers
│   └── server.js     # Entry point
├── frontend/         # React (Vite) SPA
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page-level components
│       ├── App.jsx
│       └── index.css     # Global design system
└── README.md
```

---

## ✨ Features — Phase 1: Book Categories

- **Add** book categories with a name, description, and a custom theme color
- **Edit** any existing category inline via a modal form
- **Delete** categories with an in-card confirmation (no browser dialog)
- **Color-coded cards** — each category has a unique accent color chosen from presets or a custom color picker
- Responsive grid layout that adapts from 1 to 3 columns

---

## 🛠 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Database  | MongoDB (Mongoose ODM)            |
| Backend   | Node.js, Express 5                |
| Frontend  | React 19, Vite 7                  |
| Styling   | Vanilla CSS (custom design system)|

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally **or** a [MongoDB Atlas](https://www.mongodb.com/atlas) URI

---

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd solitary-stellar
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/bookstore
```

> If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

#### Start the backend server

```bash
node server.js
```

The API will be available at `http://localhost:5000`.

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔌 API Reference

Base URL: `http://localhost:5000/api`

### Categories

| Method | Endpoint                 | Description              |
|--------|--------------------------|--------------------------|
| GET    | `/categories`            | Fetch all categories     |
| GET    | `/categories/:id`        | Fetch a single category  |
| POST   | `/categories`            | Create a new category    |
| PUT    | `/categories/:id`        | Update a category        |
| DELETE | `/categories/:id`        | Delete a category        |

#### Category Object

```json
{
  "_id": "64a81eb9afd6d49163527289",
  "name": "Science Fiction",
  "description": "Books exploring futuristic science and space concepts.",
  "colorTag": "#6366f1",
  "createdAt": "2026-03-04T11:59:53.746Z"
}
```

#### Create / Update Payload

```json
{
  "name": "Science Fiction",
  "description": "Books exploring futuristic science and space concepts.",
  "colorTag": "#6366f1"
}
```

---

## 🗺 Roadmap

- [x] Phase 1 — Book Category Management
- [ ] Phase 2 — Book Inventory (add/edit/delete books under categories)
- [ ] Phase 3 — Order Management
- [ ] Phase 4 — User Authentication & Roles
- [ ] Phase 5 — Reports & Dashboard

---

## 📄 License

MIT
