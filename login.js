// Login page logic

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const studentIdInput = document.getElementById('studentId');
  const passwordInput = document.getElementById('password');

  // Check if already logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn === 'true') {
    window.location.href = 'dashboard.html';
    return;
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const studentId = studentIdInput.value.trim();
    const password = passwordInput.value.trim();

    // Simple validation (no real authentication)
    if (studentId && password) {
      // Store login state
      localStorage.setItem('isLoggedIn', 'true');
      
      // Update user data
      AppData.user.studentId = studentId;
      AppData.save();

      // Redirect to dashboard
      window.location.href = 'dashboard.html';
    }
  });
});
