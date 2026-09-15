const STORAGE_KEY = 'docentrack-theme';

export function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'light';
  } catch {
    return 'system';
  }
}

export function applyTheme(theme) {
  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && systemDark);
  if (isDark) root.classList.add('dark');
  else root.classList.remove('dark');
}

export function setStoredTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent('themechange'));
}