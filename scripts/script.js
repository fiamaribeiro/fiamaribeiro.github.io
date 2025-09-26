const year = document.getElementById('year'); year.textContent = new Date().getFullYear();
const themeToggle = document.getElementById('themeToggle');
const saved = localStorage.getItem('theme');
if(saved === 'light') document.body.classList.add('light');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
});