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
