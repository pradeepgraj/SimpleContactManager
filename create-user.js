// One-time script to create a user in the database.
// Usage: node create-user.js <username> <password>

require("dotenv").config();
const bcrypt = require("bcrypt");
const { sql, getPool } = require("./db");

async function main() {
  const [,, username, password] = process.argv;

  if (!username || !password) {
    console.error("Usage: node create-user.js <username> <password>");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  const pool = await getPool();

  await pool
    .request()
    .input("Username", sql.NVarChar(100), username)
    .input("PasswordHash", sql.NVarChar(255), hash)
    .query("INSERT INTO Users (Username, PasswordHash) VALUES (@Username, @PasswordHash)");

  console.log(`User "${username}" created successfully.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
