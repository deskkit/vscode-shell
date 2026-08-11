# Sidebar Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a TitleBar left slot and Workbench sidebar collapse so the starter can toggle Sidebar visibility from the TitleBar left (after macOS traffic lights / Windows far left) with a max-width CSS transition.

**Architecture:** Library stays slot/CSS only: `TitleBar.left` hosts app controls after the traffic inset; `Workbench.sidebarCollapsed` toggles `.vsc-workbench__sidebar.is-collapsed` (`max-width: 0`, DOM kept). Starter owns `sidebarVisible` state and the panel-icon button. No platform detection in `@vscode-shell/ui`.

**Tech Stack:** React, TypeScript, Vitest + Testing Library, existing tsup CSS copy flow, `react-icons` (`VscLayoutSidebarLeft`), pnpm workspaces.

## Global Constraints

- Working directory for all commands: `/Users/melon/Projects/melon/vscode-shell`
- `@vscode-shell/ui` must not depend on `@tauri-apps/*` or call Tauri APIs
- Chrome remains controlled via props/slots; no business logic in the library
- Token / class prefix: `--vscode-*` and `.vsc-*`
- ActivityBar / tabs must not change sidebar visibility
- Collapse keeps Sidebar mounted (width/max-width animation, not `sidebar={null}`)
- After CSS or component changes: `pnpm --filter @vscode-shell/ui build` (copies `src/styles.css` → `dist/styles.css`)
- Prefer `./node_modules/.bin/vitest` / `tsup` if `pnpm` registry signature checks fail
- Spec: `docs/superpowers/specs/2026-08-11-sidebar-toggle-design.md`

---

## File Structure

```
packages/shell/
├── src/
│   ├── types.ts                         # TitleBarProps.left?; WorkbenchProps.sidebarCollapsed?
│   ├── styles.css                       # titlebar left flex; sidebar max-width collapse
│   └── components/
│       ├── TitleBar.tsx                 # render left slot (no-drag)
│       ├── TitleBar.test.tsx            # left slot + no-drag
│       ├── Workbench.tsx                # sidebarCollapsed → is-collapsed
│       └── Workbench.test.tsx           # collapse / null still hides
apps/starter/
└── src/App.tsx                          # sidebarVisible + TitleBar.left toggle
```

No new files. No README change required for v1 (behavior is starter demo + library API).

---

### Task 1: TitleBar `left` slot (TDD) + left-zone CSS

**Files:**
- Modify: `packages/shell/src/types.ts`
- Modify: `packages/shell/src/components/TitleBar.test.tsx`
- Modify: `packages/shell/src/components/TitleBar.tsx`
- Modify: `packages/shell/src/styles.css`

**Interfaces:**
- Consumes: existing `TitleBar` / `TitleBarProps`
- Produces:

```ts
type TitleBarProps = {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
  className?: string
}
```

DOM contract:
- `.vsc-titlebar__left` remains present
- When `left` is set: render controls inside `.vsc-titlebar__left` in a child with classes `vsc-titlebar__left-actions vsc-titlebar__no-drag` and `data-tauri-drag-region="false"`
- Traffic inset via `padding-left: var(--vscode-titlebar-traffic-width)` on `.vsc-titlebar__left` (width becomes `auto` / content-sized, not fixed empty box only)

- [ ] **Step 1: Extend `TitleBarProps`**

In `packages/shell/src/types.ts`, change `TitleBarProps` to:

```ts
export type TitleBarProps = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
};
```

- [ ] **Step 2: Write failing TitleBar tests for `left`**

Append to `packages/shell/src/components/TitleBar.test.tsx`:

```tsx
  it('renders left slot', () => {
    render(<TitleBar left={<button type="button">Toggle</button>} />);
    expect(screen.getByRole('button', { name: 'Toggle' })).toBeInTheDocument();
  });

  it('marks left actions as no-drag', () => {
    const { container } = render(
      <TitleBar left={<button type="button">Toggle</button>} />,
    );
    const actions = container.querySelector('.vsc-titlebar__left-actions');
    expect(actions).toHaveClass('vsc-titlebar__no-drag');
    expect(actions).toHaveAttribute('data-tauri-drag-region', 'false');
  });
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
pnpm --filter @vscode-shell/ui test -- src/components/TitleBar.test.tsx
```

Expected: FAIL — `left` not accepted / `.vsc-titlebar__left-actions` missing.

- [ ] **Step 4: Implement TitleBar `left` + CSS**

Update `packages/shell/src/components/TitleBar.tsx`:

```tsx
import type { FC } from 'react';
import type { TitleBarProps } from '../types';

export const TitleBar: FC<TitleBarProps> = ({ left, center, right, className }) => {
  const rootClass = className ? `vsc-titlebar ${className}` : 'vsc-titlebar';

  return (
    <header className={rootClass} data-tauri-drag-region>
      <div className="vsc-titlebar__left" data-tauri-drag-region>
        {left != null ? (
          <div
            className="vsc-titlebar__left-actions vsc-titlebar__no-drag"
            data-tauri-drag-region="false"
          >
            {left}
          </div>
        ) : null}
      </div>
      <div className="vsc-titlebar__center" data-tauri-drag-region>
        {center}
      </div>
      <div
        className="vsc-titlebar__right vsc-titlebar__no-drag"
        data-tauri-drag-region="false"
      >
        {right}
      </div>
    </header>
  );
};
```

Replace `.vsc-titlebar__left` rules in `packages/shell/src/styles.css` and add actions styles:

```css
.vsc-titlebar__left {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
  height: 100%;
  padding-left: var(--vscode-titlebar-traffic-width);
  box-sizing: border-box;
}

.vsc-titlebar__left-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 100%;
  padding-left: 4px;
  padding-right: 4px;
}
```

Remove the previous `width: var(--vscode-titlebar-traffic-width)` on `.vsc-titlebar__left` so Mac inset is padding and the toggle sits immediately after traffic lights; Windows (`traffic-width: 0`) keeps the toggle at the far left.

- [ ] **Step 5: Run TitleBar tests — expect PASS**

Run:

```bash
pnpm --filter @vscode-shell/ui test -- src/components/TitleBar.test.tsx
```

Expected: PASS (all TitleBar tests).

- [ ] **Step 6: Commit**

```bash
git add packages/shell/src/types.ts packages/shell/src/components/TitleBar.tsx packages/shell/src/components/TitleBar.test.tsx packages/shell/src/styles.css
git commit -m "$(cat <<'EOF'
feat(shell): add TitleBar left slot after traffic inset

EOF
)"
```

---

### Task 2: Workbench `sidebarCollapsed` (TDD) + collapse CSS

**Files:**
- Modify: `packages/shell/src/types.ts`
- Modify: `packages/shell/src/components/Workbench.test.tsx`
- Modify: `packages/shell/src/components/Workbench.tsx`
- Modify: `packages/shell/src/styles.css`

**Interfaces:**
- Consumes: existing `Workbench` / `WorkbenchProps`
- Produces:

```ts
type WorkbenchProps = {
  titleBar?: ReactNode
  activityBar: ReactNode
  sidebar?: ReactNode | null
  sidebarCollapsed?: boolean
  tabs?: ReactNode
  panel?: ReactNode | null
  statusBar?: ReactNode
  children: ReactNode
}
```

DOM contract:
- When `sidebar != null` and `sidebarCollapsed === true`: `.vsc-workbench__sidebar` has class `is-collapsed`
- When `sidebar != null` and collapsed is false/omitted: no `is-collapsed`
- When `sidebar == null`: column absent (unchanged), regardless of `sidebarCollapsed`

- [ ] **Step 1: Extend `WorkbenchProps`**

In `packages/shell/src/types.ts`, add `sidebarCollapsed?: boolean` to `WorkbenchProps`.

- [ ] **Step 2: Write failing Workbench collapse tests**

Append to `packages/shell/src/components/Workbench.test.tsx`:

```tsx
  it('adds is-collapsed when sidebarCollapsed is true', () => {
    const { container } = render(
      <Workbench
        activityBar={<div>AB</div>}
        sidebar={<div>SB</div>}
        sidebarCollapsed
      >
        <div>EDITOR</div>
      </Workbench>,
    );
    const col = container.querySelector('.vsc-workbench__sidebar');
    expect(col).toHaveClass('is-collapsed');
    expect(screen.getByText('SB')).toBeInTheDocument();
  });

  it('does not collapse when sidebarCollapsed is false', () => {
    const { container } = render(
      <Workbench
        activityBar={<div>AB</div>}
        sidebar={<div>SB</div>}
        sidebarCollapsed={false}
      >
        <div>EDITOR</div>
      </Workbench>,
    );
    expect(container.querySelector('.vsc-workbench__sidebar')).not.toHaveClass(
      'is-collapsed',
    );
  });

  it('ignores sidebarCollapsed when sidebar is null', () => {
    const { container } = render(
      <Workbench activityBar={<div>AB</div>} sidebar={null} sidebarCollapsed>
        <div>EDITOR</div>
      </Workbench>,
    );
    expect(container.querySelector('.vsc-workbench__sidebar')).toBeNull();
  });
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
pnpm --filter @vscode-shell/ui test -- src/components/Workbench.test.tsx
```

Expected: FAIL — `sidebarCollapsed` / `is-collapsed` not implemented.

- [ ] **Step 4: Implement Workbench + CSS**

Update `packages/shell/src/components/Workbench.tsx`:

```tsx
import type { FC } from 'react';
import type { WorkbenchProps } from '../types';

export const Workbench: FC<WorkbenchProps> = ({
  titleBar,
  activityBar,
  sidebar,
  sidebarCollapsed = false,
  tabs,
  panel,
  statusBar,
  children,
}) => {
  const sidebarClass = sidebarCollapsed
    ? 'vsc-workbench__sidebar is-collapsed'
    : 'vsc-workbench__sidebar';

  return (
    <div className="vsc-workbench">
      {titleBar != null ? titleBar : null}
      <div className="vsc-workbench__body">
        {activityBar}
        {sidebar != null ? <div className={sidebarClass}>{sidebar}</div> : null}
        <div className="vsc-workbench__main">
          {tabs}
          <main className="vsc-workbench__editor">{children}</main>
          {panel != null ? <div className="vsc-workbench__panel">{panel}</div> : null}
        </div>
      </div>
      {statusBar}
    </div>
  );
};
```

Update `.vsc-workbench__sidebar` in `packages/shell/src/styles.css`:

```css
.vsc-workbench__sidebar {
  display: flex;
  min-height: 0;
  max-width: 192px;
  overflow: hidden;
  transition: max-width 180ms ease;
}

.vsc-workbench__sidebar.is-collapsed {
  max-width: 0;
  pointer-events: none;
}
```

(`192px` matches Sidebar default `width = 192`.)

- [ ] **Step 5: Run Workbench tests — expect PASS**

Run:

```bash
pnpm --filter @vscode-shell/ui test -- src/components/Workbench.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Build UI package**

Run:

```bash
pnpm --filter @vscode-shell/ui build
```

Expected: success; `dist/styles.css` includes `.is-collapsed`.

- [ ] **Step 7: Commit**

```bash
git add packages/shell/src/types.ts packages/shell/src/components/Workbench.tsx packages/shell/src/components/Workbench.test.tsx packages/shell/src/styles.css
git commit -m "$(cat <<'EOF'
feat(shell): collapse Workbench sidebar with max-width transition

EOF
)"
```

---

### Task 3: Wire starter TitleBar toggle

**Files:**
- Modify: `apps/starter/src/App.tsx`

**Interfaces:**
- Consumes: `TitleBar.left`, `Workbench.sidebarCollapsed` from Tasks 1–2
- Produces: starter UX only (no new library exports)

- [ ] **Step 1: Add visibility state and left toggle in App**

In `apps/starter/src/App.tsx`:

1. Import `VscLayoutSidebarLeft` from `react-icons/vsc` (keep existing `hi` imports).
2. Add state:

```tsx
const [sidebarVisible, setSidebarVisible] = useState(true);
```

3. Pass to `TitleBar`:

```tsx
left={
  <button
    type="button"
    aria-label={sidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
    aria-pressed={sidebarVisible}
    title={sidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
    onClick={() => setSidebarVisible((v) => !v)}
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
    <VscLayoutSidebarLeft size={14} />
  </button>
}
```

4. Pass to `Workbench`:

```tsx
sidebarCollapsed={!sidebarVisible}
```

5. Keep existing `sidebar={<Sidebar ... />}` always mounted. Do **not** change ActivityBar `onChange` to touch `sidebarVisible`.

- [ ] **Step 2: Manual smoke (or typecheck)**

Run:

```bash
pnpm --filter starter build
```

Expected: TypeScript + Vite build succeed.

Manual (when running Tauri/dev):
- Mac: toggle sits after traffic lights
- Windows: toggle at far left
- Click toggles collapse with transition; ActivityBar does not change visibility

- [ ] **Step 3: Run full shell unit tests**

Run:

```bash
pnpm --filter @vscode-shell/ui test
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/starter/src/App.tsx
git commit -m "$(cat <<'EOF'
feat(starter): toggle Sidebar from TitleBar left

EOF
)"
```

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| `TitleBar.left` slot + no-drag | Task 1 |
| Mac after traffic / Win leftmost via traffic-width | Task 1 CSS + existing `platform.ts` |
| `Workbench.sidebarCollapsed` + DOM kept | Task 2 |
| `max-width` transition (not `width: auto`) | Task 2 CSS |
| Starter state + panel icon | Task 3 (`VscLayoutSidebarLeft`) |
| ActivityBar does not change visibility | Task 3 step 1 note |
| Library free of Tauri/platform detection | All tasks |
| Unit tests TitleBar left + Workbench collapse | Tasks 1–2 |
| `sidebar={null}` still hides column | Task 2 test |

**Placeholder scan:** none.  
**Type consistency:** `left`, `sidebarCollapsed`, `is-collapsed`, `vsc-titlebar__left-actions` used consistently.
