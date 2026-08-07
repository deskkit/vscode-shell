# VS Code Shell Library + Starter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `@vscode-shell/ui` (tokens + prop-driven VS Code chrome) and a Tauri + React `starter` app that consumes it, with Light+/Dark+ themes.

**Architecture:** pnpm monorepo: `packages/shell` ships self-contained CSS variables and React chrome components; `apps/starter` holds demo navigation state and a minimal Tauri window. Library has no router, Tauri, or Ant Design dependencies.

**Tech Stack:** React 18/19 (peer), TypeScript, Vite, Vitest + Testing Library, tsup (library build), Tailwind CSS 4 (starter only), Tauri 2, pnpm workspaces, react-icons (starter only).

## Global Constraints

- Package name: `@vscode-shell/ui`; starter `package.json` `name`: `starter`
- Chrome is controlled via props/slots; no business logic, routes, or Tauri APIs in the library
- Themes: `:root` Light+, `.dark` Dark+; tokens from os-kit `src/index.css` (no Ant/ProTable CSS)
- Component styles: CSS variables + `.vsc-*` classes (not consumer Tailwind)
- peerDependencies: `"react": ">=18 <20"`, `"react-dom": ">=18 <20"`
- v1 does not migrate os-kit or cb-monitor; no npm publish; no CLI
- Default starter theme: `dark`
- Working directory for all commands: `/Users/melon/Projects/melon/vscode-shell`

---

## File Structure

```
vscode-shell/
├── package.json                          # workspace root scripts
├── pnpm-workspace.yaml
├── .gitignore
├── README.md                             # expand from stub
├── packages/shell/
│   ├── package.json                      # @vscode-shell/ui
│   ├── tsconfig.json
│   ├── tsup.config.ts
│   ├── vitest.config.ts
│   ├── src/
│   │   ├── index.ts                      # public exports
│   │   ├── theme.ts                      # setTheme / getTheme
│   │   ├── theme.test.ts
│   │   ├── styles.css                    # tokens + chrome styles (shipped)
│   │   ├── types.ts                      # shared prop/item types
│   │   └── components/
│   │       ├── Workbench.tsx
│   │       ├── ActivityBar.tsx
│   │       ├── ActivityBar.test.tsx
│   │       ├── Sidebar.tsx
│   │       ├── Sidebar.test.tsx
│   │       ├── PageTabs.tsx
│   │       ├── PageTabs.test.tsx
│   │       ├── StatusBar.tsx
│   │       └── StatusBar.test.tsx
│   └── dist/                             # build output (gitignored)
└── apps/starter/
    ├── package.json                      # name: starter
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── App.css                       # app-only helpers if needed
    │   ├── vite-env.d.ts
    │   └── pages/
    │       ├── HomePage.tsx
    │       ├── ExplorerPage.tsx
    │       └── SettingsPage.tsx
    └── src-tauri/
        ├── Cargo.toml
        ├── tauri.conf.json
        ├── capabilities/default.json
        └── src/main.rs                   # or lib.rs per tauri 2 template
```

Reference token source (copy values only):  
`/Users/melon/Projects/gentech/cloud-group/os-kit/src/index.css` lines 8–86 (tokens + scrollbar). Do **not** copy Ant overrides below that.

---

### Task 1: Monorepo scaffold + shell package tooling

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `.gitignore`
- Create: `packages/shell/package.json`, `packages/shell/tsconfig.json`, `packages/shell/tsup.config.ts`, `packages/shell/vitest.config.ts`
- Create: `packages/shell/src/index.ts` (empty export placeholder)

**Interfaces:**
- Consumes: nothing
- Produces: workspace installable; `@vscode-shell/ui` package skeleton with `build` / `test` scripts

- [ ] **Step 1: Write root workspace files**

`pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

Root `package.json`:
```json
{
  "name": "vscode-shell",
  "private": true,
  "scripts": {
    "build": "pnpm -r run build",
    "test": "pnpm --filter @vscode-shell/ui test"
  },
  "engines": {
    "node": ">=20"
  },
  "packageManager": "pnpm@9.15.0"
}
```

`.gitignore`:
```
node_modules
dist
*.local
.DS_Store
apps/starter/src-tauri/target
```

- [ ] **Step 2: Write `packages/shell` package config**

`packages/shell/package.json`:
```json
{
  "name": "@vscode-shell/ui",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup && cp src/styles.css dist/styles.css",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "peerDependencies": {
    "react": ">=18 <20",
    "react-dom": ">=18 <20"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.2.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "jsdom": "^26.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tsup": "^8.3.5",
    "typescript": "~5.7.3",
    "vitest": "^3.0.5"
  }
}
```

`packages/shell/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src"]
}
```

`packages/shell/tsup.config.ts`:
```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
});
```

`packages/shell/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

`packages/shell/vitest.setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
```

`packages/shell/src/index.ts`:
```ts
export {};
```

`packages/shell/src/styles.css` (minimal placeholder so `cp` in build does not fail yet):
```css
/* tokens and chrome styles added in later tasks */
```

- [ ] **Step 3: Install dependencies**

Run: `pnpm install`  
Expected: lockfile created; `@vscode-shell/ui` listed in workspace

- [ ] **Step 4: Verify empty build and test scripts run**

Run: `pnpm --filter @vscode-shell/ui build`  
Expected: `packages/shell/dist/index.js` and `dist/styles.css` exist

Run: `pnpm --filter @vscode-shell/ui test`  
Expected: PASS with “No test files found” **or** exit 0 with 0 tests — if vitest fails on zero tests, add `passWithNoTests: true` to `vitest.config.ts` and re-run

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-workspace.yaml pnpm-lock.yaml .gitignore packages/shell
git commit -m "chore: scaffold pnpm workspace and @vscode-shell/ui package"
```

---

### Task 2: Theme helpers (`setTheme` / `getTheme`)

**Files:**
- Create: `packages/shell/src/theme.ts`
- Create: `packages/shell/src/theme.test.ts`
- Modify: `packages/shell/src/index.ts`

**Interfaces:**
- Consumes: DOM `document.documentElement`
- Produces:
  - `export type ThemeMode = 'light' | 'dark'`
  - `export function setTheme(theme: ThemeMode): void`
  - `export function getTheme(): ThemeMode`

- [ ] **Step 1: Write the failing tests**

`packages/shell/src/theme.test.ts`:
```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { getTheme, setTheme } from './theme';

describe('theme', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('defaults to light when .dark is absent', () => {
    expect(getTheme()).toBe('light');
  });

  it('setTheme(dark) adds .dark on documentElement', () => {
    setTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(getTheme()).toBe('dark');
  });

  it('setTheme(light) removes .dark', () => {
    setTheme('dark');
    setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(getTheme()).toBe('light');
  });

  it('ignores invalid theme values and falls back to dark', () => {
    setTheme('dark');
    // @ts-expect-error runtime guard
    setTheme('purple');
    expect(getTheme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @vscode-shell/ui test`  
Expected: FAIL — cannot find module `./theme` or `setTheme` undefined

- [ ] **Step 3: Implement theme helpers**

`packages/shell/src/theme.ts`:
```ts
export type ThemeMode = 'light' | 'dark';

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

export function setTheme(theme: ThemeMode): void {
  const next: ThemeMode = isThemeMode(theme) ? theme : 'dark';
  document.documentElement.classList.toggle('dark', next === 'dark');
}

export function getTheme(): ThemeMode {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}
```

Update `packages/shell/src/index.ts`:
```ts
export { setTheme, getTheme } from './theme';
export type { ThemeMode } from './theme';
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @vscode-shell/ui test`  
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/shell/src/theme.ts packages/shell/src/theme.test.ts packages/shell/src/index.ts
git commit -m "feat(shell): add setTheme and getTheme helpers"
```

---

### Task 3: Design tokens CSS

**Files:**
- Modify: `packages/shell/src/styles.css`

**Interfaces:**
- Consumes: os-kit token values (see below)
- Produces: `:root` / `.dark` `--vscode-*` variables + scrollbar + base body colors

- [ ] **Step 1: Replace `styles.css` with full token block**

Use these exact values (from os-kit, Ant rules omitted):

```css
/* ── VS Code Design Tokens ── */
:root {
  --vscode-editor-bg: #ffffff;
  --vscode-sidebar-bg: #f3f3f3;
  --vscode-activitybar-bg: #2c2c2c;
  --vscode-statusbar-bg: #007acc;
  --vscode-hover-bg: #e8e8e8;
  --vscode-selected-bg: #e4e6f1;
  --vscode-border: #d0d0d0;
  --vscode-text-primary: #333333;
  --vscode-text-secondary: #666666;
  --vscode-text-highlight: #000000;
  --vscode-success: #16a34a;
  --vscode-error: #dc2626;
  --vscode-input-bg: #ffffff;
  --vscode-input-border: #c0c0c0;
  --vscode-table-header-bg: #f5f5f5;
  --vscode-table-row-hover: #f5f5f5;
  --vscode-table-border: #e8e8e8;
  --vscode-modal-bg: #ffffff;
  --vscode-modal-title: #000000;
}

.dark {
  --vscode-editor-bg: #1e1e1e;
  --vscode-sidebar-bg: #252526;
  --vscode-activitybar-bg: #333333;
  --vscode-statusbar-bg: #007acc;
  --vscode-hover-bg: #2a2d2e;
  --vscode-selected-bg: #37373d;
  --vscode-border: #404040;
  --vscode-text-primary: #cccccc;
  --vscode-text-secondary: #999999;
  --vscode-text-highlight: #ffffff;
  --vscode-success: #4ade80;
  --vscode-error: #f87171;
  --vscode-input-bg: #252526;
  --vscode-input-border: #555555;
  --vscode-table-header-bg: #2d2d2d;
  --vscode-table-row-hover: #2a2d2e;
  --vscode-table-border: #404040;
  --vscode-modal-bg: #252526;
  --vscode-modal-title: #ffffff;
}

:root, html, body {
  overscroll-behavior: none;
  height: 100%;
  margin: 0;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
  background-color: var(--vscode-editor-bg);
  color: var(--vscode-text-primary);
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-track {
  background: var(--vscode-editor-bg);
}
::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 5px;
}
::-webkit-scrollbar-thumb:hover {
  background: #4f4f4f;
}
```

- [ ] **Step 2: Rebuild package so dist CSS updates**

Run: `pnpm --filter @vscode-shell/ui build`  
Expected: `packages/shell/dist/styles.css` contains `--vscode-editor-bg`

- [ ] **Step 3: Commit**

```bash
git add packages/shell/src/styles.css
git commit -m "feat(shell): add Light+/Dark+ VS Code design tokens"
```

---

### Task 4: Shared types + ActivityBar

**Files:**
- Create: `packages/shell/src/types.ts`
- Create: `packages/shell/src/components/ActivityBar.tsx`
- Create: `packages/shell/src/components/ActivityBar.test.tsx`
- Modify: `packages/shell/src/styles.css` (append `.vsc-activity-bar` rules)
- Modify: `packages/shell/src/index.ts`

**Interfaces:**
- Consumes: tokens via CSS variables
- Produces types + component:
```ts
export type ActivityItem = {
  id: string
  label: string
  icon: React.ReactNode
  position?: 'top' | 'bottom'
}
export type ActivityBarProps = {
  items: ActivityItem[]
  activeId: string
  onChange: (id: string) => void
  logo?: React.ReactNode
  onLogoClick?: () => void
}
export function ActivityBar(props: ActivityBarProps): JSX.Element
```

- [ ] **Step 1: Write types and failing tests**

`packages/shell/src/types.ts`:
```ts
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
```

`packages/shell/src/components/ActivityBar.test.tsx`:
```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityBar } from './ActivityBar';

const items = [
  { id: 'home', label: 'Home', icon: <span>H</span> },
  { id: 'settings', label: 'Settings', icon: <span>S</span>, position: 'bottom' as const },
];

describe('ActivityBar', () => {
  it('calls onChange when an item is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ActivityBar items={items} activeId="home" onChange={onChange} />);
    await user.click(screen.getByTitle('Settings'));
    expect(onChange).toHaveBeenCalledWith('settings');
  });

  it('marks the active item', () => {
    render(<ActivityBar items={items} activeId="home" onChange={() => {}} />);
    expect(screen.getByTitle('Home').getAttribute('aria-current')).toBe('page');
    expect(screen.getByTitle('Settings').getAttribute('aria-current')).toBeNull();
  });

  it('does not mark any item when activeId is unknown', () => {
    render(<ActivityBar items={items} activeId="missing" onChange={() => {}} />);
    expect(screen.getByTitle('Home').getAttribute('aria-current')).toBeNull();
  });

  it('calls onLogoClick when logo is clicked', async () => {
    const user = userEvent.setup();
    const onLogoClick = vi.fn();
    render(
      <ActivityBar
        items={items}
        activeId="home"
        onChange={() => {}}
        logo={<span>Logo</span>}
        onLogoClick={onLogoClick}
      />,
    );
    await user.click(screen.getByTitle('Home logo'));
    expect(onLogoClick).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @vscode-shell/ui test`  
Expected: FAIL — `ActivityBar` not found

- [ ] **Step 3: Implement ActivityBar + CSS**

`packages/shell/src/components/ActivityBar.tsx`:
```tsx
import type { FC } from 'react';
import type { ActivityBarProps, ActivityItem } from '../types';

export const ActivityBar: FC<ActivityBarProps> = ({
  items,
  activeId,
  onChange,
  logo,
  onLogoClick,
}) => {
  const top = items.filter((i) => (i.position ?? 'top') === 'top');
  const bottom = items.filter((i) => i.position === 'bottom');

  const renderItem = (item: ActivityItem) => {
    const isActive = item.id === activeId;
    return (
      <button
        key={item.id}
        type="button"
        title={item.label}
        aria-label={item.label}
        aria-current={isActive ? 'page' : undefined}
        className={`vsc-activity-bar__item${isActive ? ' is-active' : ''}`}
        onClick={() => onChange(item.id)}
      >
        {isActive ? <span className="vsc-activity-bar__indicator" /> : null}
        <span className="vsc-activity-bar__icon">{item.icon}</span>
      </button>
    );
  };

  return (
    <div className="vsc-activity-bar">
      {logo ? (
        <button
          type="button"
          title="Home logo"
          aria-label="Home logo"
          className="vsc-activity-bar__logo"
          onClick={onLogoClick}
        >
          {logo}
        </button>
      ) : null}
      <div className="vsc-activity-bar__top">{top.map(renderItem)}</div>
      <div className="vsc-activity-bar__bottom">{bottom.map(renderItem)}</div>
    </div>
  );
};
```

Append to `packages/shell/src/styles.css`:
```css
.vsc-activity-bar {
  width: 48px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0;
  background: var(--vscode-activitybar-bg);
  border-right: 1px solid var(--vscode-border);
  color: var(--vscode-text-primary);
}

.vsc-activity-bar__top {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.vsc-activity-bar__bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.vsc-activity-bar__logo,
.vsc-activity-bar__item {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.5;
}

.vsc-activity-bar__logo:hover,
.vsc-activity-bar__item:hover,
.vsc-activity-bar__item.is-active {
  opacity: 1;
  background: color-mix(in srgb, var(--vscode-hover-bg) 40%, transparent);
}

.vsc-activity-bar__indicator {
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 2px;
  border-radius: 0 2px 2px 0;
  background: var(--vscode-text-highlight);
}

.vsc-activity-bar__icon {
  font-size: 20px;
  line-height: 1;
  display: flex;
}
```

Export from `index.ts`:
```ts
export { setTheme, getTheme } from './theme';
export type { ThemeMode } from './theme';
export { ActivityBar } from './components/ActivityBar';
export type {
  ActivityItem,
  ActivityBarProps,
  SidebarItem,
  SidebarProps,
  PageTab,
  PageTabsProps,
  StatusBarProps,
  WorkbenchProps,
} from './types';
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @vscode-shell/ui test`  
Expected: PASS including ActivityBar cases

- [ ] **Step 5: Commit**

```bash
git add packages/shell/src
git commit -m "feat(shell): add ActivityBar and shared prop types"
```

---

### Task 5: Sidebar

**Files:**
- Create: `packages/shell/src/components/Sidebar.tsx`
- Create: `packages/shell/src/components/Sidebar.test.tsx`
- Modify: `packages/shell/src/styles.css`, `packages/shell/src/index.ts`

**Interfaces:**
- Consumes: `SidebarProps` from `types.ts`
- Produces: `export function Sidebar(props: SidebarProps): JSX.Element`
- Default `width`: `192`

- [ ] **Step 1: Write failing tests**

`packages/shell/src/components/Sidebar.test.tsx`:
```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from './Sidebar';

const items = [
  { id: 'files', label: 'Files' },
  {
    id: 'group',
    label: 'Group',
    children: [{ id: 'child', label: 'Child' }],
  },
];

describe('Sidebar', () => {
  it('renders title and calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Sidebar title="Explorer" items={items} activeId="files" onChange={onChange} />,
    );
    expect(screen.getByText('Explorer')).toBeInTheDocument();
    await user.click(screen.getByText('Child'));
    expect(onChange).toHaveBeenCalledWith('child');
  });

  it('marks active leaf', () => {
    render(<Sidebar items={items} activeId="files" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Files' }).className).toContain('is-active');
  });

  it('renders footer slot', () => {
    render(
      <Sidebar
        items={items}
        activeId="files"
        onChange={() => {}}
        footer={<div>Footer</div>}
      />,
    );
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @vscode-shell/ui test`  
Expected: FAIL — `Sidebar` not found

- [ ] **Step 3: Implement Sidebar + CSS**

`packages/shell/src/components/Sidebar.tsx`:
```tsx
import type { FC } from 'react';
import type { SidebarItem, SidebarProps } from '../types';

export const Sidebar: FC<SidebarProps> = ({
  title,
  items,
  activeId,
  onChange,
  width = 192,
  footer,
}) => {
  const renderItems = (list: SidebarItem[], depth = 0) =>
    list.map((item) => {
      const hasChildren = Boolean(item.children?.length);
      if (hasChildren) {
        return (
          <div key={item.id} className="vsc-sidebar__group">
            <div className="vsc-sidebar__group-label" style={{ paddingLeft: 12 + depth * 12 }}>
              {item.icon}
              <span>{item.label}</span>
            </div>
            {renderItems(item.children!, depth + 1)}
          </div>
        );
      }
      const isActive = item.id === activeId;
      return (
        <button
          key={item.id}
          type="button"
          className={`vsc-sidebar__item${isActive ? ' is-active' : ''}`}
          style={{ paddingLeft: 12 + depth * 12 }}
          onClick={() => onChange(item.id)}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      );
    });

  return (
    <aside className="vsc-sidebar" style={{ width }}>
      {title ? <div className="vsc-sidebar__title">{title}</div> : null}
      <nav className="vsc-sidebar__nav">{renderItems(items)}</nav>
      {footer ? <div className="vsc-sidebar__footer">{footer}</div> : null}
    </aside>
  );
};
```

Append CSS:
```css
.vsc-sidebar {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--vscode-sidebar-bg);
  border-right: 1px solid var(--vscode-border);
  color: var(--vscode-text-primary);
  min-height: 0;
}

.vsc-sidebar__title {
  height: 35px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--vscode-text-secondary);
}

.vsc-sidebar__nav {
  flex: 1;
  overflow: auto;
  padding: 4px 0;
}

.vsc-sidebar__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: var(--vscode-text-primary);
  font-size: 13px;
  text-align: left;
  padding: 6px 12px;
  cursor: pointer;
}

.vsc-sidebar__item:hover {
  background: var(--vscode-hover-bg);
}

.vsc-sidebar__item.is-active {
  background: var(--vscode-selected-bg);
  color: var(--vscode-text-highlight);
}

.vsc-sidebar__group-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  font-size: 11px;
  color: var(--vscode-text-secondary);
  text-transform: uppercase;
}

.vsc-sidebar__footer {
  border-top: 1px solid var(--vscode-border);
  padding: 8px 12px;
}
```

Add `export { Sidebar } from './components/Sidebar';` and keep exporting `SidebarProps` / `SidebarItem` from `index.ts`.

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @vscode-shell/ui test`

- [ ] **Step 5: Commit**

```bash
git add packages/shell/src
git commit -m "feat(shell): add Sidebar component"
```

---

### Task 6: PageTabs

**Files:**
- Create: `packages/shell/src/components/PageTabs.tsx`
- Create: `packages/shell/src/components/PageTabs.test.tsx`
- Modify: `packages/shell/src/styles.css`, `packages/shell/src/index.ts`

**Interfaces:**
- Consumes: `PageTabsProps`
- Produces: `export function PageTabs(props: PageTabsProps): JSX.Element`
- Rules: `closable` defaults `true`; if `closable !== false` but `onClose` missing, hide close button; stopPropagation on close click

- [ ] **Step 1: Write failing tests**

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageTabs } from './PageTabs';

const tabs = [
  { id: 'home', title: 'Home', closable: false },
  { id: 'a', title: 'Alpha' },
];

describe('PageTabs', () => {
  it('selects a tab', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<PageTabs tabs={tabs} activeId="home" onSelect={onSelect} onClose={() => {}} />);
    await user.click(screen.getByText('Alpha'));
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('closes a closable tab without selecting', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<PageTabs tabs={tabs} activeId="home" onSelect={onSelect} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Close Alpha' }));
    expect(onClose).toHaveBeenCalledWith('a');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('hides close when onClose is omitted', () => {
    render(<PageTabs tabs={tabs} activeId="a" onSelect={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Close Alpha' })).toBeNull();
  });

  it('hides close when closable is false', () => {
    render(<PageTabs tabs={tabs} activeId="home" onSelect={() => {}} onClose={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Close Home' })).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @vscode-shell/ui test`

- [ ] **Step 3: Implement PageTabs + CSS**

```tsx
import type { FC, MouseEvent } from 'react';
import type { PageTabsProps } from '../types';

export const PageTabs: FC<PageTabsProps> = ({ tabs, activeId, onSelect, onClose }) => {
  return (
    <div className="vsc-page-tabs" role="tablist">
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
  );
};
```

Append CSS:
```css
.vsc-page-tabs {
  height: 35px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  overflow-x: auto;
  background: var(--vscode-sidebar-bg);
  border-bottom: 1px solid var(--vscode-border);
}

.vsc-page-tabs__tab {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 100%;
  padding: 0 12px;
  border-right: 1px solid var(--vscode-border);
  border-top: 2px solid transparent;
  color: var(--vscode-text-secondary);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  background: transparent;
}

.vsc-page-tabs__tab.is-active {
  background: var(--vscode-editor-bg);
  color: var(--vscode-text-highlight);
  border-top-color: var(--vscode-statusbar-bg);
}

.vsc-page-tabs__close {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  width: 16px;
  height: 16px;
  line-height: 1;
  border-radius: 3px;
  opacity: 0.7;
}

.vsc-page-tabs__close:hover {
  background: var(--vscode-hover-bg);
  opacity: 1;
}
```

Export `PageTabs` from `index.ts`.

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @vscode-shell/ui test`

- [ ] **Step 5: Commit**

```bash
git add packages/shell/src
git commit -m "feat(shell): add PageTabs component"
```

---

### Task 7: StatusBar

**Files:**
- Create: `packages/shell/src/components/StatusBar.tsx`
- Create: `packages/shell/src/components/StatusBar.test.tsx`
- Modify: `packages/shell/src/styles.css`, `packages/shell/src/index.ts`

**Interfaces:**
- Consumes: `StatusBarProps`
- Produces: `export function StatusBar(props: StatusBarProps): JSX.Element`
- Theme toggle only calls `onThemeChange` with the opposite of current `theme` (default assume `dark` if `theme` omitted when toggle shown)

- [ ] **Step 1: Write failing tests**

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusBar } from './StatusBar';

describe('StatusBar', () => {
  it('renders left/center/right slots', () => {
    render(<StatusBar left="L" center="C" right="R" />);
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();
  });

  it('toggles theme via callback only', async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();
    render(
      <StatusBar showThemeToggle theme="dark" onThemeChange={onThemeChange} />,
    );
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(onThemeChange).toHaveBeenCalledWith('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
```

Note: the second assertion documents that StatusBar must **not** call `setTheme` itself.

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @vscode-shell/ui test`

- [ ] **Step 3: Implement StatusBar + CSS**

```tsx
import type { FC } from 'react';
import type { StatusBarProps } from '../types';

export const StatusBar: FC<StatusBarProps> = ({
  left,
  center,
  right,
  showThemeToggle,
  theme = 'dark',
  onThemeChange,
}) => {
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <footer className="vsc-status-bar">
      <div className="vsc-status-bar__left">{left}</div>
      <div className="vsc-status-bar__center">{center}</div>
      <div className="vsc-status-bar__right">
        {right}
        {showThemeToggle ? (
          <button
            type="button"
            className="vsc-status-bar__theme"
            aria-label={`Switch to ${next} theme`}
            onClick={() => onThemeChange?.(next)}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        ) : null}
      </div>
    </footer>
  );
};
```

Append CSS:
```css
.vsc-status-bar {
  height: 22px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 8px;
  background: var(--vscode-statusbar-bg);
  color: #ffffff;
  font-size: 12px;
}

.vsc-status-bar__left,
.vsc-status-bar__center,
.vsc-status-bar__right {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.vsc-status-bar__center {
  flex: 1;
  justify-content: center;
}

.vsc-status-bar__theme {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 12px;
  padding: 0 4px;
}

.vsc-status-bar__theme:hover {
  text-decoration: underline;
}
```

Export `StatusBar` from `index.ts`.

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @vscode-shell/ui test`

- [ ] **Step 5: Commit**

```bash
git add packages/shell/src
git commit -m "feat(shell): add StatusBar with theme toggle slot"
```

---

### Task 8: Workbench layout + package export freeze

**Files:**
- Create: `packages/shell/src/components/Workbench.tsx`
- Create: `packages/shell/src/components/Workbench.test.tsx`
- Modify: `packages/shell/src/styles.css`, `packages/shell/src/index.ts`

**Interfaces:**
- Consumes: `WorkbenchProps`
- Produces: `export function Workbench(props: WorkbenchProps): JSX.Element`
- When `sidebar == null` or `sidebar === undefined` omitted path: if prop is `null`, hide sidebar column; if omitted (`undefined`), also hide (treat only ReactNode as visible). Spec: `sidebar={null}` hides — implement: render sidebar column only when `sidebar != null`.

- [ ] **Step 1: Write failing tests**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Workbench } from './Workbench';

describe('Workbench', () => {
  it('renders chrome slots and children', () => {
    render(
      <Workbench
        activityBar={<div>AB</div>}
        sidebar={<div>SB</div>}
        tabs={<div>TABS</div>}
        statusBar={<div>STATUS</div>}
      >
        <div>EDITOR</div>
      </Workbench>,
    );
    expect(screen.getByText('AB')).toBeInTheDocument();
    expect(screen.getByText('SB')).toBeInTheDocument();
    expect(screen.getByText('TABS')).toBeInTheDocument();
    expect(screen.getByText('EDITOR')).toBeInTheDocument();
    expect(screen.getByText('STATUS')).toBeInTheDocument();
  });

  it('hides sidebar column when sidebar is null', () => {
    const { container } = render(
      <Workbench activityBar={<div>AB</div>} sidebar={null}>
        <div>EDITOR</div>
      </Workbench>,
    );
    expect(container.querySelector('.vsc-workbench__sidebar')).toBeNull();
    expect(screen.getByText('EDITOR')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @vscode-shell/ui test`

- [ ] **Step 3: Implement Workbench + CSS; freeze exports**

```tsx
import type { FC } from 'react';
import type { WorkbenchProps } from '../types';

export const Workbench: FC<WorkbenchProps> = ({
  activityBar,
  sidebar,
  tabs,
  statusBar,
  children,
}) => {
  return (
    <div className="vsc-workbench">
      <div className="vsc-workbench__body">
        {activityBar}
        {sidebar != null ? <div className="vsc-workbench__sidebar">{sidebar}</div> : null}
        <div className="vsc-workbench__main">
          {tabs}
          <main className="vsc-workbench__editor">{children}</main>
        </div>
      </div>
      {statusBar}
    </div>
  );
};
```

Append CSS:
```css
.vsc-workbench {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--vscode-editor-bg);
  color: var(--vscode-text-primary);
}

.vsc-workbench__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: row;
}

.vsc-workbench__sidebar {
  display: flex;
  min-height: 0;
}

.vsc-workbench__main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.vsc-workbench__editor {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: var(--vscode-editor-bg);
}
```

Final `packages/shell/src/index.ts`:
```ts
export { setTheme, getTheme } from './theme';
export type { ThemeMode } from './theme';
export { Workbench } from './components/Workbench';
export { ActivityBar } from './components/ActivityBar';
export { Sidebar } from './components/Sidebar';
export { PageTabs } from './components/PageTabs';
export { StatusBar } from './components/StatusBar';
export type {
  ActivityItem,
  ActivityBarProps,
  SidebarItem,
  SidebarProps,
  PageTab,
  PageTabsProps,
  StatusBarProps,
  WorkbenchProps,
} from './types';
```

- [ ] **Step 4: Run full shell test + build**

Run: `pnpm --filter @vscode-shell/ui test`  
Expected: all PASS

Run: `pnpm --filter @vscode-shell/ui build`  
Expected: `dist/index.js`, `dist/index.d.ts`, `dist/styles.css` present

- [ ] **Step 5: Commit**

```bash
git add packages/shell
git commit -m "feat(shell): add Workbench and complete public exports"
```

---

### Task 9: Scaffold Tauri + React starter app

**Files:**
- Create: entire `apps/starter/**` via Tauri/Vite scaffolding, then wire workspace dependency

**Interfaces:**
- Consumes: `@vscode-shell/ui` workspace protocol
- Produces: runnable `pnpm --filter starter tauri dev` project skeleton (may still show default Vite page until Task 10)

- [ ] **Step 1: Create Vite React-TS app in apps/starter**

Run from repo root:
```bash
pnpm dlx create-vite@6.0.0 apps/starter --template react-ts
```

Then set `apps/starter/package.json` `name` to exactly `starter`.

- [ ] **Step 2: Add Tailwind 4, Tauri 2, workspace UI dep, react-icons**

In `apps/starter/package.json` dependencies / devDependencies, ensure roughly:
```json
{
  "name": "starter",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "tauri:dev": "tauri dev"
  },
  "dependencies": {
    "@tauri-apps/api": "^2.2.0",
    "@vscode-shell/ui": "workspace:*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-icons": "^5.4.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@tauri-apps/cli": "^2.2.0",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0",
    "typescript": "~5.7.3",
    "vite": "^6.0.0"
  }
}
```

`apps/starter/vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: 'ws', host, port: 1421 } : undefined,
  },
  envPrefix: ['VITE_', 'TAURI_'],
});
```

`apps/starter/src/index.css`:
```css
@import "tailwindcss";

html, body, #root {
  height: 100%;
  margin: 0;
}
```

- [ ] **Step 3: Initialize Tauri in starter**

Run:
```bash
cd apps/starter && pnpm exec tauri init --app-name "VS Code Shell Starter" --window-title "VS Code Shell Starter" --dev-url http://localhost:1420 --before-dev-command "pnpm dev" --before-build-command "pnpm build" --ci
```

If the CLI flag set differs on installed version, use interactive defaults equivalent to: dev URL `http://localhost:1420`, beforeDevCommand `pnpm dev`, frontendDist `../dist`.

Ensure `tauri.conf.json` window is reasonable, e.g. width 1200 height 800.

- [ ] **Step 4: Install and verify web build**

From repo root:
```bash
pnpm install
pnpm --filter @vscode-shell/ui build
pnpm --filter starter build
```

Expected: starter production build succeeds.

- [ ] **Step 5: Commit**

```bash
git add apps/starter package.json pnpm-lock.yaml
git commit -m "chore: scaffold Tauri React starter consuming workspace UI"
```

---

### Task 10: Wire starter demo Workbench (manual acceptance)

**Files:**
- Create: `apps/starter/src/pages/HomePage.tsx`, `ExplorerPage.tsx`, `SettingsPage.tsx`
- Modify: `apps/starter/src/main.tsx`, `apps/starter/src/App.tsx`
- Delete unused Vite boilerplate assets if present (`App.css` default logo usage, etc.)

**Interfaces:**
- Consumes: `Workbench`, `ActivityBar`, `Sidebar`, `PageTabs`, `StatusBar`, `setTheme`, `getTheme` from `@vscode-shell/ui`
- Produces: demo state machine described in spec Starter behavior table

- [ ] **Step 1: Entry imports styles + dark default**

`apps/starter/src/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@vscode-shell/ui/styles.css';
import { setTheme } from '@vscode-shell/ui';
import './index.css';
import App from './App';

setTheme('dark');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 2: Implement placeholder pages**

Each page: title, one sentence, a card using `var(--vscode-sidebar-bg)` / `var(--vscode-border)`.

Example `HomePage.tsx`:
```tsx
export function HomePage() {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 18 }}>Home</h1>
      <p style={{ margin: '0 0 16px', color: 'var(--vscode-text-secondary)' }}>
        Starter desktop shell powered by @vscode-shell/ui.
      </p>
      <div
        style={{
          padding: 16,
          borderRadius: 8,
          background: 'var(--vscode-sidebar-bg)',
          border: '1px solid var(--vscode-border)',
        }}
      >
        Open Explorer or Settings from the activity bar. Use tabs to switch pages.
      </div>
    </div>
  );
}
```

Mirror for `ExplorerPage` and `SettingsPage` with different copy.

- [ ] **Step 3: Implement `App.tsx` state wiring**

Requirements to encode in code:
- Modules: `home`, `explorer`, `settings` (settings `position: 'bottom'`)
- Sidebar maps per module; settings includes a group with `children`
- Tabs: always keep `{ id: 'home', title: 'Home', closable: false }`; opening a sidebar leaf adds/selects a tab; close removes tab and selects nearby/home
- StatusBar left: `Ready`; right: `v0.1.0`; `showThemeToggle`
- Theme handler: `setTheme(next); setThemeState(next);`

Sketch (implement fully — do not leave stubs):

```tsx
import { useMemo, useState } from 'react';
import {
  ActivityBar,
  PageTabs,
  Sidebar,
  StatusBar,
  Workbench,
  setTheme,
  type ActivityItem,
  type PageTab,
  type SidebarItem,
  type ThemeMode,
} from '@vscode-shell/ui';
import { HiHome, HiFolder, HiCog } from 'react-icons/hi';
import { HomePage } from './pages/HomePage';
import { ExplorerPage } from './pages/ExplorerPage';
import { SettingsPage } from './pages/SettingsPage';

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

  const openPage = (id: string) => {
    const meta = pageMeta[id];
    if (!meta) return;
    setSidebarId(id);
    setTabs((prev) =>
      prev.some((t) => t.id === id)
        ? prev
        : [...prev, { id, title: meta.title, closable: id !== 'home' }],
    );
    setActiveTabId(id);
  };

  const view = pageMeta[activeTabId]?.view ?? 'home';

  const editor = useMemo(() => {
    if (view === 'explorer') return <ExplorerPage title={pageMeta[activeTabId]?.title} />;
    if (view === 'settings') return <SettingsPage title={pageMeta[activeTabId]?.title} />;
    return <HomePage />;
  }, [view, activeTabId]);

  return (
    <Workbench
      activityBar={
        <ActivityBar
          items={activities}
          activeId={moduleId}
          onChange={(id) => {
            setModuleId(id);
            const first = sidebars[id].items[0];
            const leaf = first.children?.[0]?.id ?? first.id;
            openPage(leaf);
          }}
          logo={<span style={{ fontWeight: 700 }}>VS</span>}
          onLogoClick={() => {
            setModuleId('home');
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
          onSelect={setActiveTabId}
          onClose={(id) => {
            setTabs((prev) => {
              const next = prev.filter((t) => t.id !== id);
              if (activeTabId === id) {
                setActiveTabId(next[next.length - 1]?.id ?? 'home');
              }
              return next;
            });
          }}
        />
      }
      statusBar={
        <StatusBar
          left={<span>Ready</span>}
          right={<span>v0.1.0</span>}
          showThemeToggle
          theme={theme}
          onThemeChange={(next) => {
            setTheme(next);
            setThemeState(next);
          }}
        />
      }
    >
      {editor}
    </Workbench>
  );
}
```

Adjust `ExplorerPage` / `SettingsPage` to accept optional `title` prop.

- [ ] **Step 4: Manual verification**

Run: `pnpm --filter @vscode-shell/ui build && pnpm --filter starter tauri:dev`  
(or `pnpm --filter starter tauri dev` depending on script name)

Checklist:
1. Desktop window opens with ActivityBar + Sidebar + Tabs + StatusBar
2. Switching modules updates sidebar
3. Settings shows nested children
4. Opening leaves creates tabs; close works; Home not closable
5. Theme toggle switches Light+/Dark+ for chrome and pages

If Tauri fails due to missing Rust toolchain, install per https://v2.tauri.app/start/prerequisites/ and retry. Web-only fallback for UI check: `pnpm --filter starter dev` (shell still verifiable in browser).

- [ ] **Step 5: Commit**

```bash
git add apps/starter
git commit -m "feat(starter): wire Workbench demo with tabs and theme toggle"
```

---

### Task 11: README (acceptance criterion 3)

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: final package export paths
- Produces: docs for workspace usage + external path/git dependency

- [ ] **Step 1: Replace README content**

```markdown
# vscode-shell

Shared VS Code–style desktop chrome for Tauri + React apps.

## Packages

| Path | Name | Description |
|------|------|-------------|
| `packages/shell` | `@vscode-shell/ui` | Design tokens, theme helpers, Workbench chrome |
| `apps/starter` | `starter` | Tauri + React demo / template |

Design: [docs/superpowers/specs/2026-08-07-vscode-shell-design.md](docs/superpowers/specs/2026-08-07-vscode-shell-design.md)

## Develop

```bash
pnpm install
pnpm --filter @vscode-shell/ui test
pnpm --filter @vscode-shell/ui build
pnpm --filter starter tauri:dev
```

Import styles in the app entry:

```ts
import '@vscode-shell/ui/styles.css';
```

Without this import, components render but look unstyled.

## Use from another repo

**Path dependency** (local clone):

```json
{
  "dependencies": {
    "@vscode-shell/ui": "file:../vscode-shell/packages/shell"
  }
}
```

Build the UI package first (`pnpm --filter @vscode-shell/ui build`), or point your bundler at the package source if you configure it to compile TS from the dependency.

**Git dependency** (after the repo is on a remote):

```json
{
  "dependencies": {
    "@vscode-shell/ui": "git+https://github.com/<org>/vscode-shell.git#main&path:packages/shell"
  }
}
```

Exact git URL syntax depends on your package manager; pnpm `git+...` with `path:` is preferred.

## Optional Tailwind color bridge

Map app utility classes to the same CSS variables if desired (not required for chrome):

```css
/* Tailwind v4 @theme example */
@theme {
  --color-vscode-editor: var(--vscode-editor-bg);
  --color-vscode-sidebar: var(--vscode-sidebar-bg);
  --color-vscode-border: var(--vscode-border);
  --color-vscode-text-primary: var(--vscode-text-primary);
  --color-vscode-text-secondary: var(--vscode-text-secondary);
  --color-vscode-highlight: var(--vscode-text-highlight);
  --color-vscode-hover: var(--vscode-hover-bg);
}
```

## Library boundary

`@vscode-shell/ui` provides layout chrome only. Keep routes, Tauri events, and component-library theme overrides in the application.
```

- [ ] **Step 2: Final acceptance commands**

```bash
pnpm i
pnpm --filter @vscode-shell/ui build
pnpm --filter @vscode-shell/ui test
pnpm --filter starter tauri:dev
```

Expected: build/tests green; desktop demo matches Task 10 checklist.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document workspace usage and external consumption"
```

---

## Spec coverage self-review

| Spec requirement | Task |
|------------------|------|
| `@vscode-shell/ui` tokens + chrome + Workbench | 3–8 |
| `apps/starter` Tauri + React demo | 9–10 |
| Light+/Dark+ CSS variables | 2–3, 7, 10 |
| No business/Tauri/Ant in library | 4–8 boundaries |
| Path/git consumption docs | 11 |
| ActivityBar / Sidebar / PageTabs / StatusBar APIs | 4–7 |
| StatusBar theme toggle callback-only | 7 |
| `sidebar={null}` hides column | 8 |
| closable / onClose rules | 6 |
| Shell unit tests | 2, 4–8 |
| Acceptance build + tauri dev | 10–11 |
| peer react 18–19 | 1 `package.json` |
| Do not copy Ant CSS | 3 |

## Placeholder / consistency notes

- Package filter names: `@vscode-shell/ui`, `starter` — used consistently.
- `ThemeMode` exported from `theme.ts` and used in starter.
- `tauri:dev` vs `tauri dev`: Task 9 defines `tauri:dev` script; Task 10/11 use that script.
- Invalid `setTheme` input falls back to `dark` (Task 2), matching spec.
