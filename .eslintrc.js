module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // project: './tsconfig.json',
    ecmaFeatures: { jsx: true }
  },
  plugins: ['@typescript-eslint', 'react'],
  settings: {
    react: { version: 'detect' },
  },
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    'react/prop-types': 'off',
    'react/jsx-no-target-blank': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  }
};