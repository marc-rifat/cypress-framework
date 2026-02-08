# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Workflow Rules

- Only **commit** when the user explicitly asks to commit. Never commit proactively.
- Only **push** when the user explicitly asks to push. Never push proactively.
- Never add a co-author tag (Co-Authored-By) to commit messages.
- Always write **detailed commit messages**: use a concise subject line following Conventional Commits format (feat/fix/docs/chore), followed by a blank line and a body that explains **what** changed, **why** it changed, and lists specific files or areas affected. The body should be thorough enough that someone reading the git log can understand the full scope of the change without looking at the diff.

## Commands

```bash
# Run tests
npm run cy:run                  # All tests, default browser (Electron)
npm run cy:run:chrome           # All tests in Chrome headless
npm run cy:run:firefox          # Firefox headless
npm run cy:run:edge             # Edge headless
npm run cy:run:all-browsers     # Chrome + Firefox + Edge sequentially
npm run cy:run:parallel         # 3 threads across spec files
npm run cy:run:parallel:chrome  # Parallel in Chrome

# Run a single spec
npx cypress run --spec "cypress/e2e/login/login.cy.ts"
npx cypress run --browser chrome --spec "cypress/e2e/login/login-negative.cy.ts"

# Interactive mode
npm run cy:open

# Linting and types
npm run lint                    # ESLint check
npm run lint:fix                # ESLint auto-fix
npm run typecheck               # TypeScript type validation (tsc --noEmit)

# Reports (after test run)
npm run cy:report               # Opens the Mochawesome HTML report in browser
```

## Architecture

**Page Object Model (POM)** -- all page interaction is encapsulated in classes under `cypress/pages/`:

- `BasePage` (abstract) -- provides `visit()`, `verifyUrlContains()`, `isElementVisible()`, `getPageTitle()`. Each subclass declares its own `url` property.
- `LoginPage extends BasePage` -- selectors in a `SELECTORS` const object, element access via TypeScript getters (`usernameInput`, `passwordInput`, `submitButton`, `flashMessage`, `heading`, `subheading`). Action methods: `login()`, `typeUsername()`, `typePassword()`, `clickSubmit()`, `submitWithEnterKey()`. Assertion methods: `verifyFlashMessage()`, `verifyFlashClass()`, `verifyPageLoaded()`, `verifyFormAttributes()`.
- `SecureAreaPage extends BasePage` -- logout and flash message interaction for the authenticated `/secure` page.

**Test specs** are in `cypress/e2e/login/` (3 files, 38 tests):
- `login.cy.ts` -- positive auth flows and lifecycle (6 tests)
- `login-negative.cy.ts` -- invalid credentials, empty fields, security inputs (SQLi, XSS), boundary cases, data-driven case sensitivity (13 tests)
- `login-ui.cy.ts` -- form elements, attributes, input behavior, keyboard nav, URL validation (19 tests)

**Custom Cypress commands** (`cypress/support/commands.ts`): `cy.login()`, `cy.logout()`, `cy.verifyFlashMessage()`, `cy.verifyFlashClass()`. Type declarations in `cypress/support/types/cypress.d.ts` extending `Cypress.Chainable`.

**Test data** is externalized in fixtures: `users.json` (credential sets including edge cases) and `messages.json` (expected flash messages and page text).

## Key Conventions

- **Credentials**: stored in `cypress.env.json` (committed to repo), accessed via `Cypress.env('LOGIN_USERNAME')`. Can be overridden with `CYPRESS_` prefixed environment variables. In CI, also injected from GitHub repository secrets.
- **Selectors**: defined as `const SELECTORS = { ... } as const` at top of each page object file. Use semantic selectors (`#username`, `#flash`, `button[type="submit"]`).
- **Element getters**: use TypeScript `get` accessors returning `Cypress.Chainable<JQuery<HTMLElement>>` (or `HTMLHeadingElement` for `h2` elements).
- **Uncaught exceptions**: `e2e.ts` suppresses known herokuapp errors (`Cannot read properties of null`, `Script error`) to prevent false test failures.
- **ESLint**: strict TypeScript rules -- `no-explicit-any` is error, `explicit-function-return-type` is warn, max line length 120. The `require()` call in `cypress.config.ts` setupNodeEvents needs `@typescript-eslint/no-require-imports` disable comment.
- **Retries**: 2 in `runMode`, 0 in `openMode`.
- **Reporter**: Mochawesome with `overwrite: true` generates a single `index.html` per run. The reporter handles merging internally -- no manual merge step needed.
- **Path aliases**: `@pages/*`, `@fixtures/*`, `@support/*` defined in tsconfig but not used in imports (standard relative imports used throughout).
- **tsconfig.json**: Do not add custom keys inside `compilerOptions` -- Cypress's TypeScript processor does not handle unknown keys well and it breaks `require()` in setupNodeEvents.

## Adding a New Page Object

1. Create `cypress/pages/NewPage.ts` extending `BasePage`
2. Define a `SELECTORS` const object for all CSS selectors
3. Set `protected readonly url = '/path'`
4. Expose elements via `get` accessors, actions as methods, assertions as `verify*()` methods

## Adding a Custom Command

1. Add the command implementation in `cypress/support/commands.ts`
2. Add the type declaration in `cypress/support/types/cypress.d.ts` inside the `Cypress.Chainable` interface
3. Both files must stay in sync or TypeScript will error

## CI/CD

GitHub Actions (`.github/workflows/cypress-tests.yml`) runs on push to `main` and via manual dispatch from the Actions tab. Matrix strategy across Chrome, Firefox, Edge with `fail-fast: false`. Firefox is pinned to version 131 via `browser-actions/setup-firefox` to avoid CDP connection failures with newer Firefox versions. Uploads screenshots (on failure), videos, and Mochawesome reports as artifacts.
