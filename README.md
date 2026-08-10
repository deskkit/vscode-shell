# vscode-shell

Shared VS Code–style desktop chrome for Tauri + React apps.

## Packages

| Path | Name | Description |
|------|------|-------------|
| `packages/shell` | `@vscode-shell/ui` | Design tokens, theme helpers, Workbench chrome |
| `apps/starter` | `starter` | Tauri + React demo / template |

Design: [docs/superpowers/specs/2026-08-07-vscode-shell-design.md](docs/superpowers/specs/2026-08-07-vscode-shell-design.md)
TitleBar: [docs/superpowers/specs/2026-08-07-titlebar-design.md](docs/superpowers/specs/2026-08-07-titlebar-design.md)

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

## Custom TitleBar (Tauri)

`TitleBar` is optional UI chrome. Hiding the native title bar is **app configuration**.

### macOS overlay (starter)

Set on `app.windows[0]` in `src-tauri/tauri.conf.json`:

- `titleBarStyle`: `"Overlay"`
- `hiddenTitle`: `true`

Wire the slot:

```tsx
<Workbench
  titleBar={
    <TitleBar center={<span>My App</span>} right={<button type="button">…</button>} />
  }
>
  …
</Workbench>
```

### Drag / no-drag

Grant in `src-tauri/capabilities/default.json` (required for Tauri 2):

- `core:window:allow-start-dragging`

- Root / left / center: `data-tauri-drag-region` (window drag). Center children use `pointer-events: none` so title text does not steal the drag hit-target.
- `right`: already `vsc-titlebar__no-drag` + `data-tauri-drag-region="false"`.
- Interactive nodes in `center`: add class `vsc-titlebar__no-drag` and set `pointer-events: auto` if needed.

### Traffic lights inset

Default `--vscode-titlebar-traffic-width: 78px`. Without overlay, set to `0px` on `:root`.

Importing `TitleBar` alone does **not** remove the system title bar.
