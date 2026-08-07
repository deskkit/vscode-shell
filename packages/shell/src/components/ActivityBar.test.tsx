import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityBar } from './ActivityBar';

const items = [
  { id: 'home', label: 'Home', icon: <span>H</span> },
  { id: 'settings', label: 'Settings', icon: <span>S</span>, position: 'bottom' as const },
];

describe('ActivityBar', () => {
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
