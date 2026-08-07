import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityBar } from './ActivityBar';

const items = [
  { id: 'home', label: 'Home', icon: <span>H</span> },
  { id: 'settings', label: 'Settings', icon: <span>S</span>, position: 'bottom' as const },
];

describe('ActivityBar', () => {
  it('uses activitybar foreground tokens so Light+ icons stay visible on dark bar', () => {
    const css = readFileSync(
      resolve(dirname(fileURLToPath(import.meta.url)), '../styles.css'),
      'utf8',
    );
    expect(css).toMatch(/--vscode-activitybar-fg:\s*#ffffff/);
    expect(css).toMatch(
      /\.vsc-activity-bar\s*\{[^}]*color:\s*var\(--vscode-activitybar-fg\)/s,
    );
    expect(css).not.toMatch(
      /\.vsc-activity-bar\s*\{[^}]*color:\s*var\(--vscode-text-primary\)/s,
    );
  });

  it('calls onChange when an item is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ActivityBar items={items} activeId="home" onChange={onChange} />);
    await user.click(screen.getByTitle('Settings'));
    expect(onChange).toHaveBeenCalledWith('settings');
  });

  it('marks the active item', () => {
    render(<ActivityBar items={items} activeId="home" onChange={() => {}} />);
    expect(screen.getByTitle('Home').getAttribute('aria-current')).toBe('page');
    expect(screen.getByTitle('Settings').getAttribute('aria-current')).toBeNull();
  });

  it('does not mark any item when activeId is unknown', () => {
    render(<ActivityBar items={items} activeId="missing" onChange={() => {}} />);
    expect(screen.getByTitle('Home').getAttribute('aria-current')).toBeNull();
  });

  it('calls onLogoClick when logo is clicked', async () => {
    const user = userEvent.setup();
    const onLogoClick = vi.fn();
    render(
      <ActivityBar
        items={items}
        activeId="home"
        onChange={() => {}}
        logo={<span>Logo</span>}
        onLogoClick={onLogoClick}
      />,
    );
    await user.click(screen.getByTitle('Home logo'));
    expect(onLogoClick).toHaveBeenCalled();
  });
});
