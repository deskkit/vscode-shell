import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type { PageTabsProps } from '../types';

const SCROLLBAR_HIDE_MS = 900;

type OverflowState = {
  needed: boolean;
  thumbLeft: number;
  thumbWidth: number;
};

export const PageTabs: FC<PageTabsProps> = ({ tabs, activeId, onSelect, onClose }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const [scrollbarVisible, setScrollbarVisible] = useState(false);
  const [overflow, setOverflow] = useState<OverflowState>({
    needed: false,
    thumbLeft: 0,
    thumbWidth: 0,
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
      setScrollbarVisible(false);
      hideTimerRef.current = null;
    }, SCROLLBAR_HIDE_MS);
  }, []);

  const revealScrollbar = useCallback(() => {
    setScrollbarVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  const updateScrollbar = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const needed = scrollWidth > clientWidth + 1;
    if (!needed) {
      setOverflow({ needed: false, thumbLeft: 0, thumbWidth: 0 });
      setScrollbarVisible(false);
      clearHideTimer();
      return;
    }
    const thumbWidth = Math.max((clientWidth / scrollWidth) * clientWidth, 24);
    const maxLeft = Math.max(clientWidth - thumbWidth, 0);
    const maxScroll = scrollWidth - clientWidth;
    const thumbLeft = maxScroll <= 0 ? 0 : (scrollLeft / maxScroll) * maxLeft;
    setOverflow({ needed: true, thumbLeft, thumbWidth });
  }, []);

  useEffect(() => {
    updateScrollbar();
    const el = scrollerRef.current;
    if (!el) return;

    const onResize = () => updateScrollbar();
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
  }, [tabs, updateScrollbar]);

  const onScroll = () => {
    updateScrollbar();
    revealScrollbar();
  };

  const onThumbPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const el = scrollerRef.current;
    if (!el) return;
    const startX = event.clientX;
    const startScroll = el.scrollLeft;
    const thumbWidth = overflow.thumbWidth;

    draggingRef.current = true;
    clearHideTimer();
    setScrollbarVisible(true);

    const onMove = (ev: PointerEvent) => {
      const { scrollWidth, clientWidth } = el;
      const maxScroll = scrollWidth - clientWidth;
      const maxThumbLeft = Math.max(clientWidth - thumbWidth, 0);
      if (maxScroll <= 0 || maxThumbLeft <= 0) return;
      const delta = ev.clientX - startX;
      el.scrollLeft = startScroll + (delta / maxThumbLeft) * maxScroll;
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

  return (
    <div
      className="vsc-page-tabs"
      role="tablist"
      onMouseEnter={() => {
        if (overflow.needed) revealScrollbar();
      }}
      onMouseLeave={() => {
        if (!draggingRef.current) scheduleHide();
      }}
    >
      <div
        ref={scrollerRef}
        className="vsc-page-tabs__scroller"
        onScroll={onScroll}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          const showClose = tab.closable !== false && typeof onClose === 'function';
          return (
            <div
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`vsc-page-tabs__tab${isActive ? ' is-active' : ''}`}
              onClick={() => onSelect(tab.id)}
            >
              {tab.icon ? <span className="vsc-page-tabs__icon">{tab.icon}</span> : null}
              <span className="vsc-page-tabs__title">{tab.title}</span>
              {showClose ? (
                <button
                  type="button"
                  className="vsc-page-tabs__close"
                  aria-label={`Close ${tab.title}`}
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    onClose(tab.id);
                  }}
                >
                  ×
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
      {overflow.needed ? (
        <div
          className={`vsc-page-tabs__scrollbar${scrollbarVisible ? ' is-visible' : ''}`}
          aria-hidden="true"
        >
          <div
            className="vsc-page-tabs__scrollbar-thumb"
            style={{ width: overflow.thumbWidth, transform: `translateX(${overflow.thumbLeft}px)` }}
            onPointerDown={onThumbPointerDown}
          />
        </div>
      ) : null}
    </div>
  );
};
