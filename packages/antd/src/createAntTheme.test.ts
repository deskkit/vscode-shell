import { describe, expect, it } from 'vitest';
import { createAntTheme } from './createAntTheme';

describe('createAntTheme', () => {
  it('returns cssVar ant key and vscode-mapped colorText', () => {
    const theme = createAntTheme();
    expect(theme.cssVar).toEqual({ key: 'ant' });
    expect(theme.token?.colorText).toBe('var(--vscode-text-primary)');
    expect(theme.token?.colorPrimary).toBe('#007acc');
    expect(theme.components?.Table?.headerBg).toBe('var(--vscode-table-header-bg)');
    expect(theme.token?.colorTextLightSolid).toBe('#ffffff');
    expect(theme.token?.controlItemBgActive).toBe('var(--vscode-selected-bg)');
    expect(theme.token?.colorTextDisabled).toBe(
      'var(--vscode-text-secondary)',
    );
    expect(theme.components?.Button?.borderColorDisabled).toBe(
      'var(--vscode-input-border)',
    );
    expect(theme.components?.Button?.defaultBorderColor).toBe(
      'var(--vscode-input-border)',
    );
    expect(theme.components?.Button?.primaryColor).toBe('#ffffff');
    expect(theme.components?.Transfer?.listHeight).toBe(320);
  });

  it('returns a shallow copy so callers cannot mutate package defaults', () => {
    const first = createAntTheme();
    first.token!.colorPrimary = '#mutated';

    const second = createAntTheme();
    expect(second.token?.colorPrimary).toBe('#007acc');
    expect(first).not.toBe(second);
    expect(first.token).not.toBe(second.token);
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
