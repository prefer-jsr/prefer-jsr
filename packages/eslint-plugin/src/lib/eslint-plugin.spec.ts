import { eslintPlugin } from './eslint-plugin.js';

describe('eslintPlugin', () => {
  it('should work', () => {
    expect(eslintPlugin()).toEqual('eslint-plugin');
  });
});
