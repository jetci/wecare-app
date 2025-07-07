// auth-service/eslint.config.cjs
const { FlatCompat } = require('@eslint/eslintrc');
const { configs: jsConfigs } = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const globals = require('globals');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: jsConfigs.recommended,
});

module.exports = [
  // ESLint core recommended rules
  jsConfigs.recommended,

  // TypeScript plugin recommended
  ...compat.extends('plugin:@typescript-eslint/recommended'),

  // Apply rules to TypeScript files
  {
    files: ['src/**/*.ts'],
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
    },
    languageOptions: {
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
  },
];
