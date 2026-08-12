import { describe, expect, it } from 'vitest';
import { createFlowbiteTheme } from './createFlowbiteTheme';

describe('createFlowbiteTheme', () => {
  it('returns theme with table and sidebar sections', () => {
    const theme = createFlowbiteTheme();
    expect(theme).toBeTypeOf('object');
    expect(theme).toHaveProperty('table');
    expect(theme).toHaveProperty('sidebar');
    expect(theme).toHaveProperty('modal');
  });

  it('replaces a top-level section when overridden', () => {
    const theme = createFlowbiteTheme({
      overrides: {
        card: { root: { base: 'rounded-none' } },
      },
    });
    expect(theme).toHaveProperty('card');
    // default fileInput section still present
    expect(theme).toHaveProperty('fileInput');
  });
});
