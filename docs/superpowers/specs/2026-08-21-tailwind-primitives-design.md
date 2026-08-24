# `@vscode-shell/ui`：新控件用 Tailwind 4 构建

> 状态：待审  
> 日期：2026-08-21  
> 仓库：`vscode-shell`（`packages/shell`）  
> 前置：[2026-08-07-vscode-shell-design.md](./2026-08-07-vscode-shell-design.md)

## 问题

通用控件会在 cb-monitor 里用 Tailwind 写，再收进 `@vscode-shell/ui`。库今天只有手写 `.vsc-*`，每收一次就要把 utility 翻译成 CSS。作者体验和壳的稳定性被绑在一起了。

## 目标

1. 现有壳（Workbench、ActivityBar、Sidebar、PageTabs、StatusBar、TitleBar、Scrollbar）样式不改写。
2. 新收的通用控件在库源码里用 Tailwind 4 写。
3. 构建把用到的 utility 编进现有的 `@vscode-shell/ui/styles.css`。消费方仍只 import 这一份 CSS。
4. 不新建 package。
5. 第一个控件：`ResizeHandle`。

## 非目标

- 把现有 `.vsc-*` 改成 Tailwind
- 新建 `packages/components`
- 让消费方扫描 `node_modules` 才有壳/控件样式
- 本轮升 cb-monitor 到 Tailwind 4（另开；不挡库发版）
- 改 `@vscode-shell/antd` / `flowbite`
- Workbench `panel` 内置拖高

## 决策

| 项 | 选择 |
|---|---|
| Tailwind 放哪 | `packages/shell` 的 **devDependency**（构建时）。runtime / peer 不加 `tailwindcss` |
| 版本 | Tailwind **4**（与 starter 对齐） |
| 发出去的 CSS | 仍是 `dist/styles.css` = 现有手写 CSS **加上** 新控件扫出来的 utility |
| Preflight | **关闭**。库构建只出 `theme`（可选）+ `utilities`，不重置消费方 `html/body` |
| 颜色 | 禁止 Tailwind 调色板（`bg-blue-500` 等）。只用 `var(--vscode-*)` arbitrary。本轮不加 `@theme` 色名 |
| 前缀 | 无 `vsc:`。`flex` / `shrink-0` 与消费方 Tailwind 重复时规则等价，可接受 |
| 目录 | 新控件仍在 `src/components/`，与 Scrollbar 并列。不另开 primitives 包 |

## 构建

现在：`tsup && copy src/styles.css → dist/styles.css`。

改为：

```text
tsup
tailwindcss  (src/tailwind.css → 中间产物，无 preflight)
concat       src/styles.css + 中间产物 → dist/styles.css
```

`src/tailwind.css` 只 `@source` 库自己的 `src/**/*.tsx`（不含测试）。现有组件几乎不用 utility，第一次编出来接近空，直到 `ResizeHandle` 进树。

Vitest 测 `onDrag` 等行为，不依赖编出来的 CSS。

## 消费方合同（不变）

```ts
import { Workbench, ResizeHandle } from '@vscode-shell/ui';
import '@vscode-shell/ui/styles.css';
```

漏配 Tailwind content **不影响**壳和这些控件。应用页面自己用不用 Tailwind 仍自由；文档默认推荐 TW4，方便以后从应用拷组件进库。

## `ResizeHandle`（第一例）

从 cb-monitor `src/components/ui/ResizeHandle.tsx` 收进来，按库标准改，不原样搬 Tailwind+`clsx`。

```ts
type ResizeHandleProps = {
  /** `row`：横条，拖 Y（原 LogPanel / 操盘台 `horizontal`） */
  /** `column`：竖条，拖 X */
  direction: 'row' | 'column';
  onDrag: (delta: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  thickness?: number; // 默认 3
  className?: string;
};
```

- 交互对齐 Scrollbar：Pointer Events；`pointerup` / `pointercancel` 清监听；拖动中 `user-select: none` + 对应 cursor。
- 默认/悬停/拖动色：`var(--vscode-statusbar-bg)`。悬停用 `color-mix`，禁止 `${hex}80`。
- 源码 class 用 Tailwind utility（`shrink-0`、`cursor-row-resize` 等）；高亮色走 CSS 变量，不写死 `#007acc`。
- 导出：`src/index.ts` + `ResizeHandleProps`。
- 测试：按下移动触发 `onDrag(delta)`；方向 `row` 用 `clientY`、`column` 用 `clientX`；松开后不再回调。

版本：`0.2.4` → **`0.3.0`**（新导出，无 breaking chrome API）。

## cb-monitor 跟进（本 spec 之后）

1. 升 `@vscode-shell/ui` 到含 `ResizeHandle` 的版本。
2. `LogPanel` / `TradingDesk`：`direction="horizontal"` → `"row"`，改为从 `@vscode-shell/ui` import。
3. 删除 `src/components/ui/ResizeHandle.tsx` 及其 re-export。

不在本 spec 改 cb-monitor 的 Tailwind 3。

## 验收

| # | 输入 | 预期 |
|---|------|------|
| 1 | 只 import `styles.css`，不装 Tailwind | Workbench 与现网一致；`ResizeHandle` 有宽高和 cursor |
| 2 | 拖 `direction="row"` | `onDrag` 收到 Y 增量 |
| 3 | 拖 `direction="column"` | `onDrag` 收到 X 增量 |
| 4 | 现有 `@vscode-shell/ui` 单测 | 全过 |
| 5 | starter 不改业务 | `tauri dev` 壳正常 |
| 6 | 库构建产物 | `dist/styles.css` 含原 `.vsc-*`，且含 `ResizeHandle` 用到的 utility |

## 风险

| 假设 | 失败 | 处理 |
|---|---|---|
| 打开 preflight | 消费方 `body` 被重置 | 库构建禁用 preflight |
| 扫描到测试文件 | 测试用 class 污染产物 | `@source` 不含 `*.test.tsx` |
| `flex` 与消费方重复 | 两份相同 utility | 接受 |
| 用了 `bg-red-500` | 控件不跟主题 | 规范 + review：只许 `--vscode-*` |
| cb-monitor 仍 TW3 | 不能无摩擦拷 class 进库 | 可发版；升 TW4 另开 |

## 文档

- 改 `packages/shell/README.md`：新控件用 Tailwind 写、构建编进 `styles.css`、禁止 preflight / 调色板。
- 本文件。不改 2026-08-07 全文；该文「库不绑 Tailwind」只适用于**旧壳手写 CSS**，新控件以本文为准。
