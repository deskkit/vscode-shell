import type { ThemeConfig } from 'antd';

export function mergeThemeConfig(
  base: ThemeConfig,
  overrides?: ThemeConfig,
): ThemeConfig {
  if (!overrides) return base;

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
