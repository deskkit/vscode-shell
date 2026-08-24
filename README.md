# vscode-shell

Shared VS Code–style desktop chrome for Tauri + React apps.

## Packages

| Path | Name | Description |
|------|------|-------------|
| `packages/shell` | `@vscode-shell/ui` | Design tokens, theme helpers, Workbench chrome |
| `packages/antd` | `@vscode-shell/antd` | Optional Ant Design `createAntTheme` + `--ant-*` CSS bridge |
| `packages/flowbite` | `@vscode-shell/flowbite` | Optional Flowbite `createFlowbiteTheme` |
| `apps/starter` | `starter` | Tauri + React demo / template |

Design: [docs/superpowers/specs/2026-08-07-vscode-shell-design.md](docs/superpowers/specs/2026-08-07-vscode-shell-design.md)
TitleBar: [docs/superpowers/specs/2026-08-07-titlebar-design.md](docs/superpowers/specs/2026-08-07-titlebar-design.md)
Publish & theme bridges: [docs/superpowers/specs/2026-08-12-publish-and-theme-bridges-design.md](docs/superpowers/specs/2026-08-12-publish-and-theme-bridges-design.md)
Tailwind primitives: [docs/superpowers/specs/2026-08-21-tailwind-primitives-design.md](docs/superpowers/specs/2026-08-21-tailwind-primitives-design.md)

## Develop

```bash
pnpm install
pnpm --filter @vscode-shell/ui test
pnpm --filter @vscode-shell/ui build
pnpm --filter starter tauri:dev
```

## Build

Always build the UI package before packaging the starter (or any consumer):

```bash
pnpm --filter @vscode-shell/ui build
```

### Starter — current platform

From the repo root:

```bash
pnpm --filter starter tauri build
```

Or from `apps/starter`:

```bash
pnpm tauri build
```

Artifacts land under `apps/starter/src-tauri/target/release/bundle/` (platform-specific installers).

### Starter — Windows (cross-compile from macOS / Linux)

Use [cargo-xwin](https://github.com/rust-cross/cargo-xwin) as the Tauri runner to target MSVC Windows without a Windows host:

```bash
# once per machine
cargo install cargo-xwin
rustup target add x86_64-pc-windows-msvc
```

From `apps/starter`:

```bash
pnpm tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc
```

From the repo root (pass args through the filter):

```bash
pnpm --filter starter tauri build -- --runner cargo-xwin --target x86_64-pc-windows-msvc
```

Windows bundles appear under `apps/starter/src-tauri/target/x86_64-pc-windows-msvc/release/bundle/`.

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

**Git dependency** (GitHub):

```json
{
  "dependencies": {
    "@vscode-shell/ui": "git+https://github.com/deskkit/vscode-shell.git#main&path:packages/shell"
  }
}
```

pnpm equivalent:

```json
{
  "dependencies": {
    "@vscode-shell/ui": "github:deskkit/vscode-shell#main&path:packages/shell"
  }
}
```

`packages/shell` runs `prepare` → `build` on install (via `tsup`), so you do **not** need a prebuilt `dist` on GitHub. Ensure install scripts are enabled (`ignore-scripts` must be off). The consumer still provides `react` / `react-dom` (peerDependencies).

Exact git URL syntax depends on your package manager; pnpm `github:…` / `git+…` with `path:` is preferred.

## Optional theme bridges

Install peers in the app (`antd`, `flowbite-react`) yourself.

```bash
pnpm add @vscode-shell/ui @vscode-shell/antd antd
# and/or
pnpm add @vscode-shell/ui @vscode-shell/flowbite flowbite-react
```

```tsx
import { createAntTheme } from '@vscode-shell/antd'
import { ConfigProvider } from 'antd'
import '@vscode-shell/ui/styles.css'
import '@vscode-shell/antd/styles.css'

<ConfigProvider theme={createAntTheme()}>{/* … */}</ConfigProvider>
```

```tsx
import { createFlowbiteTheme } from '@vscode-shell/flowbite'
import { ThemeProvider } from 'flowbite-react'

<ThemeProvider theme={createFlowbiteTheme()}>{/* … */}</ThemeProvider>
```

Do **not** expect ProTable / app layout CSS overrides from these packages — keep those in the application.

### os-kit migration sketch

1. Depend on `@vscode-shell/ui` / `antd` / `flowbite` (latest published; ui is currently `0.3.0`).
2. Replace local `antSettings.theme` with `createAntTheme()`.
3. Replace local `customTheme` with `createFlowbiteTheme()`.
4. Import `@vscode-shell/antd/styles.css`; keep structural CSS in the app.

## Publish (manual)

Prerequisites: npm login with rights to scope `@vscode-shell` (npmjs) **or** configure the private registry. Default registry in this environment may point at a Nexus group — publish with `--registry https://registry.npmjs.org`.

```bash
pnpm -r --filter "./packages/**" run build
pnpm -r --filter "./packages/**" run test

# from each package directory, or:
pnpm --filter @vscode-shell/ui publish --access public --registry https://registry.npmjs.org
pnpm --filter @vscode-shell/antd publish --access public --registry https://registry.npmjs.org
pnpm --filter @vscode-shell/flowbite publish --access public --registry https://registry.npmjs.org
```

Then tag (match the packages you actually published; ui-only releases use the ui version):

```bash
git tag v0.3.0
git push origin v0.3.0
```

Git fallback (before/without npm):

```json
{
  "@vscode-shell/ui": "github:deskkit/vscode-shell#v0.3.0&path:packages/shell",
  "@vscode-shell/antd": "github:deskkit/vscode-shell#v0.2.3&path:packages/antd",
  "@vscode-shell/flowbite": "github:deskkit/vscode-shell#v0.2.2&path:packages/flowbite"
}
```

## Optional Tailwind color bridge

Map app utility classes to the same CSS variables if desired (not required for chrome).

Tokens are hex / rgba, so plain `var(--vscode-*)` in Tailwind **breaks opacity modifiers** (`border-vscode-border/30` etc.): the utility is omitted and borders fall back to `currentColor` (looks white in dark mode). Bridge with `color-mix` + `<alpha-value>` (Tailwind v3) or RGB channel tokens:

```js
// Tailwind v3 — theme.extend.colors
const vscode = (cssVar) =>
  `color-mix(in srgb, var(${cssVar}) calc(100% * <alpha-value>), transparent)`;

{
  'vscode-editor': vscode('--vscode-editor-bg'),
  'vscode-sidebar': vscode('--vscode-sidebar-bg'),
  'vscode-border': vscode('--vscode-border'),
  'vscode-text-primary': vscode('--vscode-text-primary'),
  'vscode-text-secondary': vscode('--vscode-text-secondary'),
  'vscode-highlight': vscode('--vscode-text-highlight'),
  'vscode-text-link': vscode('--vscode-text-link'),
  'vscode-hover': vscode('--vscode-hover-bg'),
}
```

For Tailwind v4 `@theme`, prefer the same `color-mix(… <alpha-value> …)` pattern or space-separated RGB channel variables so `/α` utilities resolve.

## Library boundary

`@vscode-shell/ui` provides layout chrome only. Keep routes, Tauri events, and component-library theme overrides in the application.

## Custom TitleBar (Tauri)

`TitleBar` is optional UI chrome. Hiding the native title bar is **app configuration**.

### macOS overlay (starter)

Set on `app.windows[0]` in `src-tauri/tauri.conf.json`:

- `titleBarStyle`: `"Overlay"`
- `hiddenTitle`: `true`

Keeps system traffic lights. Default `--vscode-titlebar-traffic-width: 78px` reserves the left inset.

### Windows / Linux (starter)

`titleBarStyle: Overlay` does **not** replace the native title bar on Windows. Starter instead:

1. In Rust (`src-tauri/src/lib.rs`), on non-macOS: `window.set_decorations(false)`.
2. Sets `--vscode-titlebar-traffic-width: 0px` (no traffic-light inset).
3. Renders minimize / maximize / close in `TitleBar.right` via `@tauri-apps/api` (`apps/starter/src/components/WindowControls.tsx`).

### Wire the slot

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
- On Windows / Linux also: `core:window:allow-minimize`, `allow-toggle-maximize`, `allow-close`

- Root / left / center: `data-tauri-drag-region` (window drag). Center children use `pointer-events: none` so title text does not steal the drag hit-target.
- `right`: already `vsc-titlebar__no-drag` + `data-tauri-drag-region="false"`.
- Interactive nodes in `center`: add class `vsc-titlebar__no-drag` and set `pointer-events: auto` if needed.

Importing `TitleBar` alone does **not** remove the system title bar.

## License

[MIT](./LICENSE) © deskkit
