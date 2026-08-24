import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ResizeHandle } from './ResizeHandle';

function dispatchPointer(
  type: string,
  init: { clientX?: number; clientY?: number },
  target: EventTarget = window,
) {
  target.dispatchEvent(
    new MouseEvent(type, {
      bubbles: true,
      clientX: init.clientX ?? 0,
      clientY: init.clientY ?? 0,
    }),
  );
}

describe('ResizeHandle', () => {
  it('emits Y deltas for direction=row', () => {
    const onDrag = vi.fn();
    const { container } = render(
      <ResizeHandle direction="row" onDrag={onDrag} />,
    );
    const el = container.firstElementChild as HTMLElement;
    dispatchPointer('pointerdown', { clientY: 40, clientX: 0 }, el);
    dispatchPointer('pointermove', { clientY: 52, clientX: 0 });
    expect(onDrag).toHaveBeenCalledWith(12);
  });

  it('emits X deltas for direction=column', () => {
    const onDrag = vi.fn();
    const { container } = render(
      <ResizeHandle direction="column" onDrag={onDrag} />,
    );
    const el = container.firstElementChild as HTMLElement;
    dispatchPointer('pointerdown', { clientX: 10, clientY: 0 }, el);
    dispatchPointer('pointermove', { clientX: 18, clientY: 0 });
    expect(onDrag).toHaveBeenCalledWith(8);
  });

  it('stops emitting after pointerup', () => {
    const onDrag = vi.fn();
    const { container } = render(
      <ResizeHandle direction="row" onDrag={onDrag} />,
    );
    const el = container.firstElementChild as HTMLElement;
    dispatchPointer('pointerdown', { clientY: 10, clientX: 0 }, el);
    dispatchPointer('pointerup', { clientY: 10, clientX: 0 });
    dispatchPointer('pointermove', { clientY: 40, clientX: 0 });
    expect(onDrag).not.toHaveBeenCalled();
  });

  it('calls onDragStart then onDragEnd', () => {
    const onDragStart = vi.fn();
    const onDragEnd = vi.fn();
    const { container } = render(
      <ResizeHandle
        direction="row"
        onDrag={() => {}}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />,
    );
    const el = container.firstElementChild as HTMLElement;
    dispatchPointer('pointerdown', { clientY: 0, clientX: 0 }, el);
    expect(onDragStart).toHaveBeenCalledTimes(1);
    dispatchPointer('pointerup', { clientY: 0, clientX: 0 });
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });

  it('does not emit after unmount mid-drag', () => {
    const onDrag = vi.fn();
    const { container, unmount } = render(
      <ResizeHandle direction="row" onDrag={onDrag} />,
    );
    const el = container.firstElementChild as HTMLElement;
    dispatchPointer('pointerdown', { clientY: 10, clientX: 0 }, el);
    unmount();
    dispatchPointer('pointermove', { clientY: 40, clientX: 0 });
    expect(onDrag).not.toHaveBeenCalled();
  });
});
