import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';

const ignored = [
  '**/node_modules/**',
  '.agents/**', // 协调与任务工作区（集成工作区下嵌套的 git worktree），不属于源码
  '**/dist/**',
  '**/dist-types/**',
  '**/coverage/**',
  'docs/**',
  'assets/**',
  'tools/**/*.py',
  'tools/vfx/**',
  'tools/agents/reports/**', // 任务报告与调研原型脚本（如 RESEARCH-anim-proto），不属于源码
];

const restrictedMath = [
  'random',
  'pow',
  'exp',
  'expm1',
  'log',
  'log1p',
  'log2',
  'log10',
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'atan2',
  'sinh',
  'cosh',
  'tanh',
  'hypot',
  'cbrt',
];

const internalModulePatterns = (names) =>
  names.flatMap((name) => [`@tianshu/${name}`, `@tianshu/${name}/**`]);
const denyInternalModules = (from, names) => ({
  from: { element: { type: from } },
  disallow: {
    to: { module: { origin: 'external', source: internalModulePatterns(names) } },
  },
});
const restrictedPackageImports = (names, extras = []) => [
  'error',
  {
    patterns: [
      ...extras,
      ...internalModulePatterns(names),
      ...names.map((name) => `**/${name}/**`),
    ],
  },
];

export default tseslint.config(
  { ignores: ignored },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx,vue,mjs,js}'],
    plugins: { boundaries },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { console: 'readonly' },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          checkAllOrigins: true,
          policies: [
            {
              from: { element: { type: 'shared' } },
              disallow: {
                to: {
                  element: {
                    types: { anyOf: ['data', 'core', 'platform', 'render', 'ui', 'app'] },
                  },
                },
              },
            },
            {
              from: { element: { type: 'data' } },
              disallow: {
                to: { element: { types: { anyOf: ['core', 'platform', 'render', 'ui', 'app'] } } },
              },
            },
            {
              from: { element: { type: 'core' } },
              disallow: {
                to: { element: { types: { anyOf: ['platform', 'render', 'ui', 'app'] } } },
              },
            },
            {
              from: { element: { type: 'platform' } },
              disallow: { to: { element: { types: { anyOf: ['data', 'render', 'ui', 'app'] } } } },
            },
            {
              from: { element: { type: 'render' } },
              disallow: {
                to: { element: { types: { anyOf: ['data', 'platform', 'ui', 'app'] } } },
              },
            },
            {
              from: { element: { type: 'ui' } },
              disallow: {
                to: { element: { types: { anyOf: ['data', 'platform', 'render', 'app'] } } },
              },
            },
            denyInternalModules('shared', ['data', 'core', 'platform', 'render', 'ui', 'game']),
            denyInternalModules('data', ['core', 'platform', 'render', 'ui', 'game']),
            denyInternalModules('core', ['platform', 'render', 'ui', 'game']),
            denyInternalModules('platform', ['data', 'render', 'ui', 'game']),
            denyInternalModules('render', ['data', 'platform', 'ui', 'game']),
            denyInternalModules('ui', ['data', 'platform', 'render', 'game']),
          ],
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
    },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      globals: { process: 'readonly', URL: 'readonly' },
    },
  },
  {
    settings: {
      'boundaries/elements': [
        { type: 'shared', pattern: 'packages/shared' },
        { type: 'data', pattern: 'packages/data' },
        { type: 'core', pattern: 'packages/core' },
        { type: 'platform', pattern: 'packages/platform' },
        { type: 'render', pattern: 'packages/render' },
        { type: 'ui', pattern: 'packages/ui' },
        { type: 'app', pattern: 'apps/*' },
      ],
      'boundaries/include': ['packages/**', 'apps/**'],
    },
  },
  {
    files: ['packages/shared/src/**/*.ts'],
    rules: {
      'no-restricted-imports': restrictedPackageImports([
        'data',
        'core',
        'platform',
        'render',
        'ui',
        'game',
      ]),
    },
  },
  {
    files: ['packages/data/src/**/*.ts'],
    rules: {
      'no-restricted-imports': restrictedPackageImports([
        'core',
        'platform',
        'render',
        'ui',
        'game',
      ]),
    },
  },
  {
    files: ['packages/platform/src/**/*.ts'],
    rules: {
      'no-restricted-imports': restrictedPackageImports(['data', 'render', 'ui', 'game']),
    },
  },
  {
    files: ['packages/render/src/**/*.ts'],
    rules: {
      'no-restricted-imports': restrictedPackageImports(['data', 'platform', 'ui', 'game']),
    },
  },
  {
    files: ['packages/ui/src/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': restrictedPackageImports(['data', 'platform', 'render', 'game']),
    },
  },
  {
    files: ['packages/core/src/**/*.ts'],
    languageOptions: { globals: {} },
    rules: {
      'no-restricted-globals': [
        'error',
        'Date',
        'performance',
        'window',
        'document',
        'navigator',
        'localStorage',
        'indexedDB',
        'fetch',
        'crypto',
        'Intl',
        'setTimeout',
        'setInterval',
        'requestAnimationFrame',
        'queueMicrotask',
      ],
      'no-restricted-properties': [
        'error',
        ...restrictedMath.map((property) => ({
          object: 'Math',
          property,
          message: `Core 禁止 Math.${property}；使用确定性整数实现。`,
        })),
        { object: 'Date', property: 'now', message: 'Core 时间只能来自 worldTick。' },
        { object: 'performance', property: 'now', message: 'Core 禁止墙钟。' },
        { object: 'WebAssembly', property: 'compile', message: 'Core DSL 禁止动态字节码。' },
        { property: 'localeCompare', message: 'ID 必须使用明确的 code-point 全序。' },
      ],
      'no-restricted-syntax': [
        'error',
        { selector: 'BinaryExpression[operator="**"]', message: '使用精确整数幂或查表。' },
        { selector: 'AssignmentExpression[operator="**="]', message: '使用精确整数幂或查表。' },
        { selector: 'ForInStatement', message: '规则集合必须使用稳定全序。' },
        {
          selector: 'CallExpression[callee.property.name="sort"][arguments.length=0]',
          message: 'sort 必须提供全序比较器。',
        },
        { selector: 'NewExpression[callee.name="Function"]', message: 'Core DSL 禁止动态代码。' },
      ],
      'no-restricted-imports': restrictedPackageImports(
        ['platform', 'render', 'ui', 'game'],
        ['node:*'],
      ),
      'no-eval': 'error',
      'no-new-func': 'error',
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
  },
);
