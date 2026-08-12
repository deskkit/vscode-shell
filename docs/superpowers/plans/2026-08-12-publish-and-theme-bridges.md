# Publish + Theme Bridges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship synchronized `0.2.0` packages — `@vscode-shell/ui` (publish-ready metadata) plus optional `@vscode-shell/antd` and `@vscode-shell/flowbite` theme bridges extracted from os-kit — with CHANGELOG, README, and manual publish docs.

**Architecture:** Keep chrome in `@vscode-shell/ui`. New sibling packages under `packages/*` depend on `ui` and peer on `antd` / `flowbite-react`. Bridges expose factory functions (`createAntTheme`, `createFlowbiteTheme`) plus Ant CSS variable mapping only — no structural app CSS. Version all three at `0.2.0`. Actual `npm publish` stays manual after auth is available.

**Tech Stack:** TypeScript, tsup, Vitest, pnpm workspaces, `antd` + `flowbite-react` as peer/devDependencies in bridge packages only.

## Global Constraints

- Working directory: `/Users/melon/Projects/melon/vscode-shell`
- Spec: `docs/superpowers/specs/2026-08-12-publish-and-theme-bridges-design.md`
- Synchronized version `0.2.0` on `@vscode-shell/ui`, `@vscode-shell/antd`, `@vscode-shell/flowbite`
- `@vscode-shell/ui` must remain free of `antd` / `flowbite-react`
- Bridge scope: token / ThemeConfig / createTheme only — do **not** copy os-kit structural `.ant-*` / ProTable / Tabs / Segmented CSS
- Source of truth for defaults: `/Users/melon/Projects/gentech/cloud-group/os-kit/src/config/settings.ts` and Ant var block in `os-kit/src/index.css` lines ~89–132
- `pnpm-workspace.yaml` already includes `packages/*`
- Prefer `./node_modules/.bin/vitest` / `tsup` if pnpm registry signature checks fail
- Do not run `npm publish` in CI; document commands only
- Do not migrate os-kit/cb-monitor in this repo’s commits (document recipe; consumer PRs are out-of-band)

---

## File Structure

```
packages/shell/
├── package.json                 # version 0.2.0 + repository/homepage fields
└── (no API changes required)

packages/antd/
├── package.json                 # @vscode-shell/antd@0.2.0
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── scripts/copy-styles.mjs
└── src/
    ├── index.ts
    ├── createAntTheme.ts
    ├── createAntTheme.test.ts
    ├── mergeThemeConfig.ts
    └── styles.css

packages/flowbite/
├── package.json                 # @vscode-shell/flowbite@0.2.0
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── src/
    ├── index.ts
    ├── createFlowbiteTheme.ts
    └── createFlowbiteTheme.test.ts

CHANGELOG.md                     # new
README.md                        # packages table, bridges, publish, git fallback
package.json                     # root test script covers all packages
docs/superpowers/specs/2026-08-12-publish-and-theme-bridges-design.md  # already written
```

---

### Task 1: Bump `@vscode-shell/ui` to 0.2.0 + publish metadata

**Files:**
- Modify: `packages/shell/package.json`
- Create: `CHANGELOG.md` (initial stub with Unreleased + 0.2.0 section started; finalize in Task 4)

**Interfaces:**
- Consumes: existing `@vscode-shell/ui` package shape
- Produces: `version: "0.2.0"`; `repository` / `homepage` / `publishConfig` fields for npm

- [ ] **Step 1: Update `packages/shell/package.json`**

Set:

```json
{
  "name": "@vscode-shell/ui",
  "version": "0.2.0",
  "license": "MIT",
  "description": "VS Code–style desktop chrome for React (Workbench, tokens, theme helpers)",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/deskkit/vscode-shell.git",
    "directory": "packages/shell"
  },
  "homepage": "https://github.com/deskkit/vscode-shell#readme",
  "bugs": {
    "url": "https://github.com/deskkit/vscode-shell/issues"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

Keep existing `exports`, `files`, `scripts`, `peerDependencies`, and `devDependencies` unchanged.

- [ ] **Step 2: Create root `CHANGELOG.md` stub**

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-08-12

### Added

- `@vscode-shell/antd` — optional Ant Design theme bridge (`createAntTheme`, `--ant-*` CSS vars)
- `@vscode-shell/flowbite` — optional Flowbite theme bridge (`createFlowbiteTheme`)

### Changed

- `@vscode-shell/ui` version aligned to `0.2.0` for synchronized releases (no chrome API break)

[Unreleased]: https://github.com/deskkit/vscode-shell/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/deskkit/vscode-shell/releases/tag/v0.2.0
```

(Adjust the date to the actual release day when publishing.)

- [ ] **Step 3: Verify ui still builds and tests**

Run:

```bash
pnpm --filter @vscode-shell/ui test
pnpm --filter @vscode-shell/ui build
```

Expected: all tests PASS; `dist/` produced.

- [ ] **Step 4: Commit**

```bash
git add packages/shell/package.json CHANGELOG.md
git commit -m "$(cat <<'EOF'
chore(ui): bump to 0.2.0 and add publish metadata

EOF
)"
```

---

### Task 2: Scaffold `@vscode-shell/antd` with TDD

**Files:**
- Create: `packages/antd/package.json`
- Create: `packages/antd/tsconfig.json`
- Create: `packages/antd/tsup.config.ts`
- Create: `packages/antd/vitest.config.ts`
- Create: `packages/antd/scripts/copy-styles.mjs`
- Create: `packages/antd/src/mergeThemeConfig.ts`
- Create: `packages/antd/src/createAntTheme.ts`
- Create: `packages/antd/src/createAntTheme.test.ts`
- Create: `packages/antd/src/styles.css`
- Create: `packages/antd/src/index.ts`

**Interfaces:**
- Consumes: `@vscode-shell/ui` workspace package; peer `antd` `ThemeConfig`
- Produces:
  - `createAntTheme(options?: { overrides?: ThemeConfig }): ThemeConfig`
  - merge: shallow root + shallow `token` + shallow each `components.*`
  - export path `@vscode-shell/antd/styles.css`

- [ ] **Step 1: Write package tooling files**

`packages/antd/package.json`:

```json
{
  "name": "@vscode-shell/antd",
  "version": "0.2.0",
  "license": "MIT",
  "description": "Ant Design theme bridge for @vscode-shell/ui tokens",
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
    "build": "tsup && node ./scripts/copy-styles.mjs",
    "prepare": "npm run build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/deskkit/vscode-shell.git",
    "directory": "packages/antd"
  },
  "homepage": "https://github.com/deskkit/vscode-shell#readme",
  "bugs": {
    "url": "https://github.com/deskkit/vscode-shell/issues"
  },
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {
    "@vscode-shell/ui": "workspace:^"
  },
  "peerDependencies": {
    "antd": ">=5 <7",
    "react": ">=18 <20",
    "react-dom": ">=18 <20"
  },
  "devDependencies": {
    "antd": "^5.24.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "tsup": "^8.3.5",
    "typescript": "~5.7.3",
    "vitest": "^3.0.5"
  }
}
```

`packages/antd/tsconfig.json` — copy from `packages/shell/tsconfig.json`.

`packages/antd/tsup.config.ts`:

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react/jsx-runtime', 'antd', '@vscode-shell/ui'],
});
```

`packages/antd/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});
```

`packages/antd/scripts/copy-styles.mjs` — same as `packages/shell/scripts/copy-styles.mjs`.

- [ ] **Step 2: Write failing tests**

`packages/antd/src/createAntTheme.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createAntTheme } from './createAntTheme';

describe('createAntTheme', () => {
  it('returns cssVar ant key and vscode-mapped colorText', () => {
    const theme = createAntTheme();
    expect(theme.cssVar).toEqual({ key: 'ant' });
    expect(theme.token?.colorText).toBe('var(--vscode-text-primary)');
    expect(theme.token?.colorPrimary).toBe('#007acc');
    expect(theme.components?.Table?.headerBg).toBe('var(--vscode-table-header-bg)');
  });

  it('shallow-merges token and component overrides', () => {
    const theme = createAntTheme({
      overrides: {
        token: { colorPrimary: '#ff0000' },
        components: {
          Table: { cellPaddingBlock: 16 },
        },
      },
    });
    expect(theme.token?.colorPrimary).toBe('#ff0000');
    expect(theme.token?.colorText).toBe('var(--vscode-text-primary)');
    expect(theme.components?.Table?.cellPaddingBlock).toBe(16);
    expect(theme.components?.Table?.headerBg).toBe('var(--vscode-table-header-bg)');
    expect(theme.components?.Modal?.contentBg).toBe('var(--vscode-modal-bg)');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
pnpm install
pnpm --filter @vscode-shell/antd test
```

Expected: FAIL (module / function missing) or package not found until files exist — after scaffolding empty `index`, expect fail on missing `createAntTheme`.

- [ ] **Step 4: Implement merge helper + theme factory**

`packages/antd/src/mergeThemeConfig.ts`:

```ts
import type { ThemeConfig } from 'antd';

export function mergeThemeConfig(
  base: ThemeConfig,
  overrides?: ThemeConfig,
): ThemeConfig {
  if (!overrides) return base;

  const components: ThemeConfig['components'] = { ...base.components };
  if (overrides.components) {
    for (const [name, value] of Object.entries(overrides.components)) {
      const key = name as keyof NonNullable<ThemeConfig['components']>;
      components![key] = {
        ...(base.components?.[key] as object | undefined),
        ...(value as object),
      } as never;
    }
  }

  return {
    ...base,
    ...overrides,
    cssVar: overrides.cssVar ?? base.cssVar,
    token: { ...base.token, ...overrides.token },
    components,
  };
}
```

`packages/antd/src/createAntTheme.ts` — paste defaults from os-kit `antSettings.theme` (full object from design/spec source), then:

```ts
import type { ThemeConfig } from 'antd';
import { mergeThemeConfig } from './mergeThemeConfig';

export type CreateAntThemeOptions = {
  overrides?: ThemeConfig;
};

const defaultTheme: ThemeConfig = {
  cssVar: { key: 'ant' },
  token: {
    colorPrimary: '#007acc',
    colorError: '#f87171',
    colorSuccess: '#4ade80',
    colorWarning: '#eab308',
    colorInfo: '#007acc',
    colorText: 'var(--vscode-text-primary)',
    colorTextSecondary: 'var(--vscode-text-secondary)',
    colorTextTertiary: 'var(--vscode-text-secondary)',
    colorTextQuaternary: 'var(--vscode-text-secondary)',
    colorBgContainer: 'var(--vscode-editor-bg)',
    colorBgLayout: 'var(--vscode-editor-bg)',
    colorBgElevated: 'var(--vscode-sidebar-bg)',
    colorBorder: 'var(--vscode-border)',
    colorBorderSecondary: 'var(--vscode-border)',
    colorFill: 'var(--vscode-hover-bg)',
    colorFillSecondary: 'var(--vscode-sidebar-bg)',
    colorFillTertiary: 'var(--vscode-sidebar-bg)',
    colorLink: 'var(--vscode-statusbar-bg)',
    borderRadius: 4,
    controlHeight: 30,
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontWeightStrong: 600,
  },
  components: {
    Menu: {
      itemBg: 'transparent',
      collapsedWidth: 60,
      iconSize: 20,
      collapsedIconSize: 20,
      activeBarBorderWidth: 0,
    },
    Table: {
      headerBorderRadius: 0,
      headerBg: 'var(--vscode-table-header-bg)',
      headerColor: 'var(--vscode-text-secondary)',
      rowHoverBg: 'var(--vscode-table-row-hover)',
      borderColor: 'var(--vscode-table-border)',
      colorBgContainer: 'var(--vscode-editor-bg)',
      colorText: 'var(--vscode-text-primary)',
      cellPaddingBlock: 8,
      cellPaddingInline: 12,
    },
    Modal: {
      contentBg: 'var(--vscode-modal-bg)',
      headerBg: 'var(--vscode-modal-bg)',
      titleColor: 'var(--vscode-modal-title)',
    },
    Input: {
      activeBorderColor: '#007acc',
      hoverBorderColor: '#007acc',
      colorBgContainer: 'var(--vscode-input-bg)',
      colorText: 'var(--vscode-text-primary)',
      colorBorder: 'var(--vscode-input-border)',
    },
    Select: {
      colorBgContainer: 'var(--vscode-input-bg)',
      colorText: 'var(--vscode-text-primary)',
      optionSelectedBg: 'var(--vscode-selected-bg)',
      colorBorder: 'var(--vscode-input-border)',
      activeBorderColor: '#007acc',
      hoverBorderColor: '#007acc',
      multipleItemBg: 'var(--vscode-selected-bg)',
      multipleItemBorderColor: 'var(--vscode-input-border)',
      activeOutlineColor: 'transparent',
      selectorBg: 'var(--vscode-input-bg)',
      optionActiveBg: 'var(--vscode-hover-bg)',
    },
    Button: {
      colorLink: '#007acc',
      colorLinkHover: '#4db8ff',
      colorLinkActive: '#005fa3',
    },
    Card: {},
    Tabs: {
      horizontalItemPadding: '6px 0',
      colorBgContainer: 'var(--vscode-editor-bg)',
      colorText: 'var(--vscode-text-primary)',
    },
  },
};

export function createAntTheme(
  options?: CreateAntThemeOptions,
): ThemeConfig {
  return mergeThemeConfig(defaultTheme, options?.overrides);
}
```

`packages/antd/src/styles.css` — copy only the `:root` / `.dark` `--ant-color-*` block from os-kit (lines 89–132), **without** structural overrides.

`packages/antd/src/index.ts`:

```ts
export { createAntTheme } from './createAntTheme';
export type { CreateAntThemeOptions } from './createAntTheme';
```

- [ ] **Step 5: Run tests and build**

```bash
pnpm install
pnpm --filter @vscode-shell/antd test
pnpm --filter @vscode-shell/antd build
```

Expected: PASS; `dist/index.js`, `dist/index.d.ts`, `dist/styles.css` exist.

- [ ] **Step 6: Commit**

```bash
git add packages/antd
git commit -m "$(cat <<'EOF'
feat(antd): add createAntTheme bridge package

EOF
)"
```

---

### Task 3: Scaffold `@vscode-shell/flowbite` with TDD

**Files:**
- Create: `packages/flowbite/package.json`
- Create: `packages/flowbite/tsconfig.json`
- Create: `packages/flowbite/tsup.config.ts`
- Create: `packages/flowbite/vitest.config.ts`
- Create: `packages/flowbite/src/createFlowbiteTheme.ts`
- Create: `packages/flowbite/src/createFlowbiteTheme.test.ts`
- Create: `packages/flowbite/src/index.ts`

**Interfaces:**
- Consumes: `flowbite-react` `createTheme`; `@vscode-shell/ui` workspace dep
- Produces: `createFlowbiteTheme(options?: { overrides?: Record<string, unknown> })` — shallow-merge top-level keys onto default input, then `createTheme(...)`

- [ ] **Step 1: Write package tooling**

`packages/flowbite/package.json`:

```json
{
  "name": "@vscode-shell/flowbite",
  "version": "0.2.0",
  "license": "MIT",
  "description": "Flowbite theme bridge for @vscode-shell/ui tokens",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "prepare": "npm run build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/deskkit/vscode-shell.git",
    "directory": "packages/flowbite"
  },
  "homepage": "https://github.com/deskkit/vscode-shell#readme",
  "bugs": {
    "url": "https://github.com/deskkit/vscode-shell/issues"
  },
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {
    "@vscode-shell/ui": "workspace:^"
  },
  "peerDependencies": {
    "flowbite-react": ">=0.10.0",
    "react": ">=18 <20",
    "react-dom": ">=18 <20"
  },
  "devDependencies": {
    "flowbite-react": "^0.12.9",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "tsup": "^8.3.5",
    "typescript": "~5.7.3",
    "vitest": "^3.0.5"
  }
}
```

`tsconfig.json` — copy from shell.  
`tsup.config.ts` — same as antd but `external` includes `flowbite-react` instead of `antd`.  
`vitest.config.ts` — `environment: 'node'`.

- [ ] **Step 2: Write failing test**

`packages/flowbite/src/createFlowbiteTheme.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createFlowbiteTheme } from './createFlowbiteTheme';

describe('createFlowbiteTheme', () => {
  it('returns theme with table and sidebar sections', () => {
    const theme = createFlowbiteTheme();
    expect(theme).toBeTypeOf('object');
    expect(theme).toHaveProperty('table');
    expect(theme).toHaveProperty('sidebar');
    expect(theme).toHaveProperty('modal');
  });

  it('replaces a top-level section when overridden', () => {
    const theme = createFlowbiteTheme({
      overrides: {
        card: { root: { base: 'rounded-none' } },
      },
    });
    expect(theme).toHaveProperty('card');
    // default fileInput section still present
    expect(theme).toHaveProperty('fileInput');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
pnpm install
pnpm --filter @vscode-shell/flowbite test
```

Expected: FAIL until implementation exists.

- [ ] **Step 4: Implement factory**

`packages/flowbite/src/createFlowbiteTheme.ts`:

```ts
import { createTheme } from 'flowbite-react';

export type CreateFlowbiteThemeOptions = {
  overrides?: Record<string, unknown>;
};

const defaultInput = {
  fileInput: {
    base: 'file:bg-[#007acc] hover:file:bg-[#005fa3]',
  },
  card: {
    root: { base: 'shadow-sm rounded-lg' },
  },
  table: {
    root: { base: 'rounded-none' },
    body: {
      cell: {
        base: 'group-first/body:group-first/row:first:rounded-none group-first/body:group-last/row:first:rounded-none',
      },
    },
    head: {
      base: 'group/head text-[10px] uppercase tracking-wide text-[var(--vscode-text-secondary)]',
      cell: {
        base: 'bg-[var(--vscode-table-header-bg)] px-3 py-2',
      },
    },
    row: {
      hovered: 'hover:bg-[var(--vscode-table-row-hover)]',
    },
  },
  sidebar: {
    item: {
      base: 'text-[var(--vscode-text-primary)] hover:bg-[var(--vscode-hover-bg)]',
      active:
        'bg-[var(--vscode-selected-bg)] text-[var(--vscode-text-highlight)]',
    },
    logo: { base: 'pl-2' },
  },
  floatingLabel: {
    input: {
      default: {
        outlined: {
          md: 'rounded px-3 py-2 text-sm bg-[var(--vscode-input-bg)] border-[var(--vscode-input-border)] focus:border-[#007acc] focus:ring-0',
        },
      },
      success: {
        outlined: {
          md: 'rounded px-3 py-2 text-sm bg-[var(--vscode-input-bg)] border-[var(--vscode-success)] focus:ring-0',
        },
      },
      error: {
        outlined: {
          md: 'rounded px-3 py-2 text-sm bg-[var(--vscode-input-bg)] border-[var(--vscode-error)] focus:ring-0',
        },
      },
    },
  },
  modal: {
    header: { base: 'border-[var(--vscode-border)] p-4' },
    body: { base: 'p-4' },
    footer: { base: 'p-4' },
  },
} as const;

export function createFlowbiteTheme(options?: CreateFlowbiteThemeOptions) {
  const input = {
    ...defaultInput,
    ...options?.overrides,
  };
  return createTheme(input as Parameters<typeof createTheme>[0]);
}
```

`packages/flowbite/src/index.ts`:

```ts
export { createFlowbiteTheme } from './createFlowbiteTheme';
export type { CreateFlowbiteThemeOptions } from './createFlowbiteTheme';
```

- [ ] **Step 5: Run tests and build**

```bash
pnpm install
pnpm --filter @vscode-shell/flowbite test
pnpm --filter @vscode-shell/flowbite build
```

Expected: PASS; `dist/` exists. If `createTheme` typing rejects `as const` input, widen with a typed object matching os-kit (drop `as const` or cast).

- [ ] **Step 6: Commit**

```bash
git add packages/flowbite
git commit -m "$(cat <<'EOF'
feat(flowbite): add createFlowbiteTheme bridge package

EOF
)"
```

---

### Task 4: Root scripts, README, and publish docs

**Files:**
- Modify: `package.json` (root)
- Modify: `README.md`
- Modify: `CHANGELOG.md` if date/details need tweak

**Interfaces:**
- Consumes: packages from Tasks 1–3
- Produces: docs for install / peers / migration sketch / publish / git fallback; `pnpm test` runs all package tests

- [ ] **Step 1: Update root `package.json` scripts**

```json
{
  "scripts": {
    "build": "pnpm -r run build",
    "test": "pnpm -r --filter \"./packages/**\" run test"
  }
}
```

- [ ] **Step 2: Expand README packages table and sections**

Update the Packages table:

| Path | Name | Description |
|------|------|-------------|
| `packages/shell` | `@vscode-shell/ui` | Design tokens, theme helpers, Workbench chrome |
| `packages/antd` | `@vscode-shell/antd` | Optional Ant Design `createAntTheme` + `--ant-*` CSS bridge |
| `packages/flowbite` | `@vscode-shell/flowbite` | Optional Flowbite `createFlowbiteTheme` |
| `apps/starter` | `starter` | Tauri + React demo / template |

Add section **Optional theme bridges** after “Use from another repo”:

````markdown
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

1. Depend on `@vscode-shell/ui` / `antd` / `flowbite` at `0.2.0`.
2. Replace local `antSettings.theme` with `createAntTheme()`.
3. Replace local `customTheme` with `createFlowbiteTheme()`.
4. Import `@vscode-shell/antd/styles.css`; keep structural CSS in the app.
````

Add section **Publish (manual)**:

````markdown
## Publish (manual)

Prerequisites: npm login with rights to scope `@vscode-shell` (npmjs) **or** configure the private registry.

```bash
pnpm -r --filter "./packages/**" run build
pnpm -r --filter "./packages/**" run test

# from each package directory, or:
pnpm --filter @vscode-shell/ui publish --access public
pnpm --filter @vscode-shell/antd publish --access public
pnpm --filter @vscode-shell/flowbite publish --access public
```

Then tag:

```bash
git tag v0.2.0
git push origin v0.2.0
```

Git fallback (before/without npm):

```json
{
  "@vscode-shell/ui": "github:deskkit/vscode-shell#v0.2.0&path:packages/shell",
  "@vscode-shell/antd": "github:deskkit/vscode-shell#v0.2.0&path:packages/antd",
  "@vscode-shell/flowbite": "github:deskkit/vscode-shell#v0.2.0&path:packages/flowbite"
}
```
````

Link the new design spec near the existing design links.

- [ ] **Step 3: Run full monorepo verify**

```bash
pnpm install
pnpm -r --filter "./packages/**" run test
pnpm -r --filter "./packages/**" run build
```

Expected: all three packages build; all tests PASS. starter still builds against workspace `ui` (`pnpm --filter starter build` frontend tsc/vite if available — or `pnpm --filter @vscode-shell/ui build` is enough if starter needs tauri).

- [ ] **Step 4: Commit**

```bash
git add package.json README.md CHANGELOG.md
git commit -m "$(cat <<'EOF'
docs: document theme bridges and manual publish flow

EOF
)"
```

---

### Task 5: Acceptance checklist (no more code unless gaps)

**Files:** none required if Tasks 1–4 pass

**Interfaces:**
- Consumes: built packages + README
- Produces: confirmed acceptance against the spec

- [ ] **Step 1: Spec acceptance walkthrough**

Confirm:

1. `pnpm -r --filter "./packages/**" run build` and tests succeed for `ui`, `antd`, `flowbite`.
2. starter still depends only on `@vscode-shell/ui` (check `apps/starter/package.json`).
3. README documents three packages, peers, migration sketch, publish, git fallback.
4. CHANGELOG has `0.2.0` entry; package versions are `0.2.0`.
5. No structural os-kit CSS was copied into `packages/antd/src/styles.css` (spot-check: no `.ant-table-thead`, no `.ant-pro-table`).

- [ ] **Step 2: Optional local consumer smoke (out-of-band)**

If convenient, point os-kit temporarily at:

```json
"@vscode-shell/ui": "file:../../../melon/vscode-shell/packages/shell",
"@vscode-shell/antd": "file:../../../melon/vscode-shell/packages/antd",
"@vscode-shell/flowbite": "file:../../../melon/vscode-shell/packages/flowbite"
```

Wire `createAntTheme` / `createFlowbiteTheme` and visually check Table / Modal / Input / Select light+dark. **Do not commit os-kit changes in this repo.**

- [ ] **Step 3: Stop before publish unless user asks**

Do **not** `npm publish` or `git tag` unless the user explicitly requests it after auth/org is ready.

---

## Plan self-review

| Spec item | Task |
|-----------|------|
| ui → 0.2.0 + metadata | Task 1 |
| `@vscode-shell/antd` + styles + merge rules | Task 2 |
| `@vscode-shell/flowbite` | Task 3 |
| CHANGELOG / README / publish docs / git fallback | Task 1 stub + Task 4 |
| Keep structural CSS out | Task 2 styles + Task 5 check |
| Synchronized 0.2.0 | Tasks 1–3 package.json |
| Manual publish only | Task 4 + Task 5 Step 3 |
| starter/cb-monitor ui-only | Task 5 (no bridge deps added here) |
