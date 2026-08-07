import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FC,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type { ScrollbarOrientation, ScrollbarProps } from '../types';

const DEFAULT_HIDE_MS = 900;
const MIN_THUMB = 24;

type OverflowState = {
  needed: boolean;
  thumbOffset: number;
  thumbSize: number;
};

function readMetrics(el: HTMLElement, orientation: ScrollbarOrientation) {
  if (orientation === 'horizontal') {
    return {
      scrollPos: el.scrollLeft,
      scrollSize: el.scrollWidth,
      clientSize: el.clientWidth,
    };
  }
  return {
    scrollPos: el.scrollTop,
    scrollSize: el.scrollHeight,
    clientSize: el.clientHeight,
  };
}

function writeScroll(el: HTMLElement, orientation: ScrollbarOrientation, value: number) {
  if (orientation === 'horizontal') el.scrollLeft = value;
  else el.scrollTop = value;
}

export const Scrollbar: FC<ScrollbarProps> = ({
  children,
  orientation = 'horizontal',
  className,
  viewportClassName,
  hideDelayMs = DEFAULT_HIDE_MS,
  contentKey,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [overflow, setOverflow] = useState<OverflowState>({
    needed: false,
    thumbOffset: 0,
    thumbSize: 0,
  });

  const clearHideTimer = () => {
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    if (draggingRef.current) return;
    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      hideTimerRef.current = null;
    }, hideDelayMs);
  }, [hideDelayMs]);

  const reveal = useCallback(() => {
    setVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  const update = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const { scrollPos, scrollSize, clientSize } = readMetrics(el, orientation);
    const needed = scrollSize > clientSize + 1;
    if (!needed) {
      setOverflow({ needed: false, thumbOffset: 0, thumbSize: 0 });
      setVisible(false);
      clearHideTimer();
      return;
    }
    const thumbSize = Math.max((clientSize / scrollSize) * clientSize, MIN_THUMB);
    const maxOffset = Math.max(clientSize - thumbSize, 0);
    const maxScroll = scrollSize - clientSize;
    const thumbOffset = maxScroll <= 0 ? 0 : (scrollPos / maxScroll) * maxOffset;
    setOverflow({ needed: true, thumbOffset, thumbSize });
  }, [orientation]);

  useEffect(() => {
    update();
    const el = viewportRef.current;
    if (!el) return;

    const onResize = () => update();
    window.addEventListener('resize', onResize);

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(onResize);
      ro.observe(el);
    }

    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', onResize);
      clearHideTimer();
    };
  }, [contentKey, children, update]);

  const onScroll = () => {
    update();
    reveal();
  };

  const onThumbPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const el = viewportRef.current;
    if (!el) return;

    const startClient = orientation === 'horizontal' ? event.clientX : event.clientY;
    const startScroll = readMetrics(el, orientation).scrollPos;
    const thumbSize = overflow.thumbSize;

    draggingRef.current = true;
    clearHideTimer();
    setVisible(true);

    const onMove = (ev: PointerEvent) => {
      const { scrollSize, clientSize } = readMetrics(el, orientation);
      const maxScroll = scrollSize - clientSize;
      const maxThumbOffset = Math.max(clientSize - thumbSize, 0);
      if (maxScroll <= 0 || maxThumbOffset <= 0) return;
      const current = orientation === 'horizontal' ? ev.clientX : ev.clientY;
      const delta = current - startClient;
      writeScroll(el, orientation, startScroll + (delta / maxThumbOffset) * maxScroll);
    };
    const onUp = () => {
      draggingRef.current = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      scheduleHide();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const rootClass = [
    'vsc-scrollbar',
    `vsc-scrollbar--${orientation}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const thumbStyle: CSSProperties =
    orientation === 'horizontal'
      ? { width: overflow.thumbSize, transform: `translateX(${overflow.thumbOffset}px)` }
      : { height: overflow.thumbSize, transform: `translateY(${overflow.thumbOffset}px)` };

  return (
    <div
      className={rootClass}
      onMouseEnter={() => {
        if (overflow.needed) reveal();
      }}
      onMouseLeave={() => {
        if (!draggingRef.current) scheduleHide();
      }}
    >
      <div
        ref={viewportRef}
        className={['vsc-scrollbar__viewport', viewportClassName].filter(Boolean).join(' ')}
        onScroll={onScroll}
      >
        {children}
      </div>
      {overflow.needed ? (
        <div
          className={`vsc-scrollbar__track${visible ? ' is-visible' : ''}`}
          aria-hidden="true"
        >
          <div
            className="vsc-scrollbar__thumb"
            style={thumbStyle}
            onPointerDown={onThumbPointerDown}
          />
        </div>
      ) : null}
    </div>
  );
};

export type { ScrollbarProps } from '../types';
