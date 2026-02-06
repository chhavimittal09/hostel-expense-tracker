
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const studentIdInput = document.getElementById('studentId');
  const passwordInput = document.getElementById('password');

document.addEventListener("mousemove", (e) => {
   const x = (e.clientX / window.innerWidth - 0.5) * 10;
   const y = (e.clientY / window.innerHeight - 0.5) * 10;
   document.querySelector(".ambient-overlay").style.transform =
      `translate(${x}px, ${y}px)`;
  });

  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn === 'true') {
    window.location.href = 'dashboard.html';
    return;
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const studentId = studentIdInput.value.trim();
    const password = passwordInput.value.trim();

    if (studentId && password) {
      localStorage.setItem('isLoggedIn', 'true');
      
      AppData.user.studentId = studentId;
      AppData.save();

      window.location.href = 'dashboard.html';
    }
  });
});
