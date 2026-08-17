# @vscode-shell/antd

Optional Ant Design theme bridge for [`@vscode-shell/ui`](https://www.npmjs.com/package/@vscode-shell/ui) tokens. Maps `--vscode-*` into Ant Design `ThemeConfig` (`createAntTheme`) and ships a small `--ant-*` CSS variable layer.

## Install

```bash
pnpm add @vscode-shell/ui @vscode-shell/antd antd
pnpm add react react-dom
```

## Usage

```tsx
import { ConfigProvider } from 'antd';
import { createAntTheme } from '@vscode-shell/antd';
import '@vscode-shell/ui/styles.css';
import '@vscode-shell/antd/styles.css';

export function App({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={createAntTheme()}>
      {children}
    </ConfigProvider>
  );
}
```

### Overrides

```ts
createAntTheme({
  overrides: {
    token: { borderRadius: 6 },
  },
});
```

## What this package does **not** include

Structural app CSS (ProTable toolbars, layout Tabs height, titlebar Segmented, etc.) stays in your application. This package is token / `ThemeConfig` only.

## Docs

- Repo: https://github.com/deskkit/vscode-shell
- Spec: [publish & theme bridges](https://github.com/deskkit/vscode-shell/blob/main/docs/superpowers/specs/2026-08-12-publish-and-theme-bridges-design.md)

## License

MIT
