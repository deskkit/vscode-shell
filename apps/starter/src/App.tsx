import { useMemo, useState } from 'react';
import {
  ActivityBar,
  PageTabs,
  Sidebar,
  StatusBar,
  TitleBar,
  Workbench,
  setTheme,
  type ActivityItem,
  type PageTab,
  type SidebarItem,
  type ThemeMode,
} from '@vscode-shell/ui';
import { HiHome, HiFolder, HiCog, HiSun, HiMoon } from 'react-icons/hi';
import { HomePage } from './pages/HomePage';
import { ExplorerPage } from './pages/ExplorerPage';
import { SettingsPage } from './pages/SettingsPage';
import { WindowControls } from './components/WindowControls';
import { needsCustomWindowControls } from './platform';

const activities: ActivityItem[] = [
  { id: 'home', label: 'Home', icon: <HiHome /> },
  { id: 'explorer', label: 'Explorer', icon: <HiFolder /> },
  { id: 'settings', label: 'Settings', icon: <HiCog />, position: 'bottom' },
];

const sidebars: Record<string, { title: string; items: SidebarItem[] }> = {
  home: {
    title: 'Home',
    items: [{ id: 'home', label: 'Welcome' }],
  },
  explorer: {
    title: 'Explorer',
    items: [
      { id: 'files', label: 'Files' },
      { id: 'search', label: 'Search' },
    ],
  },
  settings: {
    title: 'Settings',
    items: [
      {
        id: 'prefs',
        label: 'Preferences',
        children: [
          { id: 'general', label: 'General' },
          { id: 'appearance', label: 'Appearance' },
        ],
      },
    ],
  },
};

const pageMeta: Record<string, { title: string; view: 'home' | 'explorer' | 'settings' }> = {
  home: { title: 'Home', view: 'home' },
  files: { title: 'Files', view: 'explorer' },
  search: { title: 'Search', view: 'explorer' },
  general: { title: 'General', view: 'settings' },
  appearance: { title: 'Appearance', view: 'settings' },
};

export default function App() {
  const [moduleId, setModuleId] = useState('home');
  const [sidebarId, setSidebarId] = useState('home');
  const [tabs, setTabs] = useState<PageTab[]>([
    { id: 'home', title: 'Home', closable: false },
  ]);
  const [activeTabId, setActiveTabId] = useState('home');
  const [theme, setThemeState] = useState<ThemeMode>('dark');

  const sidebar = sidebars[moduleId];

  const activatePage = (id: string) => {
    const meta = pageMeta[id];
    if (!meta) return;
    setSidebarId(id);
    setModuleId(meta.view);
    setActiveTabId(id);
  };

  const openPage = (id: string) => {
    const meta = pageMeta[id];
    if (!meta) return;
    setTabs((prev) =>
      prev.some((t) => t.id === id)
        ? prev
        : [...prev, { id, title: meta.title, closable: id !== 'home' }],
    );
    activatePage(id);
  };

  const selectTab = (id: string) => {
    activatePage(id);
  };

  const closeTab = (id: string) => {
    if (id === 'home') return;
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (activeTabId === id) {
        const fallbackId = next[next.length - 1]?.id ?? 'home';
        activatePage(fallbackId);
      }
      return next;
    });
  };

  const view = pageMeta[activeTabId]?.view ?? 'home';

  const editor = useMemo(() => {
    if (view === 'explorer') return <ExplorerPage title={pageMeta[activeTabId]?.title} />;
    if (view === 'settings') return <SettingsPage title={pageMeta[activeTabId]?.title} />;
    return <HomePage />;
  }, [view, activeTabId]);

  return (
    <Workbench
      titleBar={
        <TitleBar
          center={<span>VS Code Shell</span>}
          right={
            <>
              <button
                type="button"
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                onClick={() => {
                  const next = theme === 'dark' ? 'light' : 'dark';
                  setTheme(next);
                  setThemeState(next);
                }}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: 4,
                }}
              >
                {theme === 'dark' ? <HiSun size={14} /> : <HiMoon size={14} />}
              </button>
              {needsCustomWindowControls() ? <WindowControls /> : null}
            </>
          }
        />
      }
      activityBar={
        <ActivityBar
          items={activities}
          activeId={moduleId}
          onChange={(id) => {
            const first = sidebars[id].items[0];
            const leaf = first.children?.[0]?.id ?? first.id;
            openPage(leaf);
          }}
          logo={<span style={{ fontWeight: 700 }}>VS</span>}
          onLogoClick={() => {
            openPage('home');
          }}
        />
      }
      sidebar={
        <Sidebar
          title={sidebar.title}
          items={sidebar.items}
          activeId={sidebarId}
          onChange={openPage}
        />
      }
      tabs={
        <PageTabs
          tabs={tabs}
          activeId={activeTabId}
          onSelect={selectTab}
          onClose={closeTab}
        />
      }
      statusBar={
        <StatusBar left={<span>Ready</span>} right={<span>v0.1.0</span>} />
      }
    >
      {editor}
    </Workbench>
  );
}
