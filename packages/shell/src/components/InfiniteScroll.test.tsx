import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { InfiniteScroll } from './InfiniteScroll';

function mockTallViewport(el: HTMLElement) {
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: 80 });
  Object.defineProperty(el, 'scrollHeight', { configurable: true, value: 240 });
  Object.defineProperty(el, 'scrollTop', { configurable: true, writable: true, value: 0 });
}

describe('InfiniteScroll', () => {
  it('calls onLoadMore when scrolled to the end and hasMore', async () => {
    const onLoadMore = vi.fn();
    const { container } = render(
      <InfiniteScroll hasMore onLoadMore={onLoadMore}>
        <div style={{ height: 400 }}>rows</div>
      </InfiniteScroll>,
    );
    const viewport = container.querySelector('.vsc-scrollbar__viewport') as HTMLDivElement;
    mockTallViewport(viewport);
    viewport.scrollTop = 160;
    fireEvent.scroll(viewport);
    await waitFor(() => {
      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call onLoadMore when hasMore is false', () => {
    const onLoadMore = vi.fn();
    const { container } = render(
      <InfiniteScroll hasMore={false} onLoadMore={onLoadMore}>
        <div style={{ height: 400 }}>rows</div>
      </InfiniteScroll>,
    );
    const viewport = container.querySelector('.vsc-scrollbar__viewport') as HTMLDivElement;
    mockTallViewport(viewport);
    viewport.scrollTop = 160;
    fireEvent.scroll(viewport);
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('does not call onLoadMore while loading', () => {
    const onLoadMore = vi.fn();
    const { container } = render(
      <InfiniteScroll hasMore loading onLoadMore={onLoadMore}>
        <div style={{ height: 400 }}>rows</div>
      </InfiniteScroll>,
    );
    const viewport = container.querySelector('.vsc-scrollbar__viewport') as HTMLDivElement;
    mockTallViewport(viewport);
    viewport.scrollTop = 160;
    fireEvent.scroll(viewport);
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('renders loadingMessage while loading', () => {
    const { getByText } = render(
      <InfiniteScroll hasMore loading onLoadMore={() => {}} loadingMessage="加载中…">
        <div>rows</div>
      </InfiniteScroll>,
    );
    expect(getByText('加载中…')).toBeTruthy();
  });
});
