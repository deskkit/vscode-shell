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

  it('calls onReachEnd when scrolled near the end', async () => {
    const onReachEnd = vi.fn();
    const { container } = render(
      <Scrollbar orientation="vertical" onReachEnd={onReachEnd}>
        <div style={{ height: 400 }}>tall</div>
      </Scrollbar>,
    );
    const viewport = container.querySelector('.vsc-scrollbar__viewport') as HTMLDivElement;
    mockOverflow(viewport, 'vertical');
    viewport.scrollTop = 160;
    fireEvent.scroll(viewport);
    await waitFor(() => {
      expect(onReachEnd).toHaveBeenCalled();
    });
  });

  it('calls onReachEnd when content does not overflow', async () => {
    const onReachEnd = vi.fn();
    const { container } = render(
      <Scrollbar orientation="vertical" onReachEnd={onReachEnd}>
        <div>short</div>
      </Scrollbar>,
    );
    const viewport = container.querySelector('.vsc-scrollbar__viewport') as HTMLDivElement;
    Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: 80 });
    Object.defineProperty(viewport, 'scrollHeight', { configurable: true, value: 40 });
    Object.defineProperty(viewport, 'scrollTop', { configurable: true, writable: true, value: 0 });
    fireEvent.scroll(viewport);
    await waitFor(() => {
      expect(onReachEnd).toHaveBeenCalled();
    });
  });

  it('does not call onReachEnd when far from the end', async () => {
    const onReachEnd = vi.fn();
    const { container } = render(
      <Scrollbar orientation="vertical" onReachEnd={onReachEnd}>
        <div style={{ height: 400 }}>tall</div>
      </Scrollbar>,
    );
    const viewport = container.querySelector('.vsc-scrollbar__viewport') as HTMLDivElement;
    mockOverflow(viewport, 'vertical');
    viewport.scrollTop = 0;
    fireEvent.scroll(viewport);
    expect(onReachEnd).not.toHaveBeenCalled();
  });
});
