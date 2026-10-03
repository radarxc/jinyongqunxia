import { describe, expect, it } from 'vitest';

import { TownEraKitSchema } from './town';

describe('TownRuntimeSchema era kits', () => {
  it.each(['tang', 'xiyu', 'tubo'] as const)('accepts %s', (eraKit) => {
    expect(TownEraKitSchema.parse(eraKit)).toBe(eraKit);
  });

  it('rejects an undeclared kit', () => {
    expect(TownEraKitSchema.safeParse('invented').success).toBe(false);
  });
});
