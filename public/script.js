const allStudents = ["Alice", "Bob", "Charlie", "David", "Eva"];

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('attendance-form');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const className = document.getElementById('class').value.trim();
      const email = document.getElementById('email').value.trim();
      const status = document.getElementById('status').value;

      if (!name || !className || !email) {
        alert('Please fill all fields');
        return;
      }

      const response = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, className, email, status })
      });

      const result = await response.json();
      alert(result.message);
      form.reset();
    });
  }

  if (phrase !== SECRET_PHRASE) {
    return res.json({ message: 'Incorrect secret phrase!', success: false });
  }

  if (window.location.pathname.includes('admin.html')) {
    window.adminLogin = function() {
      const password = document.getElementById('admin-password').value;
      if (password === 'admin123') {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        loadAttendance();
      } else {
        alert('Wrong Password!');
      }
    };

    async function loadAttendance() {
      const response = await fetch('/attendance');
      const attendance = await response.json();

      const presentList = document.getElementById('present-list');
      const absentList = document.getElementById('absent-list');

      presentList.innerHTML = '';
      absentList.innerHTML = '';

      const presentNames = attendance.map(a => a.name);

      allStudents.forEach(student => {
        const li = document.createElement('li');
        li.textContent = student;
        if (presentNames.includes(student)) {
          presentList.appendChild(li);
        } else {
          absentList.appendChild(li);
        }
      });
    }

    window.clearAttendance = async function() {
      if (confirm('Are you sure you want to clear all attendance?')) {
        const response = await fetch('/clear', { method: 'DELETE' });
        const result = await response.json();
        alert(result.message);
        location.reload();
      }
    };

    window.downloadExcel = async function() {
      window.open('/download', '_blank');
    };
  }
});