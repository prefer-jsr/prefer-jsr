import type { MemberNode } from '@humanwhocodes/momoa';
import type { Rule } from 'eslint';
import type { AST } from 'jsonc-eslint-parser';

import { getJsrPackageInfo, toJsrDependency } from '@prefer-jsr/npm2jsr';

import { meetsMinimumVersion } from '../utils/version-compare.js';

interface PreferJsrOptions {
  /**
   * Packages to ignore (won't suggest JSR alternatives)
   */
  ignore?: string[];
}

export const preferJsrRule: Rule.RuleModule = {
  create(context): Rule.RuleListener {
    // Only run on package.json files
    const filename = context.filename;
    if (!filename.endsWith('package.json')) {
      return {};
    }

    // Get rule options
    const options: PreferJsrOptions = context.options[0] || {};
    const ignore = new Set(options.ignore || []);

    /**
     * Common logic for checking and reporting JSR equivalents
     */
    function checkDependency(
      npmPackage: string,
      version: string,
      packageNameNode: Rule.Node,
      versionNode: Rule.Node
    ) {
      // Skip if package is in ignore list
      if (ignore.has(npmPackage)) {
        return;
      }

      // Skip if it's already a JSR dependency
      if (version.startsWith('jsr:')) {
        return;
      }

      // Check built-in mappings with version awareness
      const packageInfo = getJsrPackageInfo(npmPackage);
      if (
        !packageInfo ||
        !meetsMinimumVersion(version, packageInfo.minimumVersion)
      ) {
        return;
      }

      const jsrEquivalent = packageInfo.jsrPackage;
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
              ? [fixer.replaceText(packageNameNode, `"${jsrEquivalent}"`)]
              : []),
            // Update the version to JSR format
            fixer.replaceText(versionNode, `"${jsrDependency}"`),
          ];
        },
        messageId: 'preferJsr',
        node: versionNode,
      });
    }

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

              checkDependency(
                npmPackage,
                version,
                member.name as unknown as Rule.Node,
                member.value as unknown as Rule.Node
              );
            }
          }
        }
      },

      // Handle JSONProperty pattern (for legacy jsonc-eslint-parser)
      JSONProperty(node: AST.JSONProperty) {
        // Check if this is a property in a dependencies object
        const parent = node.parent as AST.JSONObjectExpression | undefined;
        const grandparent = parent?.parent as AST.JSONProperty | undefined;

        if (
          grandparent?.key &&
          grandparent.key.type === 'JSONLiteral' &&
          typeof grandparent.key.value === 'string' &&
          [
            'dependencies',
            'devDependencies',
            'optionalDependencies',
            'peerDependencies',
          ].includes(grandparent.key.value) &&
          node.key.type === 'JSONLiteral' &&
          typeof node.key.value === 'string' &&
          node.value.type === 'JSONLiteral' &&
          typeof node.value.value === 'string'
        ) {
          const npmPackage = node.key.value;
          const version = node.value.value;

          checkDependency(
            npmPackage,
            version,
            node.key as unknown as Rule.Node,
            node.value as unknown as Rule.Node
          );
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
          ignore: {
            description:
              "Array of package names to ignore (won't suggest JSR alternatives)",
            items: {
              type: 'string',
            },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
};
