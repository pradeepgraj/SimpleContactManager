# Simple Contact Manager

A lightweight full-stack web app for managing contacts, built with Node.js, Express, and Azure SQL Database. No frontend framework — just vanilla HTML, CSS, and JavaScript.

## Stack

- **Backend:** Node.js, Express 5
- **Database:** Azure SQL Database (via `mssql`)
- **Auth:** Server-side sessions (`express-session`) with bcrypt password hashing
- **Frontend:** Vanilla JS, Inter font, plain CSS with custom properties

## Getting started

### Prerequisites

- Node.js 18+
- An Azure SQL Database instance
- The following tables created in your database (see [Database schema](#database-schema))

### Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```
   PORT=3000
   DB_SERVER=your-server.database.windows.net
   DB_DATABASE=SimpleContactManager
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_PORT=1433
   SESSION_SECRET=replace-with-a-long-random-string
   ```

3. Create your first user:

   ```bash
   node create-user.js <username> <password>
   ```

4. Start the server:

   ```bash
   npm start
   ```

   The app will be available at `http://localhost:3000`.

## Database schema

Run these in your Azure SQL database before starting the app.

```sql
CREATE TABLE Contacts (
  Id        INT IDENTITY(1,1) PRIMARY KEY,
  FirstName NVARCHAR(100) NOT NULL,
  LastName  NVARCHAR(100) NOT NULL,
  Email     NVARCHAR(255) NULL,
  Phone     NVARCHAR(50)  NULL,
  CreatedAt DATETIME      DEFAULT GETUTCDATE(),
  UpdatedAt DATETIME      DEFAULT GETUTCDATE()
);

CREATE TABLE Users (
  Id           INT IDENTITY(1,1) PRIMARY KEY,
  Username     NVARCHAR(100) NOT NULL UNIQUE,
  PasswordHash NVARCHAR(255) NOT NULL,
  CreatedAt    DATETIME      DEFAULT GETUTCDATE()
);
```

## API endpoints

All endpoints require an active session (login first).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/contacts` | List all contacts |
| POST | `/api/contacts` | Create a contact |
| PUT | `/api/contacts/:id` | Update a contact |
| DELETE | `/api/contacts/:id` | Delete a contact |

## Project structure

```
server.js          # Express server, auth routes, contacts API
db.js              # Azure SQL connection pool
create-user.js     # One-time script to add a user
public/
  index.html       # Main contacts page (requires login)
  login.html       # Login page
  app.js           # Frontend logic
  styles.css       # Styles (CSS variables, no framework)
```
