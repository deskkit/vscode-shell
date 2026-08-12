import type { ThemeConfig } from 'antd';

function cloneThemeConfig(base: ThemeConfig): ThemeConfig {
  return {
    ...base,
    token: base.token ? { ...base.token } : base.token,
    components: base.components ? { ...base.components } : base.components,
  };
}

export function mergeThemeConfig(
  base: ThemeConfig,
  overrides?: ThemeConfig,
): ThemeConfig {
  if (!overrides) return cloneThemeConfig(base);

  const components: ThemeConfig['components'] = { ...base.components };
  if (overrides.components) {
    for (const [name, value] of Object.entries(overrides.components)) {
      const key = name as keyof NonNullable<ThemeConfig['components']>;
      components![key] = {
        ...(base.components?.[key] as object | undefined),
        ...(value as object),
      } as never;
    }
  }

  return {
    ...base,
    ...overrides,
    cssVar: overrides.cssVar ?? base.cssVar,
    token: { ...base.token, ...overrides.token },
    components,
  };
}
