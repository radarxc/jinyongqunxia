import rootConfig from '../../eslint.config.js';

const rootCoreRules = rootConfig.find((entry) =>
  entry.files?.includes('packages/core/src/**/*.ts'),
);
const restrictedSyntax = rootCoreRules?.rules?.['no-restricted-syntax'];
if (!Array.isArray(restrictedSyntax)) throw new Error('CORE_ESLINT_CONFIG_MISSING');

export const integerOnlySyntax = [
  {
    selector: 'BinaryExpression[operator="/"]',
    message: 'Core 禁止浮点除法；使用经验证的精确整数 helper。',
  },
  {
    selector: 'AssignmentExpression[operator="/="]',
    message: 'Core 禁止浮点除法赋值；使用经验证的精确整数 helper。',
  },
];

const integerOnlyRules = {
  files: ['src/**/*.ts', 'packages/core/src/**/*.ts'],
  languageOptions: rootCoreRules.languageOptions,
  rules: {
    ...rootCoreRules.rules,
    'no-restricted-syntax': [...restrictedSyntax, ...integerOnlySyntax],
  },
};

export default [...rootConfig, integerOnlyRules];
