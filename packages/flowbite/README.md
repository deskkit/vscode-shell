# @vscode-shell/flowbite

Optional Flowbite React theme bridge for [`@vscode-shell/ui`](https://www.npmjs.com/package/@vscode-shell/ui) tokens. Builds a `flowbite-react` theme via `createFlowbiteTheme()` so components pick up `--vscode-*` colors.

## Install

```bash
pnpm add @vscode-shell/ui @vscode-shell/flowbite flowbite-react
pnpm add react react-dom
```

## Usage

```tsx
import { ThemeProvider } from 'flowbite-react';
import { createFlowbiteTheme } from '@vscode-shell/flowbite';
import '@vscode-shell/ui/styles.css';

export function App({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={createFlowbiteTheme()}>
      {children}
    </ThemeProvider>
  );
}
```

### Overrides

```ts
createFlowbiteTheme({
  overrides: {
    // deep-merge into the default Flowbite theme sections
  },
});
```

## Notes

- Peer: `flowbite-react` (and React). Vite / codegen setup for Flowbite stays in the app.
- No structural layout CSS is shipped here—only theme factory defaults tied to `@vscode-shell/ui` tokens.

## Docs

- Repo: https://github.com/deskkit/vscode-shell
- Spec: [publish & theme bridges](https://github.com/deskkit/vscode-shell/blob/main/docs/superpowers/specs/2026-08-12-publish-and-theme-bridges-design.md)

## License

MIT
