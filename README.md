# Cypress E2E Framework - Login Page Tests

Comprehensive end-to-end test framework built with Cypress and TypeScript, using the Page Object Model (POM) design pattern. Tests cover the login functionality at `https://the-internet.herokuapp.com/login` with multi-browser support, parallel execution, and CI/CD integration.

## Overview

This framework demonstrates enterprise-grade E2E test automation with thorough coverage across three categories: positive authentication flows, negative/security edge cases, and UI element validation. Built with TypeScript strict mode for type safety, the Page Object Model for maintainability, and Mochawesome for rich HTML reporting.

**Key Features:**
- Type-safe test authoring with TypeScript strict mode
- Page Object Model architecture for clean separation of concerns
- Data-driven testing with externalized fixtures
- Multi-browser support: Chrome, Firefox, Edge
- Parallel spec execution via `cypress-parallel`
- Rich HTML reports with embedded screenshots and charts
- CI/CD pipeline with GitHub Actions matrix strategy
- Security input validation (SQL injection, XSS)

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Cypress | ~13.17.x | E2E testing framework |
| TypeScript | ~5.7.x | Type-safe test authoring with strict mode |
| cypress-mochawesome-reporter | ^3.8.x | HTML reports with embedded screenshots |
| cypress-parallel | ^0.14.x | Parallel spec file execution |
| ESLint | ^8.57.x | Code quality with TypeScript and Cypress rules |
| GitHub Actions | - | CI/CD with matrix browser strategy |

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- One or more browsers installed locally: Chrome, Firefox, or Edge

## Installation

```bash
npm install
```

## Configuration

Test credentials are stored in `cypress.env.json` (committed to the repository):

```json
{
  "LOGIN_USERNAME": "tomsmith",
  "LOGIN_PASSWORD": "SuperSecretPassword!"
}
```

Cypress automatically loads this file and exposes values via `Cypress.env()`. Credentials can also be overridden with environment variables prefixed with `CYPRESS_` (e.g., `CYPRESS_LOGIN_USERNAME`).

## Usage

### Interactive Mode (Test Runner GUI)

```bash
npm run cy:open
```

### Run Tests by Browser (Headless)

```bash
npm run cy:run:chrome     # Chrome headless
npm run cy:run:firefox    # Firefox headless
npm run cy:run:edge       # Edge headless
```

### Run All Browsers Sequentially

```bash
npm run cy:run:all-browsers
```

### Parallel Execution

```bash
npm run cy:run:parallel           # Default browser, 3 threads
npm run cy:run:parallel:chrome    # Chrome, 3 threads
```

### Linting and Type Checking

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
npm run typecheck   # TypeScript type validation
```

---

## Project Structure

```
cypress-framework/
├── .github/
│   └── workflows/
│       └── cypress-tests.yml
├── cypress/
│   ├── e2e/
│   │   └── login/
│   │       ├── login.cy.ts
│   │       ├── login-negative.cy.ts
│   │       └── login-ui.cy.ts
│   ├── fixtures/
│   │   ├── users.json
│   │   └── messages.json
│   ├── pages/
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   └── SecureAreaPage.ts
│   └── support/
│       ├── commands.ts
│       ├── e2e.ts
│       └── types/
│           └── cypress.d.ts
├── cypress.config.ts
├── cypress.env.json
├── package.json
├── tsconfig.json
├── .gitignore
├── .eslintrc.json
├── CYPRESS-CLI.md
└── README.md
```

---

## Folder and File Reference

### Root Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Defines project dependencies (Cypress, TypeScript, reporters, linters) and npm scripts for running tests across browsers, parallel execution, report generation, linting, and type checking. |
| `tsconfig.json` | TypeScript compiler configuration with strict mode enabled, path aliases (`@pages/*`, `@fixtures/*`, `@support/*`), and target ES2021. Ensures type safety across all test and page object files. |
| `cypress.config.ts` | Central Cypress configuration: sets `baseUrl` to the application under test, configures Mochawesome reporter options (charts, embedded screenshots, inline assets), retry strategy (2 retries in CI, 0 in interactive), timeouts (10s command, 30s page load), video recording, and viewport dimensions (1280x720). |
| `cypress.env.json` | Externalized test credentials (`LOGIN_USERNAME`, `LOGIN_PASSWORD`). Committed to the repository for convenience. Cypress automatically loads this file and exposes values via `Cypress.env()`. Can be overridden with `CYPRESS_` prefixed environment variables. |
| `.eslintrc.json` | ESLint configuration with TypeScript parser, `@typescript-eslint` plugin for strict typing rules, and `eslint-plugin-cypress` for Cypress-specific best practices (e.g., no unnecessary waits). |
| `.gitignore` | Excludes `node_modules/`, Cypress artifacts (`screenshots/`, `videos/`, `reports/`), IDE files, and OS-specific files from version control. |

### `.github/workflows/`

| File | Purpose |
|------|---------|
| `cypress-tests.yml` | GitHub Actions CI/CD pipeline. Uses a matrix strategy to run tests concurrently across Chrome, Firefox, and Edge. Configured with `fail-fast: false` so all browser jobs complete even if one fails. Injects credentials from repository secrets, uploads screenshots on failure, and always uploads videos and Mochawesome reports as artifacts with configurable retention. |

### `cypress/e2e/login/` - Test Specifications

This folder contains all test spec files organized by test category. Cypress discovers and runs all `*.cy.ts` files in this directory.

| File | Tests | Purpose |
|------|-------|---------|
| `login.cy.ts` | 6 | **Core positive flows.** Tests successful login with valid credentials, success message verification, logout button visibility, logout flow with message verification, redirect back to login after logout, and a full authentication lifecycle (login -> secure area -> logout -> re-login). |
| `login-negative.cy.ts` | 13 | **Negative and edge cases.** Tests invalid username, invalid password, both invalid, empty fields (all combinations), SQL injection attempt, XSS script injection attempt, extremely long input strings, special characters, whitespace-only input, and data-driven case sensitivity validation using parameterized test data. |
| `login-ui.cy.ts` | 19 | **UI validation and navigation.** Tests page heading and subheading text, presence and visibility of all form elements, input field attributes (`type`, `name`), form `action` and `method` attributes, typing and clearing behavior, password masking, keyboard navigation (Enter key submission, Tab between fields), URL correctness, and unauthorized access redirect (`/secure` without auth redirects to `/login`). |

### `cypress/fixtures/` - Test Data

Fixtures provide externalized, reusable test data that is loaded into tests via `cy.fixture()`. This keeps test logic clean and makes data changes easy without modifying test code.

| File | Purpose |
|------|---------|
| `users.json` | Contains all test user credential sets: valid user (`tomsmith`/`SuperSecretPassword!`), invalid username, invalid password, both invalid, empty credentials, SQL injection payloads (`' OR '1'='1`), XSS payloads (`<script>alert('xss')</script>`), 256-character long strings, special characters, whitespace-only strings, and a case sensitivity array with 5 variations for data-driven testing. |
| `messages.json` | Contains all expected flash messages and page text for assertions: login success message, logout success message, invalid username error, invalid password error, secure area heading, login page heading, and login page subheading text. |

### `cypress/pages/` - Page Object Model

Page Objects encapsulate page-specific selectors, actions, and assertions into reusable classes. This pattern provides a single place to update selectors when the UI changes, keeping tests readable and maintainable.

| File | Purpose |
|------|---------|
| `BasePage.ts` | **Abstract base class** inherited by all page objects. Provides common methods: `visit()` navigates to the page URL, `verifyUrlContains()` asserts URL path fragments, `getCurrentUrl()` returns the current URL, `isElementVisible()` checks element visibility, and `getPageTitle()` returns the document title. Each page object declares its own `url` property. |
| `LoginPage.ts` | **Login page representation.** Defines private CSS selector constants for all login form elements (`#login`, `#username`, `#password`, `button[type="submit"]`, `#flash`, `h2`, `h4`). Exposes typed element accessors as getters (`usernameInput`, `passwordInput`, `submitButton`, `flashMessage`, `heading`, `subheading`). Provides action methods (`login()`, `typeUsername()`, `typePassword()`, `clickSubmit()`, `submitWithEnterKey()`) and assertion methods (`verifyFlashMessage()`, `verifyFlashClass()`, `verifyPageLoaded()`, `verifyFormAttributes()`). |
| `SecureAreaPage.ts` | **Secure area page representation.** Defines selectors for the authenticated page (`h2` heading, `#flash` messages, `a.button[href="/logout"]`). Provides `clickLogout()` action, flash message verification methods, and `verifyPageLoaded()` which asserts both the heading text and logout button visibility. |

### `cypress/support/` - Framework Infrastructure

Support files provide shared utilities, custom commands, type declarations, and global configuration that runs before every test.

| File | Purpose |
|------|---------|
| `e2e.ts` | **Cypress support entry point.** Loaded automatically before every spec file. Imports custom commands from `commands.ts`, registers the Mochawesome reporter, and configures a global `uncaught:exception` handler that prevents tests from failing on known application-level JavaScript errors from herokuapp (e.g., null reference errors, script errors). |
| `commands.ts` | **Custom Cypress commands.** Extends `cy` with reusable commands: `cy.login(username, password)` navigates to `/login` and submits the form; `cy.logout()` clicks the logout button; `cy.verifyFlashMessage(text)` asserts flash message content; `cy.verifyFlashClass(class)` asserts flash message CSS class. These commands simplify test setup and reduce code duplication. |
| `types/cypress.d.ts` | **TypeScript type declarations.** Extends the `Cypress.Chainable` interface to provide IntelliSense and compile-time type checking for all custom commands (`login`, `logout`, `verifyFlashMessage`, `verifyFlashClass`). Without this file, TypeScript would report errors when using custom commands. |

---

## Test Coverage Summary

| Category | Tests | Spec File |
|----------|-------|-----------|
| Successful Login | 2 | login.cy.ts |
| Logout Flow | 3 | login.cy.ts |
| Authentication Lifecycle | 1 | login.cy.ts |
| Invalid Credentials | 3 | login-negative.cy.ts |
| Empty Fields | 3 | login-negative.cy.ts |
| Security Inputs | 2 | login-negative.cy.ts |
| Boundary/Edge Cases | 4 | login-negative.cy.ts |
| Data-Driven (Case Sensitivity) | 1 | login-negative.cy.ts |
| Page Elements | 4 | login-ui.cy.ts |
| Form Attributes | 5 | login-ui.cy.ts |
| Input Behavior | 5 | login-ui.cy.ts |
| Keyboard Navigation | 2 | login-ui.cy.ts |
| URL/Navigation | 3 | login-ui.cy.ts |
| **Total** | **~38** | **3 spec files** |

---

## CI/CD Pipeline

GitHub Actions runs tests across Chrome, Firefox, and Edge concurrently using a matrix strategy.

**Pipeline Flow:**

```
Push/PR --> Install Dependencies --> Create Env Config --> Run Cypress Tests
                                                              |
                                                    +---------+---------+
                                                    |         |         |
                                                  Chrome   Firefox    Edge
                                                    |         |         |
                                                    v         v         v
                                              Upload Artifacts (screenshots, videos, reports)
```

- **Trigger**: Push to `main`/`develop`, pull requests to `main`, manual dispatch
- **Strategy**: `fail-fast: false` ensures all browser jobs complete regardless of individual failures
- **Artifacts**: Screenshots uploaded on failure; videos and Mochawesome reports uploaded always
- **Secrets**: `LOGIN_USERNAME` and `LOGIN_PASSWORD` injected from GitHub repository secrets

---

## Reports

After a test run, Mochawesome HTML reports are generated in `cypress/reports/`. Reports include:
- Test results with pass/fail status and duration
- Embedded screenshots for failed tests
- Charts showing pass/fail distribution
- Full test output and error messages

To open the report in your browser after a test run:

```bash
npm run cy:report
```

---

## Quick Verification

```bash
npm install                   # Install dependencies
npm run cy:run:chrome         # Run all tests in Chrome headless
npm run cy:run:all-browsers   # Full cross-browser validation
npm run cy:open               # Open interactive Test Runner
```
