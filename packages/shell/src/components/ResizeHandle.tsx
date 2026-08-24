import { useCallback, useEffect, useRef, useState, type FC, type PointerEvent as ReactPointerEvent } from 'react';
import type { ResizeHandleProps } from '../types';

const ACTIVE = 'var(--vscode-statusbar-bg)';
const HOVER = 'color-mix(in srgb, var(--vscode-statusbar-bg) 50%, transparent)';

type DragListeners = {
  move: (ev: PointerEvent) => void;
  up: () => void;
};

export const ResizeHandle: FC<ResizeHandleProps> = ({
  direction,
  onDrag,
  onDragStart,
  onDragEnd,
  thickness = 3,
  className,
}) => {
  const [active, setActive] = useState(false);
  const [hover, setHover] = useState(false);
  const lastPos = useRef(0);
  const dragging = useRef(false);
  const listeners = useRef<DragListeners | null>(null);

  const isRow = direction === 'row';

  const detach = useCallback(() => {
    const current = listeners.current;
    if (!current) return;
    window.removeEventListener('pointermove', current.move);
    window.removeEventListener('pointerup', current.up);
    window.removeEventListener('pointercancel', current.up);
    listeners.current = null;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, []);

  useEffect(() => () => detach(), [detach]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      detach();
      dragging.current = true;
      setActive(true);
      lastPos.current = isRow ? event.clientY : event.clientX;
      onDragStart?.();
      document.body.style.userSelect = 'none';
      document.body.style.cursor = isRow ? 'row-resize' : 'col-resize';

      const onMove = (ev: PointerEvent) => {
        const pos = isRow ? ev.clientY : ev.clientX;
        const delta = pos - lastPos.current;
        lastPos.current = pos;
        onDrag(delta);
      };
      const onUp = () => {
        dragging.current = false;
        setActive(false);
        detach();
        onDragEnd?.();
      };
      listeners.current = { move: onMove, up: onUp };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [detach, isRow, onDrag, onDragStart, onDragEnd],
  );

  const rootClass = [
    'shrink-0 transition-colors',
    isRow ? 'cursor-row-resize' : 'cursor-col-resize',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const backgroundColor = active ? ACTIVE : hover ? HOVER : 'transparent';

  return (
    <div
      className={rootClass}
      style={{
        ...(isRow ? { height: thickness } : { width: thickness }),
        backgroundColor,
      }}
      onPointerDown={onPointerDown}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => {
        if (!dragging.current) setHover(false);
      }}
    />
  );
};
