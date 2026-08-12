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
