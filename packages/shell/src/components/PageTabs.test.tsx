import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageTabs } from './PageTabs';

const tabs = [
  { id: 'home', title: 'Home', closable: false },
  { id: 'a', title: 'Alpha' },
];

describe('PageTabs', () => {
  it('selects a tab', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<PageTabs tabs={tabs} activeId="home" onSelect={onSelect} onClose={() => {}} />);
    await user.click(screen.getByText('Alpha'));
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('closes a closable tab without selecting', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<PageTabs tabs={tabs} activeId="home" onSelect={onSelect} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Close Alpha' }));
    expect(onClose).toHaveBeenCalledWith('a');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('hides close when onClose is omitted', () => {
    render(<PageTabs tabs={tabs} activeId="a" onSelect={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Close Alpha' })).toBeNull();
  });

  it('hides close when closable is false', () => {
    render(<PageTabs tabs={tabs} activeId="home" onSelect={() => {}} onClose={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Close Home' })).toBeNull();
  });

  it('shows a custom thin scrollbar when tabs overflow', async () => {
    const { container } = render(
      <PageTabs tabs={tabs} activeId="home" onSelect={() => {}} onClose={() => {}} />,
    );
    const scroller = container.querySelector('.vsc-page-tabs__scroller') as HTMLDivElement;
    Object.defineProperty(scroller, 'clientWidth', { configurable: true, value: 80 });
    Object.defineProperty(scroller, 'scrollWidth', { configurable: true, value: 240 });
    Object.defineProperty(scroller, 'scrollLeft', { configurable: true, writable: true, value: 0 });
    fireEvent.scroll(scroller);
    await waitFor(() => {
      expect(container.querySelector('.vsc-page-tabs__scrollbar')).toBeTruthy();
    });
    expect(container.querySelector('.vsc-page-tabs__scrollbar')).toHaveClass('is-visible');
  });

  it('hides the custom scrollbar after idle', async () => {
    vi.useFakeTimers();
    const { container } = render(
      <PageTabs tabs={tabs} activeId="home" onSelect={() => {}} onClose={() => {}} />,
    );
    const scroller = container.querySelector('.vsc-page-tabs__scroller') as HTMLDivElement;
    Object.defineProperty(scroller, 'clientWidth', { configurable: true, value: 80 });
    Object.defineProperty(scroller, 'scrollWidth', { configurable: true, value: 240 });
    Object.defineProperty(scroller, 'scrollLeft', { configurable: true, writable: true, value: 0 });

    await act(async () => {
      fireEvent.scroll(scroller);
    });
    expect(container.querySelector('.vsc-page-tabs__scrollbar')).toHaveClass('is-visible');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(container.querySelector('.vsc-page-tabs__scrollbar')).not.toHaveClass('is-visible');
    vi.useRealTimers();
  });
});
