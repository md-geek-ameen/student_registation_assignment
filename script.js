// script.js - logic separated from HTML
const STORAGE_KEY = 'students_v1';
let students = [];
let editingIndex = -1;

// Small helper: escape text for safe HTML insertion
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Load initial state
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  renderStudentTable();
  setupListeners();
});

function setupListeners() {
  document.getElementById('studentForm').addEventListener('submit', handleFormSubmit);
  document.getElementById('cancelBtn').addEventListener('click', resetForm);

  // Prevent invalid characters as user types (immediate UX improvement)
  document.getElementById('studentId').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  });
  document.getElementById('studentContact').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  });
  // Allow only letters and spaces for name field as typed
  document.getElementById('studentName').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
  });

  // Live validation on blur
  document.getElementById('studentName').addEventListener('blur', validateName);
  document.getElementById('studentId').addEventListener('blur', validateId);
  document.getElementById('studentEmail').addEventListener('blur', validateEmail);
  document.getElementById('studentContact').addEventListener('blur', validateContact);
}

// Form submit handler (add or update)
function handleFormSubmit(event) {
  event.preventDefault();

  const isNameValid = validateName();
  const isIdValid = validateId();
  const isEmailValid = validateEmail();
  const isContactValid = validateContact();

  if (!isNameValid || !isIdValid || !isEmailValid || !isContactValid) return;

  const student = {
    name: document.getElementById('studentName').value.trim(),
    id: document.getElementById('studentId').value.trim(),
    email: document.getElementById('studentEmail').value.trim(),
    contact: document.getElementById('studentContact').value.trim()
  };

  if (editingIndex >= 0) {
    students[editingIndex] = student;
    editingIndex = -1;
  } else {
    students.push(student);
  }

  saveToStorage();
  renderStudentTable();
  resetForm();
  document.getElementById('tableContainer').focus();
}

// Validation functions
function validateName() {
  const inp = document.getElementById('studentName');
  const err = document.getElementById('nameError');
  const val = inp.value.trim();
  const pattern = /^[A-Za-z\s]+$/;

  if (val === '') {
    return showErr(inp, err, 'Name is required');
  }
  if (!pattern.test(val)) {
    return showErr(inp, err, 'Name should contain letters and spaces only');
  }
  return hideErr(inp, err);
}

function validateId() {
  const inp = document.getElementById('studentId');
  const err = document.getElementById('idError');
  const val = inp.value.trim();
  const pattern = /^\d+$/;

  if (val === '') {
    return showErr(inp, err, 'Student ID is required');
  }
  if (!pattern.test(val)) {
    return showErr(inp, err, 'Student ID should contain only numbers');
  }
  if (isIdDuplicate(val)) {
    return showErr(inp, err, 'Student ID already exists');
  }
  return hideErr(inp, err);
}

function validateEmail() {
  const inp = document.getElementById('studentEmail');
  const err = document.getElementById('emailError');
  const val = inp.value.trim();
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (val === '') {
    return showErr(inp, err, 'Email is required');
  }
  if (!pattern.test(val)) {
    return showErr(inp, err, 'Please enter a valid email address');
  }
  return hideErr(inp, err);
}

function validateContact() {
  const inp = document.getElementById('studentContact');
  const err = document.getElementById('contactError');
  const val = inp.value.trim();
  const pattern = /^\d{10,}$/;

  if (val === '') {
    return showErr(inp, err, 'Contact number is required');
  }
  if (!pattern.test(val)) {
    return showErr(inp, err, 'Contact number must be at least 10 digits');
  }
  return hideErr(inp, err);
}

function showErr(inputEl, errEl, message) {
  inputEl.classList.add('error');
  errEl.textContent = message;
  errEl.style.display = 'block';
  return false;
}
function hideErr(inputEl, errEl) {
  inputEl.classList.remove('error');
  errEl.style.display = 'none';
  return true;
}

function isIdDuplicate(id) {
  return students.some((s, idx) => s.id === id && idx !== editingIndex);
}

// Rendering
function renderStudentTable() {
  const container = document.getElementById('tableContainer');

  if (students.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No students registered yet. Add your first student using the form above!</p></div>';
    return;
  }

  const rowsHtml = students.map((s, idx) => {
    return `<tr>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.id)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${escapeHtml(s.contact)}</td>
      <td>
        <button class="action-btn edit-btn" data-idx="${idx}" aria-label="Edit student ${escapeHtml(s.name)}">Edit</button>
        <button class="action-btn delete-btn" data-idx="${idx}" aria-label="Delete student ${escapeHtml(s.name)}">Delete</button>
      </td>
    </tr>`;
  }).join('');

  container.innerHTML = `
    <table id="studentTable" aria-describedby="displayHeading">
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Student ID</th>
          <th>Email Address</th>
          <th>Contact Number</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="studentTableBody">
        ${rowsHtml}
      </tbody>
    </table>
  `;

  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => editStudent(Number(btn.dataset.idx)));
  });
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteStudent(Number(btn.dataset.idx)));
  });

  requestAnimationFrame(() => {
    const threshold = 420;
    const table = container.querySelector('table');
    if (table && table.offsetHeight > threshold) {
      container.style.maxHeight = threshold + 'px';
      container.style.overflowY = 'auto';
    } else {
      container.style.maxHeight = 'none';
      container.style.overflowY = 'visible';
    }
  });
}

// CRUD operations
function editStudent(index) {
  const student = students[index];
  if (!student) return;

  editingIndex = index;

  document.getElementById('studentName').value = student.name;
  document.getElementById('studentId').value = student.id;
  document.getElementById('studentEmail').value = student.email;
  document.getElementById('studentContact').value = student.contact;

  document.getElementById('formTitle').textContent = 'Edit Student Details';
  document.getElementById('submitBtn').textContent = 'Update Student';
  document.getElementById('cancelBtn').style.display = 'inline-block';

  document.getElementById('studentId').disabled = true;
  document.getElementById('studentName').focus();
  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

function deleteStudent(index) {
  const confirmed = confirm('Are you sure you want to delete this student record?');
  if (!confirmed) return;
  students.splice(index, 1);
  saveToStorage();
  renderStudentTable();
  if (editingIndex === index) resetForm();
}

function resetForm() {
  document.getElementById('studentForm').reset();
  editingIndex = -1;
  document.getElementById('formTitle').textContent = 'Register New Student';
  document.getElementById('submitBtn').textContent = 'Add Student';
  document.getElementById('cancelBtn').style.display = 'none';
  document.getElementById('studentId').disabled = false;
  document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.form-group input').forEach(i => i.classList.remove('error'));
}

// Local storage helpers
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}
function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    students = JSON.parse(raw) || [];
  } catch (e) {
    console.error('Invalid stored data, resetting storage.', e);
    students = [];
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Backwards-compatible names (if used elsewhere)
function saveStudentsToStorage() { saveToStorage(); }
function loadStudentsFromStorage() { loadFromStorage(); }
window.saveStudentsToStorage = saveStudentsToStorage;
window.loadStudentsFromStorage = loadStudentsFromStorage;
