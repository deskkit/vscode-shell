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
