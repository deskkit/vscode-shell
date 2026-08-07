export type ThemeMode = 'light' | 'dark';

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

export function setTheme(theme: ThemeMode): void {
  const next: ThemeMode = isThemeMode(theme) ? theme : 'dark';
  document.documentElement.classList.toggle('dark', next === 'dark');
}

export function getTheme(): ThemeMode {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}
