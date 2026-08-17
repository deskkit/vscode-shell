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
    colorLinkHover: '#4db8ff',
    colorLinkActive: '#005fa3',
    // Primary / solid 按钮上的文字与图标（Transfer 中间主按钮依赖此 token）
    colorTextLightSolid: '#ffffff',
    // 关掉立体按钮底部描边（暗色下会变成白边）
    controlOutline: 'transparent',
    controlTmpOutline: 'transparent',
    // Transfer / Menu 选中行：勿用 antd 派生的浅蓝底（暗色下字几乎看不见）
    controlItemBgHover: 'var(--vscode-hover-bg)',
    controlItemBgActive: 'var(--vscode-selected-bg)',
    controlItemBgActiveHover: 'var(--vscode-selected-bg)',
    controlItemBgActiveDisabled: 'var(--vscode-selected-bg)',
    // 禁用态：Transfer 操作钮始终 type=primary，未激活即 disabled
    colorTextDisabled: 'var(--vscode-text-secondary)',
    colorBgContainerDisabled: 'var(--vscode-sidebar-bg)',
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
      // CSS var 无法参与 antd 派生算法时，显式钉死 default / primary 表面色
      primaryColor: '#ffffff',
      defaultBg: 'var(--vscode-sidebar-bg)',
      defaultColor: 'var(--vscode-text-primary)',
      defaultBorderColor: 'var(--vscode-input-border)',
      defaultHoverBg: 'var(--vscode-hover-bg)',
      defaultHoverColor: '#007acc',
      defaultHoverBorderColor: '#007acc',
      defaultActiveBg: 'var(--vscode-hover-bg)',
      defaultActiveColor: '#007acc',
      defaultActiveBorderColor: '#007acc',
      defaultShadow: 'none',
      primaryShadow: 'none',
      dangerShadow: 'none',
      borderColorDisabled: 'var(--vscode-input-border)',
      textTextColor: 'var(--vscode-text-primary)',
      textTextHoverColor: '#007acc',
      solidTextColor: '#ffffff',
    },
    Transfer: {
      listHeight: 320,
      itemHeight: 32,
    },
    Checkbox: {
      colorBgContainer: 'var(--vscode-input-bg)',
      colorBorder: 'var(--vscode-input-border)',
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
