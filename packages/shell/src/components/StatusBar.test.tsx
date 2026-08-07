import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusBar } from './StatusBar';

describe('StatusBar', () => {
  it('renders left/center/right slots', () => {
    render(<StatusBar left="L" center="C" right="R" />);
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();
  });

  it('toggles theme via callback only', async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();
    render(
      <StatusBar showThemeToggle theme="dark" onThemeChange={onThemeChange} />,
    );
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(onThemeChange).toHaveBeenCalledWith('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
