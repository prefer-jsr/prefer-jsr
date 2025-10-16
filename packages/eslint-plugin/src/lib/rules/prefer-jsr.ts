import type { MemberNode } from '@humanwhocodes/momoa';
import type { Rule } from 'eslint';

import { getJsrPackageInfo, toJsrDependency } from '@prefer-jsr/npm2jsr';

import { meetsMinimumVersion } from '../utils/version-compare.js';

interface PreferJsrOptions {
  /**
   * Custom mappings from NPM package names to JSR package names
   */
  customMappings?: Record<string, string>;
  /**
   * Packages to ignore (won't suggest JSR alternatives)
   */
  ignore?: string[];
  /**
   * Severity level for the rule
   */
  severity?: 'error' | 'warn';
}

export const preferJsrRule: Rule.RuleModule = {
  create(context) {
    // Only run on package.json files
    const filename = context.filename;
    if (!filename.endsWith('package.json')) {
      return {};
    }

    // Get rule options
    const options: PreferJsrOptions = context.options[0] || {};
    const customMappings = options.customMappings || {};
    const ignore = new Set(options.ignore || []);

    return {
      // Handle JSON Document > Object > Member pattern (for @eslint/json)
      'Document > Object > Member': (node: MemberNode) => {
        // Check if we're in a dependencies object
        if (
          node.name?.type === 'String' &&
          [
            'dependencies',
            'devDependencies',
            'optionalDependencies',
            'peerDependencies',
          ].includes(node.name.value) &&
          node.value?.type === 'Object'
        ) {
          // Iterate through dependency members
          for (const member of node.value.members || []) {
            if (
              member.name?.type === 'String' &&
              member.value?.type === 'String'
            ) {
              const npmPackage = member.name.value;
              const version = member.value.value;

              // Skip if package is in ignore list
              if (ignore.has(npmPackage)) {
                continue;
              }

              // Skip if it's already a JSR dependency
              if (version.startsWith('jsr:')) {
                continue;
              }

              // Check custom mappings first
              let jsrEquivalent: null | string =
                customMappings[npmPackage] || null;
              let shouldReport = !!jsrEquivalent;

              // If no custom mapping, check built-in mappings with version awareness
              if (!jsrEquivalent) {
                const packageInfo = getJsrPackageInfo(npmPackage);
                if (
                  packageInfo &&
                  meetsMinimumVersion(version, packageInfo.minimumVersion)
                ) {
                  jsrEquivalent = packageInfo.jsrPackage;
                  shouldReport = true;
                }
              }

              if (shouldReport && jsrEquivalent) {
                const jsrDependency = toJsrDependency(version);

                context.report({
                  data: {
                    jsrDependency,
                    jsrPackage: jsrEquivalent,
                    npmPackage,
                  },
                  fix(fixer) {
                    // Auto-fix: replace the NPM version with JSR version
                    return [
                      // Update the package name if it's different
                      ...(npmPackage !== jsrEquivalent
                        ? [
                            fixer.replaceText(
                              member.name as unknown as Rule.Node,
                              `"${jsrEquivalent}"`
                            ),
                          ]
                        : []),
                      // Update the version to JSR format
                      fixer.replaceText(
                        member.value as unknown as Rule.Node,
                        `"${jsrDependency}"`
                      ),
                    ];
                  },
                  messageId: 'preferJsr',
                  node: member.value as unknown as Rule.Node,
                });
              }
            }
          }
        }
      },
    };
  },
  meta: {
    defaultOptions: [{}],
    docs: {
      category: 'Best Practices',
      description: 'Prefer JSR packages over NPM when available',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      preferJsr:
        'Package "{{npmPackage}}" is available in JSR as "{{jsrPackage}}". Consider using JSR version: {{jsrDependency}}',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          customMappings: {
            additionalProperties: {
              type: 'string',
            },
            description:
              'Custom mappings from NPM package names to JSR package names',
            type: 'object',
          },
          ignore: {
            description:
              "Array of package names to ignore (won't suggest JSR alternatives)",
            items: {
              type: 'string',
            },
            type: 'array',
          },
          severity: {
            description: 'Severity level for the rule',
            enum: ['warn', 'error'],
            type: 'string',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
};
