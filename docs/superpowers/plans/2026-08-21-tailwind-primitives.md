# Tailwind 新控件 + ResizeHandle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `@vscode-shell/ui` 用 Tailwind 4 构建时编译新控件样式，并加入第一例 `ResizeHandle`；现有 `.vsc-*` 壳不改写。

**Architecture:** `packages/shell` 增加 Tailwind 4 为 devDependency。`src/tailwind.css` 只导入 theme + utilities（无 preflight），`@source` 扫描组件 TSX。构建：tsup → tailwind CLI → 与手写 `src/styles.css` 拼接成 `dist/styles.css`。`ResizeHandle` 用 utility class + `--vscode-*` / `color-mix`，Pointer Events 对齐 Scrollbar。

**Tech Stack:** React 18 peer、TypeScript、tsup、Tailwind CSS 4 + `@tailwindcss/cli`、Vitest + Testing Library。

## Global Constraints

- Working directory: `/Users/melon/Projects/melon/vscode-shell`
- Spec: `docs/superpowers/specs/2026-08-21-tailwind-primitives-design.md`
- Tailwind 只作 `packages/shell` 的 **devDependency**；runtime / peer 不加 `tailwindcss`
- 库构建 **关闭 preflight**；禁止 Tailwind 调色板（`bg-blue-500` 等）；颜色只用 `var(--vscode-*)`
- 不改写现有 `.vsc-*` 壳；不新建 package
- 无 `@tauri-apps/*`、无 `clsx`
- 用户未要求时 **不要 commit / publish**
- 本计划不含 cb-monitor 改 import（发 0.3.0 之后另开）

---

## File Structure

```
packages/shell/
├── package.json                         # 0.3.0；devDeps tailwindcss + @tailwindcss/cli；build 脚本
├── README.md                            # 新控件约定 + ResizeHandle
├── scripts/
│   ├── copy-styles.mjs                  # 删除，由 concat-styles.mjs 替代
│   └── concat-styles.mjs                # 手写 CSS + tw utilities → dist/styles.css
├── src/
│   ├── styles.css                       # 不动（tokens + .vsc-*）
│   ├── tailwind.css                     # 无 preflight 的 TW4 入口
│   ├── types.ts                         # ResizeHandleProps
│   ├── index.ts                         # 导出 ResizeHandle
│   └── components/
│       ├── ResizeHandle.tsx
│       └── ResizeHandle.test.tsx
```

---

### Task 1: Tailwind 4 构建管道（无 preflight）

**Files:**
- Create: `packages/shell/src/tailwind.css`
- Create: `packages/shell/scripts/concat-styles.mjs`
- Delete: `packages/shell/scripts/copy-styles.mjs`
- Modify: `packages/shell/package.json`

**Interfaces:**
- Consumes: 现有 `src/styles.css`、`tsup` `clean: true`
- Produces: `dist/styles.css` = 手写 CSS 在前 + 生成的 utilities 在后；`dist/tw-utilities.css` 可留作中间产物

- [ ] **Step 1: 安装构建依赖**

在 `packages/shell`：

```bash
pnpm add -D tailwindcss@^4.0.0 @tailwindcss/cli@^4.0.0 --filter @vscode-shell/ui
```

Expected: `packages/shell/package.json` 的 `devDependencies` 含 `tailwindcss` 与 `@tailwindcss/cli`。

- [ ] **Step 2: 写 `src/tailwind.css`**

```css
@layer theme, base, components, utilities;

@import "tailwindcss/theme" layer(theme);
@import "tailwindcss/utilities" layer(utilities);

@source "./components";
@source not "./components/**/*.test.tsx";
```

不要 `@import "tailwindcss"`（那会带上 preflight）。

- [ ] **Step 3: 写 `scripts/concat-styles.mjs`**

```js
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(pkg, 'dist'), { recursive: true });

const hand = readFileSync(join(pkg, 'src', 'styles.css'), 'utf8');
const tw = readFileSync(join(pkg, 'dist', 'tw-utilities.css'), 'utf8');
writeFileSync(
  join(pkg, 'dist', 'styles.css'),
  `${hand}\n\n/* tailwind utilities — generated, do not edit */\n${tw}`,
);
```

- [ ] **Step 4: 改 `package.json` 的 `build` 和版本**

把 `"version"` 改为 `"0.3.0"`。

把 `build` 换成：

```json
"build": "tsup && tailwindcss -i src/tailwind.css -o dist/tw-utilities.css && node ./scripts/concat-styles.mjs"
```

删除对 `copy-styles.mjs` 的引用；删掉该文件。

- [ ] **Step 5: 构建并验证管道**

```bash
pnpm --filter @vscode-shell/ui build
```

Expected: exit 0。

```bash
node --input-type=module -e "
import { readFileSync } from 'node:fs';
const css = readFileSync('packages/shell/dist/styles.css','utf8');
const tw = readFileSync('packages/shell/dist/tw-utilities.css','utf8');
if (!css.includes('.vsc-workbench')) throw new Error('missing chrome');
// Real preflight marker — do NOT use '*, ::before, ::after' (TW 4.x @layer properties polyfill uses that too)
if (tw.includes('border: 0 solid')) throw new Error('preflight leaked');
console.log('ok', css.length);
"
```

Expected: 打印 `ok` 和一个数字。`border: 0 solid` 是 Tailwind preflight 的可靠标志；TW 4 `@layer properties` 也会出现 `*, ::before, ::after`，不能当作 preflight。

- [ ] **Step 6: 跑现有测试**

```bash
pnpm --filter @vscode-shell/ui test
```

Expected: 全过（与改构建前相同）。

- [ ] **Step 7: Commit（仅当用户要求）**

```bash
git add packages/shell/package.json packages/shell/src/tailwind.css packages/shell/scripts/concat-styles.mjs
git rm packages/shell/scripts/copy-styles.mjs
git commit -m "$(cat <<'EOF'
build(ui): compile Tailwind utilities into styles.css without preflight

EOF
)"
```

---

### Task 2: `ResizeHandle`（TDD）

**Files:**
- Create: `packages/shell/src/components/ResizeHandle.test.tsx`
- Create: `packages/shell/src/components/ResizeHandle.tsx`
- Modify: `packages/shell/src/types.ts`
- Modify: `packages/shell/src/index.ts`

**Interfaces:**
- Consumes: Task 1 的构建管道（本任务不测 CSS 拼接）
- Produces:

```ts
export type ResizeHandleDirection = 'row' | 'column';

export type ResizeHandleProps = {
  direction: ResizeHandleDirection;
  onDrag: (delta: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  thickness?: number;
  className?: string;
};
```

`row`：横条，读 `clientY`。`column`：竖条，读 `clientX`。默认 `thickness = 3`。

- [ ] **Step 1: 在 `types.ts` 末尾追加类型**

把上面的 `ResizeHandleDirection` 与 `ResizeHandleProps` 贴到 `packages/shell/src/types.ts` 末尾（已有 `import type { ReactNode }`）。

- [ ] **Step 2: 写失败测试**

`packages/shell/src/components/ResizeHandle.test.tsx`：

```tsx
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { ResizeHandle } from './ResizeHandle';

describe('ResizeHandle', () => {
  it('emits Y deltas for direction=row', () => {
    const onDrag = vi.fn();
    const { container } = render(
      <ResizeHandle direction="row" onDrag={onDrag} />,
    );
    const el = container.firstElementChild as HTMLElement;
    fireEvent.pointerDown(el, { clientY: 40, clientX: 0 });
    fireEvent.pointerMove(window, { clientY: 52, clientX: 0 });
    expect(onDrag).toHaveBeenCalledWith(12);
  });

  it('emits X deltas for direction=column', () => {
    const onDrag = vi.fn();
    const { container } = render(
      <ResizeHandle direction="column" onDrag={onDrag} />,
    );
    const el = container.firstElementChild as HTMLElement;
    fireEvent.pointerDown(el, { clientX: 10, clientY: 0 });
    fireEvent.pointerMove(window, { clientX: 18, clientY: 0 });
    expect(onDrag).toHaveBeenCalledWith(8);
  });

  it('stops emitting after pointerup', () => {
    const onDrag = vi.fn();
    const { container } = render(
      <ResizeHandle direction="row" onDrag={onDrag} />,
    );
    const el = container.firstElementChild as HTMLElement;
    fireEvent.pointerDown(el, { clientY: 10 });
    fireEvent.pointerUp(window);
    fireEvent.pointerMove(window, { clientY: 40 });
    expect(onDrag).not.toHaveBeenCalled();
  });

  it('calls onDragStart then onDragEnd', () => {
    const onDragStart = vi.fn();
    const onDragEnd = vi.fn();
    const { container } = render(
      <ResizeHandle
        direction="row"
        onDrag={() => {}}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />,
    );
    const el = container.firstElementChild as HTMLElement;
    fireEvent.pointerDown(el, { clientY: 0 });
    expect(onDragStart).toHaveBeenCalledTimes(1);
    fireEvent.pointerUp(window);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 3: 跑测试确认失败**

```bash
pnpm --filter @vscode-shell/ui exec vitest run src/components/ResizeHandle.test.tsx
```

Expected: FAIL，`ResizeHandle` 模块不存在。

- [ ] **Step 4: 实现组件**

`packages/shell/src/components/ResizeHandle.tsx`：

```tsx
import { useCallback, useRef, useState, type FC, type PointerEvent as ReactPointerEvent } from 'react';
import type { ResizeHandleProps } from '../types';

const ACTIVE = 'var(--vscode-statusbar-bg)';
const HOVER = 'color-mix(in srgb, var(--vscode-statusbar-bg) 50%, transparent)';

export const ResizeHandle: FC<ResizeHandleProps> = ({
  direction,
  onDrag,
  onDragStart,
  onDragEnd,
  thickness = 3,
  className,
}) => {
  const [active, setActive] = useState(false);
  const [hover, setHover] = useState(false);
  const lastPos = useRef(0);
  const dragging = useRef(false);

  const isRow = direction === 'row';

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragging.current = true;
      setActive(true);
      lastPos.current = isRow ? event.clientY : event.clientX;
      onDragStart?.();
      document.body.style.userSelect = 'none';
      document.body.style.cursor = isRow ? 'row-resize' : 'col-resize';

      const onMove = (ev: PointerEvent) => {
        const pos = isRow ? ev.clientY : ev.clientX;
        const delta = pos - lastPos.current;
        lastPos.current = pos;
        onDrag(delta);
      };
      const onUp = () => {
        dragging.current = false;
        setActive(false);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        onDragEnd?.();
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [isRow, onDrag, onDragStart, onDragEnd],
  );

  const rootClass = [
    'shrink-0 transition-colors',
    isRow ? 'cursor-row-resize' : 'cursor-col-resize',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const backgroundColor = active ? ACTIVE : hover ? HOVER : 'transparent';

  return (
    <div
      className={rootClass}
      style={{
        ...(isRow ? { height: thickness } : { width: thickness }),
        backgroundColor,
      }}
      onPointerDown={onPointerDown}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => {
        if (!dragging.current) setHover(false);
      }}
    />
  );
};
```

禁止 `clsx`。禁止 `#007acc` 和 `` `${hex}80` ``。

- [ ] **Step 5: 导出**

`packages/shell/src/index.ts` 增加：

```ts
export { ResizeHandle } from './components/ResizeHandle';
```

在现有 `export type { ... }` 列表中加入 `ResizeHandleDirection` 和 `ResizeHandleProps`。

- [ ] **Step 6: 跑测试确认通过**

```bash
pnpm --filter @vscode-shell/ui exec vitest run src/components/ResizeHandle.test.tsx
pnpm --filter @vscode-shell/ui test
```

Expected: ResizeHandle 4 个用例过；全包测试过。

- [ ] **Step 7: Commit（仅当用户要求）**

```bash
git add packages/shell/src/components/ResizeHandle.tsx packages/shell/src/components/ResizeHandle.test.tsx packages/shell/src/types.ts packages/shell/src/index.ts
git commit -m "$(cat <<'EOF'
feat(ui): add ResizeHandle with pointer deltas

EOF
)"
```

---

### Task 3: 构建产物含 utility + README

**Files:**
- Modify: `packages/shell/README.md`
- Rebuild: `packages/shell/dist/styles.css`

**Interfaces:**
- Consumes: Task 2 的 `shrink-0` / `cursor-row-resize` class
- Produces: README 说明新控件约定；`dist/styles.css` 含这些 utility 且仍含 `.vsc-workbench`

- [ ] **Step 1: 重建并断言 utility 进了 CSS**

```bash
pnpm --filter @vscode-shell/ui build
node --input-type=module -e "
import { readFileSync } from 'node:fs';
const css = readFileSync('packages/shell/dist/styles.css','utf8');
for (const needle of ['.vsc-workbench', 'shrink-0', 'cursor-row-resize', 'cursor-col-resize']) {
  if (!css.includes(needle)) throw new Error('missing ' + needle);
}
const tw = readFileSync('packages/shell/dist/tw-utilities.css','utf8');
if (tw.includes('border: 0 solid')) throw new Error('preflight leaked');
console.log('ok');
"
```

Expected: 打印 `ok`。

- [ ] **Step 2: 更新 README**

在 `## Styles` 之后插入：

```markdown
## New primitives (Tailwind at build time)

Chrome (Workbench, bars, Scrollbar) stays hand-written `.vsc-*` CSS.

New shared controls are authored with Tailwind 4 utilities in this package and compiled into `styles.css` at build time. Apps still import only `@vscode-shell/ui/styles.css`. The package does not enable Tailwind preflight and does not use the Tailwind color palette — use `var(--vscode-*)`.

### ResizeHandle

Splitter. `direction="row"` is a horizontal bar (drag on Y). `direction="column"` is a vertical bar (drag on X). `onDrag` receives a pixel delta.

```tsx
import { ResizeHandle } from '@vscode-shell/ui';

<ResizeHandle direction="row" onDrag={(delta) => setHeight((h) => h + delta)} />
```
```

Quick start 的 import 列表不必改（可选组件）。

- [ ] **Step 3: 再跑全量测试**

```bash
pnpm --filter @vscode-shell/ui test
```

Expected: 全过。

- [ ] **Step 4: Commit（仅当用户要求）**

```bash
git add packages/shell/README.md
git commit -m "$(cat <<'EOF'
docs(ui): document Tailwind-built primitives and ResizeHandle

EOF
)"
```

---

## Spec coverage

| Spec | Task |
|---|---|
| 旧壳不改写 | 1（只改构建，不动 `styles.css` 规则） |
| TW4 devDep、无 peer | 1 |
| 无 preflight、拼进 `styles.css` | 1、3 |
| 禁止调色板 / `--vscode-*` | 2 |
| 不新建 package | 全程 `packages/shell` |
| ResizeHandle API `row`/`column`、Pointer、color-mix | 2 |
| 导出 + 0.3.0 | 1（版本）、2（导出） |
| README | 3 |
| 验收 1–6 | 1+2+3 的 node 断言与 vitest |
| cb-monitor 跟进 | **不在本计划** |

## After this plan

cb-monitor：升 `@vscode-shell/ui` 到 0.3.0（需 publish 或 path）、`horizontal` → `row`、删本地 `ResizeHandle.tsx`。升应用 Tailwind 4 另开。
