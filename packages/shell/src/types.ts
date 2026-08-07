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

export type WorkbenchProps = {
  activityBar: ReactNode;
  sidebar?: ReactNode | null;
  tabs?: ReactNode;
  statusBar?: ReactNode;
  children: ReactNode;
};
