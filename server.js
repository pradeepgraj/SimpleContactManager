const express = require("express");
const path = require("path");
require("dotenv").config();

const { sql, getPool } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/contacts", async (req, res) => {
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

app.post("/api/contacts", async (req, res) => {
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

app.put("/api/contacts/:id", async (req, res) => {
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
          LastName = @LastName,
          Email = @Email,
          Phone = @Phone,
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

app.delete("/api/contacts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const pool = await getPool();
    const result = await pool
      .request()
      .input("Id", sql.Int, id)
      .query(`
        DELETE FROM Contacts
        WHERE Id = @Id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});