# Inventory Manager (MERN)

A MongoDB + Express + React + Node inventory management system with JWT login.

```
backend/   Express 5 API, Mongoose models, JWT auth   (port 5000)
frontend/  React 19 + Vite UI                         (port 5173)
```

## Run locally

Requires Node 18+ and MongoDB on `mongodb://127.0.0.1:27017`.

```bash
# 1. API
cd backend
npm install
npm run seed      # optional: creates admin@example.com / admin123 + sample items
npm run dev

# 2. UI (new terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and log in (or register a new account).

Configuration lives in `backend/.env` (see `.env.example`). Change `JWT_SECRET` before deploying.

## API

| Method | Route                 | Auth | Description                          |
|--------|-----------------------|------|--------------------------------------|
| POST   | /api/auth/register    | –    | Create account, returns token        |
| POST   | /api/auth/login       | –    | Login, returns token                 |
| GET    | /api/auth/me          | ✔    | Current user                         |
| GET    | /api/items            | ✔    | List items (`?search=`, `?category=`) |
| GET    | /api/items/stats      | ✔    | Totals, stock value, low-stock count |
| GET    | /api/items/:id        | ✔    | Get one item                         |
| POST   | /api/items            | ✔    | Create item                          |
| PUT    | /api/items/:id        | ✔    | Update item                          |
| DELETE | /api/items/:id        | ✔    | Delete item                          |
| GET    | /api/health           | –    | Health + DB status                   |

Authenticated routes need `Authorization: Bearer <token>`.
