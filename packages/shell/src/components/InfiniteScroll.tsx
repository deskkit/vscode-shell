import { useRef, type FC } from 'react';
import { Scrollbar } from './Scrollbar';
import type { InfiniteScrollProps } from '../types';

export const InfiniteScroll: FC<InfiniteScrollProps> = ({
  hasMore,
  loading = false,
  onLoadMore,
  endMessage,
  loadingMessage = '加载中…',
  orientation = 'vertical',
  children,
  ...scrollbarProps
}) => {
  const lockRef = useRef(false);

  const handleReachEnd = () => {
    if (!hasMore || loading || lockRef.current) return;
    lockRef.current = true;
    onLoadMore();
    requestAnimationFrame(() => {
      lockRef.current = false;
    });
  };

  const status = loading ? loadingMessage : !hasMore ? endMessage : null;

  return (
    <Scrollbar
      {...scrollbarProps}
      orientation={orientation}
      onReachEnd={handleReachEnd}
    >
      {children}
      {status ? (
        <div className="vsc-infinite-scroll__status" aria-live="polite">
          {status}
        </div>
      ) : null}
    </Scrollbar>
  );
};

export type { InfiniteScrollProps } from '../types';
