const form = document.getElementById("contact-form");
const contactIdInput = document.getElementById("contact-id");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const contactsBody = document.getElementById("contacts-body");
const cancelEditButton = document.getElementById("cancel-edit");

let contactsCache = [];

async function loadContacts() {
  const response = await fetch("/api/contacts");
  const contacts = await response.json();
  contactsCache = contacts;

  contactsBody.innerHTML = "";

  contacts.forEach((contact) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${contact.FirstName} ${contact.LastName}</td>
      <td>${contact.Email || ""}</td>
      <td>${contact.Phone || ""}</td>
      <td>
        <button onclick="editContact(${contact.Id})">Edit</button>
        <button onclick="deleteContact(${contact.Id})">Delete</button>
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
  await loadContacts();
});

function editContact(id) {
  const contact = contactsCache.find((c) => c.Id === id);

  if (!contact) return;

  contactIdInput.value = contact.Id;
  firstNameInput.value = contact.FirstName;
  lastNameInput.value = contact.LastName;
  emailInput.value = contact.Email || "";
  phoneInput.value = contact.Phone || "";
}

async function deleteContact(id) {
  await fetch(`/api/contacts/${id}`, {
    method: "DELETE",
  });

  await loadContacts();
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