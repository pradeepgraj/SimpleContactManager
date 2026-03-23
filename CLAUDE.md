# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Start the server (node server.js) on port 3000
```

No build step, linter, or test suite is configured.

## Architecture

**SimpleContactManager** is a minimal full-stack Node.js app for CRUD contact management.

### Backend (`server.js`, `db.js`)

- Express 5 server serving a REST API and static files from `public/`
- All API routes live in `server.js` under `/api/contacts`
- `db.js` manages a single lazily-initialized `mssql` connection pool to Azure SQL Database; import `getPool()` and `sql` from it in any new route file
- Parameterized queries are used throughout — keep it that way

**API endpoints:**

| Method | Path | Action |
|--------|------|--------|
| GET | `/api/contacts` | List all (ordered by LastName, FirstName) |
| POST | `/api/contacts` | Create |
| PUT | `/api/contacts/:id` | Update |
| DELETE | `/api/contacts/:id` | Delete |

### Database

Azure SQL Database (`SimpleContactManager` on `pg1.database.windows.net`). Connection config comes from `.env`:

```
DB_SERVER, DB_DATABASE, DB_USER, DB_PASSWORD, DB_PORT, PORT
```

**Contacts table schema:**

| Column | Type |
|--------|------|
| Id | INT IDENTITY (PK) |
| FirstName | NVARCHAR(100) |
| LastName | NVARCHAR(100) |
| Email | NVARCHAR(255) NULL |
| Phone | NVARCHAR(50) NULL |
| CreatedAt | DATETIME |
| UpdatedAt | DATETIME |

### Frontend (`public/`)

Vanilla JS — no framework or build tool. `app.js` fetches the REST API and maintains a `contactsCache` array for populating the edit form without an extra network request. The form doubles as both create and update (toggled by a hidden `contact-id` field).
