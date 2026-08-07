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
