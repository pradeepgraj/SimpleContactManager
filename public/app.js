const form = document.getElementById("contact-form");
const contactIdInput = document.getElementById("contact-id");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const contactsBody = document.getElementById("contacts-body");
const cancelEditButton = document.getElementById("cancel-edit");

async function loadContacts() {
  const response = await fetch("/api/contacts");
  const contacts = await response.json();

  contactsBody.innerHTML = "";

  contacts.forEach((contact) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${contact.firstName} ${contact.lastName}</td>
      <td>${contact.email || ""}</td>
      <td>${contact.phone || ""}</td>
      <td>
        <button onclick="editContact(${contact.id})">Edit</button>
        <button onclick="deleteContact(${contact.id})">Delete</button>
      </td>
    `;

    contactsBody.appendChild(row);
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = contactIdInput.value;
  const payload = {
    firstName: firstNameInput.value,
    lastName: lastNameInput.value,
    email: emailInput.value,
    phone: phoneInput.value,
  };

  if (id) {
    await fetch(`/api/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } else {
    await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  resetForm();
  loadContacts();
});

async function editContact(id) {
  const response = await fetch("/api/contacts");
  const contacts = await response.json();
  const contact = contacts.find((c) => c.id === id);

  if (!contact) return;

  contactIdInput.value = contact.id;
  firstNameInput.value = contact.firstName;
  lastNameInput.value = contact.lastName;
  emailInput.value = contact.email || "";
  phoneInput.value = contact.phone || "";
}

async function deleteContact(id) {
  await fetch(`/api/contacts/${id}`, {
    method: "DELETE",
  });

  loadContacts();
}

function resetForm() {
  contactIdInput.value = "";
  firstNameInput.value = "";
  lastNameInput.value = "";
  emailInput.value = "";
  phoneInput.value = "";
}

cancelEditButton.addEventListener("click", () => {
  resetForm();
});

loadContacts();