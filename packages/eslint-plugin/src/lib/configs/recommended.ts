import { type Linter } from 'eslint';

export function recommendedConfig(): Linter.Config {
  return {
    files: ['**/package.json'],
    language: 'json/json',
    name: 'prefer-jsr/recommended',
    rules: {
      'prefer-jsr/prefer-jsr': 'error',
    },
  };
}
