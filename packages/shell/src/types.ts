import type { ReactNode } from 'react';

export type ActivityItem = {
  id: string;
  label: string;
  icon: ReactNode;
  position?: 'top' | 'bottom';
};

export type ActivityBarProps = {
  items: ActivityItem[];
  activeId: string;
  onChange: (id: string) => void;
  logo?: ReactNode;
  onLogoClick?: () => void;
};

export type SidebarItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  children?: SidebarItem[];
};

export type SidebarProps = {
  title?: string;
  items: SidebarItem[];
  activeId: string;
  onChange: (id: string) => void;
  width?: number;
  footer?: ReactNode;
};

export type PageTab = {
  id: string;
  title: string;
  icon?: ReactNode;
  closable?: boolean;
};

export type PageTabsProps = {
  tabs: PageTab[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose?: (id: string) => void;
};

export type StatusBarProps = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  showThemeToggle?: boolean;
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
};

export type TitleBarProps = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
};

export type WorkbenchProps = {
  titleBar?: ReactNode;
  activityBar: ReactNode;
  sidebar?: ReactNode | null;
  sidebarCollapsed?: boolean;
  tabs?: ReactNode;
  panel?: ReactNode | null;
  statusBar?: ReactNode;
  children: ReactNode;
};

export type ScrollbarOrientation = 'horizontal' | 'vertical';

export type ScrollbarProps = {
  children: ReactNode;
  orientation?: ScrollbarOrientation;
  className?: string;
  viewportClassName?: string;
  hideDelayMs?: number;
  /** Recompute metrics when this value changes (e.g. item list identity). */
  contentKey?: unknown;
  /** Called when the viewport is within `reachEndPx` of the end. May fire while parked at the end. */
  onReachEnd?: () => void;
  /** Distance from the end that counts as reached. Default 80. */
  reachEndPx?: number;
};

export type InfiniteScrollProps = Omit<ScrollbarProps, 'onReachEnd'> & {
  hasMore: boolean;
  loading?: boolean;
  onLoadMore: () => void;
  endMessage?: ReactNode;
  loadingMessage?: ReactNode;
};

export type ResizeHandleDirection = 'row' | 'column';

export type ResizeHandleProps = {
  direction: ResizeHandleDirection;
  onDrag: (delta: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  thickness?: number;
  className?: string;
};
