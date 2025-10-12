import type { ESLint } from 'eslint';
import { preferJsrRule } from './rules/prefer-jsr.js';

const plugin: ESLint.Plugin = {
  meta: {
    name: '@prefer-jsr/eslint-plugin-prefer-jsr',
    version: '0.0.1',
  },
  rules: {
    'prefer-jsr': preferJsrRule,
  },
};

export default plugin;
