/**
 * ESLint Flat Configuration (ESLint v9+)
 *
 * This is the central linting configuration for the Cypress test framework.
 * It uses the "flat config" format introduced in ESLint v9, replacing the
 * legacy .eslintrc.json format. Flat config uses a single array of config
 * objects that are applied in order -- later objects override earlier ones
 * for matching files.
 *
 * KEY CONCEPTS:
 *
 * - Each object in the exported array is a "config block" that can specify
 *   which files it applies to, which plugins to use, and which rules to
 *   enforce.
 *
 * - The "files" property uses glob patterns to scope rules to specific files.
 *   Without a "files" property, the config block applies globally.
 *
 * - Plugins are imported as ES modules and assigned keys in the "plugins"
 *   object. Rules from a plugin are referenced as "pluginKey/rule-name".
 *
 * - The typescript-eslint package provides a helper (tseslint.config()) that
 *   handles parser setup and type-aware linting configuration.
 */

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import cypressPlugin from 'eslint-plugin-cypress/flat';

export default tseslint.config(
  // -------------------------------------------------------------------------
  // BASE CONFIGS: ESLint recommended + TypeScript recommended
  // -------------------------------------------------------------------------
  // These provide a solid foundation of rules that catch common JavaScript
  // and TypeScript mistakes (undefined variables, unused imports, unsafe
  // type operations, etc.).
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // -------------------------------------------------------------------------
  // CYPRESS PLUGIN: Cypress-specific recommended rules
  // -------------------------------------------------------------------------
  // Prevents common Cypress mistakes like arbitrary cy.wait() timeouts,
  // missing assertions on Cypress commands, and unsafe-to-chain commands.
  cypressPlugin.configs.recommended,

  // -------------------------------------------------------------------------
  // PROJECT-WIDE SETTINGS
  // -------------------------------------------------------------------------
  // Applies TypeScript parser options and custom rules to all TypeScript
  // files in the cypress directory. This matches the scope of the lint
  // npm script: eslint 'cypress/**/*.ts'.
  {
    files: ['cypress/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      // -- TypeScript-specific rules --

      // Allow triple-slash reference directives for path imports. The support
      // files (commands.ts, e2e.ts) use /// <reference path="..." /> to import
      // custom type declarations. The recommended config disables this by
      // default, but path references are the standard pattern for Cypress
      // type augmentation files.
      '@typescript-eslint/triple-slash-reference': ['error', { path: 'always', types: 'prefer-import', lib: 'always' }],

      // Disable the unsafe-to-chain-command rule. Cypress chains like
      // cy.get('#input').clear().type('text') are safe and idiomatic despite
      // the plugin flagging .clear().type() as potentially unsafe. This rule
      // was not present in eslint-plugin-cypress v3 and generates false
      // positives for common Cypress patterns in this codebase.
      'cypress/unsafe-to-chain-command': 'off',

      // Flag unused variables as errors, but allow underscore-prefixed args
      // (e.g., _event) which are intentionally unused parameters.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // Warn when functions lack explicit return type annotations. This
      // encourages self-documenting code but doesn't block commits.
      '@typescript-eslint/explicit-function-return-type': 'warn',

      // Forbid the 'any' type. Forces proper typing throughout the codebase,
      // catching type errors that 'any' would silently allow through.
      '@typescript-eslint/no-explicit-any': 'error',

      // Forbid non-null assertions (variable!). These bypass TypeScript's
      // null safety and can cause runtime errors.
      '@typescript-eslint/no-non-null-assertion': 'error',

      // -- General JavaScript rules --

      // Warn on console.log statements. Tests should use Cypress commands
      // for logging (cy.log()) rather than browser console output.
      'no-console': 'warn',

      // Require 'const' for variables that are never reassigned.
      'prefer-const': 'error',

      // Forbid 'var' declarations. Use 'let' or 'const' instead for
      // proper block scoping.
      'no-var': 'error',

      // Require strict equality (=== and !==). Loose equality (== and !=)
      // performs type coercion which leads to subtle bugs.
      'eqeqeq': ['error', 'always'],

      // Require curly braces for all control flow statements, even single-
      // line ones. Prevents bugs when adding lines to if/else/for blocks.
      'curly': ['error', 'all'],

      // Warn when lines exceed 120 characters, but ignore strings and
      // template literals which often contain long URLs or messages.
      'max-len': ['warn', { code: 120, ignoreStrings: true, ignoreTemplateLiterals: true }],
    },
  },

  // -------------------------------------------------------------------------
  // CYPRESS CONFIG FILE OVERRIDE
  // -------------------------------------------------------------------------
  // The cypress.config.ts file uses require() for the Mochawesome reporter
  // plugin because setupNodeEvents runs in a CommonJS context. This override
  // disables the no-require-imports rule for that specific file.
  {
    files: ['cypress.config.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
