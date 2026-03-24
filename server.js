const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");
require("dotenv").config();

const { sql, getPool } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "change-me-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 }, // 8 hours
}));

// Serve static files (CSS, JS, login.html) but NOT index.html automatically.
// index.html is served via the protected GET / route below.
app.use(express.static(path.join(__dirname, "public"), { index: false }));

// ── Auth helper ───────────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    // API requests get a 401; page requests get redirected to login
    if (req.originalUrl.startsWith("/api/")) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    return res.redirect("/login");
  }
  next();
}

// ── Auth routes ───────────────────────────────────────────────────────────────

app.get("/login", (req, res) => {
  if (req.session.userId) return res.redirect("/");
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("Username", sql.NVarChar(100), username)
      .query("SELECT Id, PasswordHash FROM Users WHERE Username = @Username");

    const user = result.recordset[0];

    // Use a fixed-time comparison even when user doesn't exist (prevents timing attacks)
    const hash = user ? user.PasswordHash : "$2b$12$invalidhashfortimingnoop000000000000000000000000000000";
    const match = await bcrypt.compare(password, hash);

    if (!user || !match) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: "Login failed" });
      req.session.userId = user.Id;
      req.session.username = username;
      res.json({ ok: true });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// ── Protected page ────────────────────────────────────────────────────────────

app.get("/", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Contacts API (all routes protected) ──────────────────────────────────────

app.get("/api/contacts", requireAuth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query(`
        SELECT Id, FirstName, LastName, Email, Phone, CreatedAt, UpdatedAt
        FROM Contacts
        ORDER BY LastName, FirstName
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

app.post("/api/contacts", requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    const pool = await getPool();
    const result = await pool
      .request()
      .input("FirstName", sql.NVarChar(100), firstName)
      .input("LastName", sql.NVarChar(100), lastName)
      .input("Email", sql.NVarChar(255), email || null)
      .input("Phone", sql.NVarChar(50), phone || null)
      .query(`
        INSERT INTO Contacts (FirstName, LastName, Email, Phone)
        OUTPUT INSERTED.*
        VALUES (@FirstName, @LastName, @Email, @Phone)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ error: "Failed to create contact" });
  }
});

app.put("/api/contacts/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { firstName, lastName, email, phone } = req.body;

    const pool = await getPool();
    const result = await pool
      .request()
      .input("Id", sql.Int, id)
      .input("FirstName", sql.NVarChar(100), firstName)
      .input("LastName", sql.NVarChar(100), lastName)
      .input("Email", sql.NVarChar(255), email || null)
      .input("Phone", sql.NVarChar(50), phone || null)
      .query(`
        UPDATE Contacts
        SET
          FirstName = @FirstName,
          LastName  = @LastName,
          Email     = @Email,
          Phone     = @Phone,
          UpdatedAt = SYSUTCDATETIME()
        OUTPUT INSERTED.*
        WHERE Id = @Id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ error: "Failed to update contact" });
  }
});

app.delete("/api/contacts/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const pool = await getPool();
    const result = await pool
      .request()
      .input("Id", sql.Int, id)
      .query("DELETE FROM Contacts WHERE Id = @Id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
