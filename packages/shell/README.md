# @vscode-shell/ui

VS Code–style desktop chrome for React (Workbench, ActivityBar, Sidebar, PageTabs, StatusBar, TitleBar) plus `--vscode-*` design tokens and theme helpers.

## Install

```bash
pnpm add @vscode-shell/ui
# peers
pnpm add react react-dom
```

## Quick start

```tsx
import {
  Workbench,
  TitleBar,
  ActivityBar,
  Sidebar,
  PageTabs,
  StatusBar,
  setTheme,
} from '@vscode-shell/ui';
import '@vscode-shell/ui/styles.css';

setTheme('dark'); // or 'light' — toggles `.dark` on <html>

export function App() {
  return (
    <Workbench
      titleBar={<TitleBar center={<span>My App</span>} />}
      activityBar={<ActivityBar items={[]} activeId="" onChange={() => {}} />}
      sidebar={<Sidebar items={[]} activeId="" onChange={() => {}} />}
      tabs={<PageTabs tabs={[]} activeId="" onSelect={() => {}} />}
      statusBar={<StatusBar left={<span>Ready</span>} />}
    >
      <div>Editor</div>
    </Workbench>
  );
}
```

Optional bottom panel slot:

```tsx
<Workbench panel={<YourLogPanel />}>{/* editor */}</Workbench>
```

## Styles

Import once at the app entry:

```ts
import '@vscode-shell/ui/styles.css';
```

Tokens live as CSS variables (`--vscode-editor-bg`, `--vscode-text-primary`, …). Light defaults are on `:root`; dark overrides under `.dark`.

## Theme helpers

| API | Description |
|-----|-------------|
| `setTheme('light' \| 'dark')` | Toggle `document.documentElement.classList` `.dark` |
| `getTheme()` | Read current mode from the class list |

## Tauri note

Window drag regions and custom window controls stay in the **application** (see the [starter app](https://github.com/deskkit/vscode-shell/tree/main/apps/starter)). This package does not depend on `@tauri-apps/*`.

## Docs

- Repo: https://github.com/deskkit/vscode-shell
- Design: [vscode-shell design](https://github.com/deskkit/vscode-shell/blob/main/docs/superpowers/specs/2026-08-07-vscode-shell-design.md)

## License

MIT
