import { Linter } from 'eslint';
import { describe, expect, it } from 'vitest';
import { integerOnlySyntax } from '../eslint.config.js';

function lintCoreExpression(expression: string): string[] {
  return new Linter()
    .verify(`const result = ${expression};`, {
      languageOptions: { ecmaVersion: 2022 },
      rules: { 'no-restricted-syntax': ['error', ...integerOnlySyntax] },
    })
    .map(({ message }) => message);
}

describe('core integer-only ESLint rules', () => {
  it.each(['left / right', 'Math.floor(left / right)'])(
    'rejects floating-point division in %s',
    (expression) => {
      expect(lintCoreExpression(expression)).toContain(
        'Core 禁止浮点除法；使用经验证的精确整数 helper。',
      );
    },
  );
});
