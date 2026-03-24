# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                                  # Start the server on port 3000
node create-user.js <username> <password>  # Seed a user into the database
```

No build step, linter, or test suite is configured.

## Architecture

**SimpleContactManager** is a minimal full-stack Node.js app for CRUD contact management with session-based authentication.

### Backend (`server.js`, `db.js`)

- Express 5 server serving a REST API and static files from `public/`
- `db.js` manages a single lazily-initialized `mssql` connection pool to Azure SQL Database; import `getPool()` and `sql` from it in any new route file
- Parameterized queries are used throughout — keep it that way
- `express.static` is mounted with `{ index: false }` so `index.html` is never served directly — it goes through the protected `GET /` route instead

### Auth (`server.js`)

- Sessions managed by `express-session` with an in-memory store (sessions are lost on server restart — acceptable for now)
- `SESSION_SECRET` must be set in `.env`
- `requireAuth` middleware checks `req.session.userId`; redirects to `/login` for page routes, returns 401 for `/api/*` routes
- Passwords hashed with bcrypt (cost factor 12)
- `POST /login` uses a dummy hash comparison when the username doesn't exist to prevent timing-based username enumeration

**Auth routes:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/login` | Serve login page |
| POST | `/login` | Validate credentials, set session |
| POST | `/logout` | Destroy session, redirect to `/login` |

**Contacts API routes** (all protected by `requireAuth`)**:**

| Method | Path | Action |
|--------|------|--------|
| GET | `/api/contacts` | List all (ordered by LastName, FirstName) |
| POST | `/api/contacts` | Create |
| PUT | `/api/contacts/:id` | Update |
| DELETE | `/api/contacts/:id` | Delete |

### Database

Azure SQL Database (`SimpleContactManager`). Connection config comes from `.env`:

```
DB_SERVER, DB_DATABASE, DB_USER, DB_PASSWORD, DB_PORT, PORT, SESSION_SECRET
```

**Contacts table:**

| Column | Type |
|--------|------|
| Id | INT IDENTITY (PK) |
| FirstName | NVARCHAR(100) |
| LastName | NVARCHAR(100) |
| Email | NVARCHAR(255) NULL |
| Phone | NVARCHAR(50) NULL |
| CreatedAt | DATETIME |
| UpdatedAt | DATETIME |

**Users table:**

| Column | Type |
|--------|------|
| Id | INT IDENTITY (PK) |
| Username | NVARCHAR(100) UNIQUE |
| PasswordHash | NVARCHAR(255) |
| CreatedAt | DATETIME |

### Frontend (`public/`)

Vanilla JS — no framework or build tool.

- `login.html` — standalone login page, self-contained `<script>` block, posts to `POST /login`
- `index.html` — main contacts page, requires session; includes a Sign out button that posts to `POST /logout`
- `app.js` — all `fetch` calls go through `apiFetch()`, which redirects to `/login` on a 401 response
- `app.js` maintains a `contactsCache` array to populate the edit form without a second network request; the form doubles as create and update via a hidden `contact-id` field
