// wecare-app/.eslintrc.js
module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  overrides: [
    {
      files: ['auth-service/src/**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './auth-service/tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        'no-console': 'off',
      },
    },
  ],
};
