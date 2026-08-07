import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { Scrollbar } from './Scrollbar';

function mockOverflow(el: HTMLElement, orientation: 'horizontal' | 'vertical') {
  if (orientation === 'horizontal') {
    Object.defineProperty(el, 'clientWidth', { configurable: true, value: 80 });
    Object.defineProperty(el, 'scrollWidth', { configurable: true, value: 240 });
    Object.defineProperty(el, 'scrollLeft', { configurable: true, writable: true, value: 0 });
  } else {
    Object.defineProperty(el, 'clientHeight', { configurable: true, value: 80 });
    Object.defineProperty(el, 'scrollHeight', { configurable: true, value: 240 });
    Object.defineProperty(el, 'scrollTop', { configurable: true, writable: true, value: 0 });
  }
}

describe('Scrollbar', () => {
  it('shows a horizontal track when content overflows', async () => {
    const { container } = render(
      <Scrollbar orientation="horizontal">
        <div style={{ width: 400 }}>wide</div>
      </Scrollbar>,
    );
    const viewport = container.querySelector('.vsc-scrollbar__viewport') as HTMLDivElement;
    mockOverflow(viewport, 'horizontal');
    fireEvent.scroll(viewport);
    await waitFor(() => {
      expect(container.querySelector('.vsc-scrollbar__track')).toHaveClass('is-visible');
    });
    expect(container.querySelector('.vsc-scrollbar--horizontal')).toBeTruthy();
  });

  it('shows a vertical track when content overflows', async () => {
    const { container } = render(
      <Scrollbar orientation="vertical">
        <div style={{ height: 400 }}>tall</div>
      </Scrollbar>,
    );
    const viewport = container.querySelector('.vsc-scrollbar__viewport') as HTMLDivElement;
    mockOverflow(viewport, 'vertical');
    fireEvent.scroll(viewport);
    await waitFor(() => {
      expect(container.querySelector('.vsc-scrollbar__track')).toHaveClass('is-visible');
    });
    expect(container.querySelector('.vsc-scrollbar--vertical')).toBeTruthy();
  });

  it('hides after idle', async () => {
    vi.useFakeTimers();
    const { container } = render(
      <Scrollbar orientation="horizontal">
        <div>content</div>
      </Scrollbar>,
    );
    const viewport = container.querySelector('.vsc-scrollbar__viewport') as HTMLDivElement;
    mockOverflow(viewport, 'horizontal');
    await act(async () => {
      fireEvent.scroll(viewport);
    });
    expect(container.querySelector('.vsc-scrollbar__track')).toHaveClass('is-visible');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(container.querySelector('.vsc-scrollbar__track')).not.toHaveClass('is-visible');
    vi.useRealTimers();
  });
});
