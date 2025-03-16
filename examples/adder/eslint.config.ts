import eslint from '@eslint/js';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  reactRefresh.configs.vite,
  reactRefresh.configs.recommended,
  {
    ignores: [
      'node_modules/',
      'dist/',
      'test/',
      'bindings/',
      '**/*.test.ts',
      'eslint.config.js',
    ],
  },
  {
    files: ['src/**/*.js?(x)', 'src/**/*.ts?(x)'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
);
