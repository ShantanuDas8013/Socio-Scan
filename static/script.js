// ...existing code...

function toggleTheme() {
  const root = document.documentElement;
  const isDark = root.classList.toggle("dark-theme");

  if (isDark) {
    root.style.setProperty("--background-color", "#1a1a1a");
    root.style.setProperty("--text-color", "#ffffff");
    root.style.setProperty("--border-color", "#333333");
    root.style.setProperty("--hover-color", "#2d2d2d");
  } else {
    root.style.setProperty("--background-color", "#ffffff");
    root.style.setProperty("--text-color", "#000000");
    root.style.setProperty("--border-color", "#e0e0e0");
    root.style.setProperty("--hover-color", "#f5f5f5");
  }
  // ...existing code...
}
