// Wrapper around fetch that redirects to /login on 401
async function apiFetch(url, options) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    window.location.href = "/login";
    return null;
  }
  return res;
}

const form          = document.getElementById("contact-form");
const contactIdInput = document.getElementById("contact-id");
const firstNameInput = document.getElementById("firstName");
const lastNameInput  = document.getElementById("lastName");
const emailInput     = document.getElementById("email");
const phoneInput     = document.getElementById("phone");
const contactsBody   = document.getElementById("contacts-body");
const cancelEditButton = document.getElementById("cancel-edit");
const formTitle      = document.getElementById("form-title");
const submitBtn      = document.getElementById("submit-btn");
const emptyState     = document.getElementById("empty-state");
const contactsTable  = document.getElementById("contacts-table");

let contactsCache = [];

async function loadContacts() {
  const response = await apiFetch("/api/contacts");
  if (!response) return;
  const contacts = await response.json();
  contactsCache = contacts;

  contactsBody.innerHTML = "";

  // Show empty state when there are no contacts
  const isEmpty = contacts.length === 0;
  emptyState.hidden = !isEmpty;
  contactsTable.hidden = isEmpty;

  contacts.forEach((contact) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${contact.FirstName} ${contact.LastName}</td>
      <td>${contact.Email || ""}</td>
      <td>${contact.Phone || ""}</td>
      <td class="actions">
        <button class="btn btn-edit" onclick="editContact(${contact.Id})">Edit</button>
        <button class="btn btn-danger" onclick="deleteContact(${contact.Id})">Delete</button>
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
    lastName:  lastNameInput.value,
    email:     emailInput.value,
    phone:     phoneInput.value,
  };

  if (id) {
    await apiFetch(`/api/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } else {
    await apiFetch("/api/contacts", {
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

  contactIdInput.value  = contact.Id;
  firstNameInput.value  = contact.FirstName;
  lastNameInput.value   = contact.LastName;
  emailInput.value      = contact.Email || "";
  phoneInput.value      = contact.Phone || "";

  // Switch the form heading and button label to reflect edit mode
  formTitle.textContent = "Edit Contact";
  submitBtn.textContent = "Update Contact";
}

async function deleteContact(id) {
  await apiFetch(`/api/contacts/${id}`, { method: "DELETE" });
  await loadContacts();
}

function resetForm() {
  contactIdInput.value = "";
  firstNameInput.value = "";
  lastNameInput.value  = "";
  emailInput.value     = "";
  phoneInput.value     = "";

  // Restore heading and button to add mode
  formTitle.textContent = "Add Contact";
  submitBtn.textContent = "Save Contact";
}

cancelEditButton.addEventListener("click", () => {
  resetForm();
});

loadContacts();
