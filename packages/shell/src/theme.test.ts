import { beforeEach, describe, expect, it } from 'vitest';
import { getTheme, setTheme } from './theme';

describe('theme', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('defaults to light when .dark is absent', () => {
    expect(getTheme()).toBe('light');
  });

  it('setTheme(dark) adds .dark on documentElement', () => {
    setTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(getTheme()).toBe('dark');
  });

  it('setTheme(light) removes .dark', () => {
    setTheme('dark');
    setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(getTheme()).toBe('light');
  });

  it('ignores invalid theme values and falls back to dark', () => {
    setTheme('dark');
    // @ts-expect-error runtime guard
    setTheme('purple');
    expect(getTheme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
