const form = document.getElementById('studentForm');
const studentTableBody = document.getElementById('studentTableBody');
const formTitle = document.getElementById('formTitle');
const studentIdField = document.getElementById('studentId');
const resetBtn = document.getElementById('resetBtn');
const loadInsightsBtn = document.getElementById('loadInsightsBtn');
const insightsBox = document.getElementById('insightsBox');
const totalStudents = document.getElementById('totalStudents');
const topPerformer = document.getElementById('topPerformer');
const classAverage = document.getElementById('classAverage');
const searchInput = document.getElementById('searchInput');
const recordCount = document.getElementById('recordCount');
const toast = document.getElementById('toast');

const API_BASE = '/students';
let allStudents = [];

async function fetchStudents() {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error('Unable to load student records.');
  const data = await response.json();
  return data.students || [];
}

function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast is-visible ${type}`;
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    toast.className = 'toast';
  }, 3200);
}

function setButtonBusy(button, busy, busyLabel) {
  if (!button) return;
  if (busy) {
    button.dataset.defaultLabel = button.textContent;
    button.textContent = busyLabel;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.defaultLabel || button.textContent;
    button.disabled = false;
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[character]));
}

function calculateAverage(student) {
  const values = Object.values(student.marks || {});
  if (!values.length) return 0;
  const total = values.reduce((sum, value) => sum + Number(value || 0), 0);
  return Number((total / values.length).toFixed(2));
}

function applySearchFilter() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    renderStudentTable(allStudents);
    return;
  }

  const filtered = allStudents.filter((student) => {
    const name = (student.name || '').toLowerCase();
    const email = (student.email || '').toLowerCase();
    const course = (student.course || '').toLowerCase();
    return name.includes(query) || email.includes(query) || course.includes(query);
  });

  renderStudentTable(filtered);
}

function renderStudentTable(students) {
  studentTableBody.innerHTML = '';
  recordCount.textContent = `${students.length} record${students.length === 1 ? '' : 's'}`;

  if (!students.length) {
    studentTableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No students found.</td></tr>';
    return;
  }

  students.forEach((student) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.email)}</td>
      <td>${escapeHtml(student.course)}</td>
      <td>${student.age}</td>
      <td>${calculateAverage(student)}%</td>
      <td>
        <button class="action-btn edit-btn" data-id="${student._id}">Edit</button>
        <button class="action-btn delete-btn" data-id="${student._id}">Delete</button>
      </td>
    `;

    studentTableBody.appendChild(row);
  });

}

function populateForm(id) {
  fetch(`${API_BASE}/${id}`)
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load student data.');
      return data;
    })
    .then((data) => {
      const student = data.student || data;
      studentIdField.value = student._id;
      formTitle.textContent = 'Edit Student';
      document.getElementById('name').value = student.name || '';
      document.getElementById('email').value = student.email || '';
      document.getElementById('age').value = student.age || '';
      document.getElementById('course').value = student.course || '';
      document.getElementById('javascript').value = student.marks?.javascript ?? 0;
      document.getElementById('python').value = student.marks?.python ?? 0;
      document.getElementById('java').value = student.marks?.java ?? 0;
      document.getElementById('DSA').value = student.marks?.DSA ?? 0;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    })
    .catch((error) => {
      console.error('Failed to load student:', error);
      showToast(error.message, 'error');
    });
}

function resetForm() {
  form.reset();
  studentIdField.value = '';
  formTitle.textContent = 'Add Student';
}

async function loadStudents() {
  try {
    const students = await fetchStudents();
    allStudents = students;
    renderStudentTable(students);
    updateStats(students);
  } catch (error) {
    studentTableBody.innerHTML = '<tr><td colspan="6" class="empty-state error-state">Unable to load records. Check that the server is running.</td></tr>';
    showToast(error.message, 'error');
  }
}

function updateStats(students) {
  totalStudents.textContent = students.length;

  if (!students.length) {
    topPerformer.textContent = '-';
    classAverage.textContent = '0%';
    return;
  }

  const top = students.reduce((best, current) => {
    const currentAvg = calculateAverage(current);
    const bestAvg = calculateAverage(best);
    return currentAvg > bestAvg ? current : best;
  });

  const average = students.reduce((sum, student) => sum + calculateAverage(student), 0) / students.length;

  topPerformer.textContent = top.name;
  classAverage.textContent = `${average.toFixed(2)}%`;
}

async function deleteStudent(id) {
  if (!confirm('Delete this student?')) return;

  try {
    const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Unable to delete student.');
    resetForm();
    await loadStudents();
    showToast('Student deleted successfully.');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

studentTableBody.addEventListener('click', (event) => {
  const actionButton = event.target.closest('button[data-id]');
  if (!actionButton) return;
  if (actionButton.classList.contains('edit-btn')) populateForm(actionButton.dataset.id);
  if (actionButton.classList.contains('delete-btn')) deleteStudent(actionButton.dataset.id);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const submitButton = form.querySelector('button[type="submit"]');
  setButtonBusy(submitButton, true, studentIdField.value ? 'Updating...' : 'Saving...');

  const payload = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    age: Number(document.getElementById('age').value),
    course: document.getElementById('course').value,
    marks: {
      javascript: Number(document.getElementById('javascript').value),
      python: Number(document.getElementById('python').value),
      java: Number(document.getElementById('java').value),
      DSA: Number(document.getElementById('DSA').value),
    },
  };

  const id = studentIdField.value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_BASE}/${id}` : API_BASE;

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Something went wrong.');
    resetForm();
    await loadStudents();
    showToast(id ? 'Student updated successfully.' : 'Student added successfully.');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setButtonBusy(submitButton, false);
  }
});

resetBtn.addEventListener('click', resetForm);
searchInput.addEventListener('input', applySearchFilter);

async function loadClassInsights() {
  setButtonBusy(loadInsightsBtn, true, 'Loading...');
  try {
    const response = await fetch('/students/ai-insights');
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to load class insights.');
    insightsBox.innerHTML = `
      <strong>Class average:</strong> ${escapeHtml(data.insights?.classAverage ?? 0)}%<br>
      <strong>Top performer:</strong> ${escapeHtml(data.insights?.topPerformer ?? 'N/A')}<br>
      <strong>Strongest subject:</strong> ${escapeHtml(data.insights?.strongestSubject ?? 'N/A')}<br><br>
      <span>${escapeHtml(data.summary || 'No insights available yet.')}</span>
    `;
    insightsBox.classList.add('is-loaded');
  } catch (error) {
    insightsBox.textContent = error.message;
    showToast(error.message, 'error');
    console.error(error);
  } finally {
    setButtonBusy(loadInsightsBtn, false);
  }
}

loadInsightsBtn.addEventListener('click', loadClassInsights);

loadStudents();
