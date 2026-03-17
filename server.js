const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let contacts = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "555-123-4567",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    phone: "555-987-6543",
  },
];

let nextId = 3;

app.get("/api/contacts", (req, res) => {
  res.json(contacts);
});

app.post("/api/contacts", (req, res) => {
  const { firstName, lastName, email, phone } = req.body;

  const newContact = {
    id: nextId++,
    firstName,
    lastName,
    email,
    phone,
  };

  contacts.push(newContact);
  res.status(201).json(newContact);
});

app.put("/api/contacts/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { firstName, lastName, email, phone } = req.body;

  const contact = contacts.find((c) => c.id === id);

  if (!contact) {
    return res.status(404).json({ error: "Contact not found" });
  }

  contact.firstName = firstName;
  contact.lastName = lastName;
  contact.email = email;
  contact.phone = phone;

  res.json(contact);
});

app.delete("/api/contacts/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = contacts.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Contact not found" });
  }

  contacts.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});