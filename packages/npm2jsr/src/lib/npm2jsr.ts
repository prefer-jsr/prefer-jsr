/**
 * Metadata for NPM to JSR package mappings
 */
export interface JsrPackageInfo {
  /** The JSR package name */
  jsrPackage: string;
  /** Minimum version that has a JSR equivalent (e.g., "3.0.0") */
  minimumVersion: string;
  /** URL to the source code repository for reference. */
  sourceUrl?: string;
}

/**
 * Mapping of NPM package names to their JSR equivalents with metadata
 * Key: NPM package name
 * Value: JSR package information including version constraints
 *
 * @example
 * // To add a new mapping:
 * ['npm-package-name', {
 *   jsrPackage: '@scope/jsr-package-name',
 *   minimumVersion: '1.0.0',
 *   sourceUrl: 'https://github.com/author/repo',
 * }]
 */
export const npmToJsrMapping: Map<string, JsrPackageInfo> = new Map<
  string,
  JsrPackageInfo
>([
  [
    '@eslint/compat',
    {
      jsrPackage: '@eslint/compat',
      minimumVersion: '1.0.3',
      sourceUrl: 'https://github.com/eslint/rewrite',
    },
  ],
  [
    '@eslint/config-array',
    {
      jsrPackage: '@eslint/config-array',
      minimumVersion: '0.15.1',
      sourceUrl: 'https://github.com/eslint/rewrite',
    },
  ],
  [
    '@eslint/config-helpers',
    {
      jsrPackage: '@eslint/config-helpers',
      minimumVersion: '0.1.0',
      sourceUrl: 'https://github.com/eslint/rewrite',
    },
  ],
  [
    '@eslint/core',
    {
      jsrPackage: '@eslint/core',
      minimumVersion: '0.1.0',
      sourceUrl: 'https://github.com/eslint/rewrite',
    },
  ],
  [
    '@eslint/css',
    {
      jsrPackage: '@eslint/css',
      minimumVersion: '0.2.0',
      sourceUrl: 'https://github.com/eslint/css',
    },
  ],
  [
    '@eslint/json',
    {
      jsrPackage: '@eslint/json',
      minimumVersion: '0.2.0',
      sourceUrl: 'https://github.com/eslint/json',
    },
  ],
  [
    '@eslint/markdown',
    {
      jsrPackage: '@eslint/markdown',
      minimumVersion: '6.0.0',
      sourceUrl: 'https://github.com/eslint/markdown',
    },
  ],
  [
    '@eslint/object-schema',
    {
      jsrPackage: '@eslint/object-schema',
      minimumVersion: '2.1.3',
      sourceUrl: 'https://github.com/eslint/rewrite',
    },
  ],
  [
    '@eslint/plugin-kit',
    {
      jsrPackage: '@eslint/plugin-kit',
      minimumVersion: '0.2.1',
      sourceUrl: 'https://github.com/eslint/rewrite',
    },
  ],
  [
    '@hono/ajv-validator',
    {
      jsrPackage: '@hono/ajv-validator',
      minimumVersion: '0.0.1',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@hono/arktype-validator',
    {
      jsrPackage: '@hono/arktype-validator',
      minimumVersion: '2.0.1',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@hono/class-validator',
    {
      jsrPackage: '@hono/class-validator',
      minimumVersion: '1.0.0',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@hono/clerk-auth',
    {
      jsrPackage: '@hono/clerk-auth',
      minimumVersion: '3.0.3',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@hono/conform-validator',
    {
      jsrPackage: '@hono/conform-validator',
      minimumVersion: '1.0.0',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],

  [
    '@hono/effect-validator',
    {
      jsrPackage: '@hono/effect-validator',
      minimumVersion: '1.2.0',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@hono/esbuild-transpiler',
    {
      jsrPackage: '@hono/esbuild-transpiler',
      minimumVersion: '0.1.4',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],

  [
    '@hono/event-emitter',
    {
      jsrPackage: '@hono/event-emitter',
      minimumVersion: '2.0.0',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@hono/graphql-server',
    {
      jsrPackage: '@hono/graphql-server',
      minimumVersion: '0.6.1',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@hono/hello',
    {
      jsrPackage: '@hono/hello',
      minimumVersion: '0.1.2',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@hono/mcp',
    {
      jsrPackage: '@hono/mcp',
      minimumVersion: '0.1.0',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@hono/otel',
    {
      jsrPackage: '@hono/otel',
      minimumVersion: '0.2.2',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@hono/prometheus',
    {
      jsrPackage: '@hono/prometheus',
      minimumVersion: '1.0.2',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@hono/standard-validator',
    {
      jsrPackage: '@hono/standard-validator',
      minimumVersion: '0.1.2',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@hono/swagger-editor',
    {
      jsrPackage: '@hono/swagger-editor',
      minimumVersion: '1.0.1',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@hono/swagger-ui',
    {
      jsrPackage: '@hono/swagger-ui',
      minimumVersion: '0.5.2',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@hono/trpc-server',
    {
      jsrPackage: '@hono/trpc-server',
      minimumVersion: '0.3.4',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@hono/typebox-validator',
    {
      jsrPackage: '@hono/typebox-validator',
      minimumVersion: '0.3.3',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@hono/typia-validator',
    {
      jsrPackage: '@hono/typia-validator',
      minimumVersion: '0.1.2',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@hono/valibot-validator',
    {
      jsrPackage: '@hono/valibot-validator',
      minimumVersion: '0.5.2',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@hono/zod-validator',
    {
      jsrPackage: '@hono/zod-validator',
      minimumVersion: '0.7.0',
      sourceUrl: 'https://github.com/honojs/middleware',
    },
  ],
  [
    '@logtape/adaptor-pino',
    {
      jsrPackage: '@logtape/adaptor-pino',
      minimumVersion: '1.0.0',
      sourceUrl: 'https://github.com/dahlia/logtape',
    },
  ],
  [
    '@logtape/adaptor-winston',
    {
      jsrPackage: '@logtape/adaptor-winston',
      minimumVersion: '1.0.0',
      sourceUrl: 'https://github.com/dahlia/logtape',
    },
  ],
  [
    '@logtape/cloudwatch-logs',
    {
      jsrPackage: '@logtape/cloudwatch-logs',
      minimumVersion: '1.0.0',
      sourceUrl: 'https://github.com/dahlia/logtape',
    },
  ],
  [
    '@logtape/drizzle-orm',
    {
      jsrPackage: '@logtape/drizzle-orm',
      minimumVersion: '1.3.0',
      sourceUrl: 'https://github.com/dahlia/logtape',
    },
  ],
  [
    '@logtape/express',
    {
      jsrPackage: '@logtape/express',
      minimumVersion: '1.3.0',
      sourceUrl: 'https://github.com/dahlia/logtape',
    },
  ],
  [
    '@logtape/fastify',
    {
      jsrPackage: '@logtape/fastify',
      minimumVersion: '1.3.0',
      sourceUrl: 'https://github.com/dahlia/logtape',
    },
  ],
  [
    '@logtape/file',
    {
      jsrPackage: '@logtape/file',
      minimumVersion: '0.9.0',
      sourceUrl: 'https://github.com/dahlia/logtape',
    },
  ],
  [
    '@logtape/hono',
    {
      jsrPackage: '@logtape/hono',
      minimumVersion: '1.3.0',
      sourceUrl: 'https://github.com/dahlia/logtape',
    },
  ],
  [
    '@logtape/koa',
    {
      jsrPackage: '@logtape/koa',
      minimumVersion: '1.3.0',
      sourceUrl: 'https://github.com/dahlia/logtape',
    },
  ],
  [
    '@logtape/logtape',
    {
      jsrPackage: '@logtape/logtape',
      minimumVersion: '0.1.0',
      sourceUrl: 'https://github.com/dahlia/logtape',
    },
  ],
  [
    '@logtape/otel',
    {
      jsrPackage: '@logtape/otel',
      minimumVersion: '0.1.0',
      sourceUrl: 'https://github.com/dahlia/logtape',
    },
  ],
  [
    '@logtape/pretty',
    {
      jsrPackage: '@logtape/pretty',
      minimumVersion: '1.0.0',
      sourceUrl: 'https://github.com/dahlia/logtape',
    },
  ],
  [
    '@logtape/redaction',
    {
      jsrPackage: '@logtape/redaction',
      minimumVersion: '0.10.0',
      sourceUrl: 'https://github.com/dahlia/logtape',
    },
  ],
  [
    '@logtape/sentry',
    {
      jsrPackage: '@logtape/sentry',
      minimumVersion: '0.1.0',
      sourceUrl: 'https://github.com/dahlia/logtape',
    },
  ],
  [
    '@logtape/syslog',
    {
      jsrPackage: '@logtape/syslog',
      minimumVersion: '0.12.0',
      sourceUrl: 'https://github.com/dahlia/logtape',
    },
  ],
  [
    '@logtape/windows-eventlog',
    {
      jsrPackage: '@logtape/windows-eventlog',
      minimumVersion: '1.0.0',
      sourceUrl: 'https://github.com/dahlia/logtape',
    },
  ],
  [
    '@openai/openai',
    {
      jsrPackage: '@openai/openai',
      minimumVersion: '4.47.1',
      sourceUrl: 'https://github.com/openai/openai-node',
    },
  ],
  [
    '@prefer-jsr/eslint-plugin-prefer-jsr',
    {
      jsrPackage: '@prefer-jsr/eslint-plugin-prefer-jsr',
      minimumVersion: '0.1.0',
      sourceUrl: 'https://github.com/prefer-jsr/prefer-jsr',
    },
  ],
  [
    '@prefer-jsr/npm2jsr',
    {
      jsrPackage: '@prefer-jsr/npm2jsr',
      minimumVersion: '0.1.0',
      sourceUrl: 'https://github.com/prefer-jsr/prefer-jsr',
    },
  ],
  [
    '@supabase/functions-js',
    {
      jsrPackage: '@supabase/functions-js',
      minimumVersion: '2.85.0',
      sourceUrl:
        'https://github.com/supabase/supabase-js/tree/master/packages/core/functions-js',
    },
  ],
  [
    '@supabase/supabase-js',
    {
      jsrPackage: '@supabase/supabase-js',
      minimumVersion: '2.85.0',
      sourceUrl: 'https://github.com/supabase/supabase-js',
    },
  ],
  [
    'es-toolkit',
    {
      jsrPackage: '@es-toolkit/es-toolkit',
      minimumVersion: '1.6.0',
      sourceUrl: 'https://github.com/toss/es-toolkit',
    },
  ],
  [
    'hono',
    {
      jsrPackage: '@hono/hono',
      minimumVersion: '4.4.0',
      sourceUrl: 'https://github.com/honojs/hono',
    },
  ],
  [
    'zod',
    {
      jsrPackage: '@zod/zod',
      minimumVersion: '3.0.0',
      sourceUrl: 'https://github.com/colinhacks/zod',
    },
  ],
]);

/**
 * Get all available NPM packages that have JSR equivalents
 * @returns Array of NPM package names that have JSR mappings
 */
export function getAvailableNpmPackages(): string[] {
  return Array.from(npmToJsrMapping.keys());
}

/**
 * Get the JSR package name for an NPM package
 * @param npmPackage The NPM package name
 * @returns The JSR package name (without jsr: prefix) or null if no mapping exists
 */
export function getJsrEquivalent(npmPackage: string): null | string {
  const info = npmToJsrMapping.get(npmPackage);
  return info ? info.jsrPackage : null;
}

/**
 * Get full package information for an NPM package
 * @param npmPackage The NPM package name
 * @returns The JSR package information or null if no mapping exists
 */
export function getJsrPackageInfo(npmPackage: string): JsrPackageInfo | null {
  return npmToJsrMapping.get(npmPackage) || null;
}

/**
 * Check if an NPM package has a JSR equivalent
 * @param npmPackage The NPM package name
 * @returns True if a JSR equivalent exists
 */
export function hasJsrEquivalent(npmPackage: string): boolean {
  return npmToJsrMapping.has(npmPackage);
}

/**
 * Convert a version range to JSR format
 * @param version The NPM version range (e.g., "^4.1.12")
 * @returns The complete JSR dependency string (e.g., "jsr:^4.1.12")
 */
export function toJsrDependency(version: string): string {
  return `jsr:${version}`;
}
