# Cypress CLI Reference

Complete reference for Cypress command-line interface commands, flags, and configuration options.

---

## Table of Contents

- [Opening Cypress (Interactive Mode)](#opening-cypress-interactive-mode)
- [Running Tests (Headless)](#running-tests-headless)
- [Browser Selection](#browser-selection)
- [Spec File Selection](#spec-file-selection)
- [Configuration Overrides](#configuration-overrides)
- [Environment Variables](#environment-variables)
- [Recording and Dashboard](#recording-and-dashboard)
- [Reporter Options](#reporter-options)
- [Debugging](#debugging)
- [Other Commands](#other-commands)
- [Project npm Scripts](#project-npm-scripts)

---

## Opening Cypress (Interactive Mode)

Launch the Cypress Test Runner GUI for interactive test execution and debugging.

```bash
# Open Test Runner with default settings
npx cypress open

# Open with a specific browser
npx cypress open --browser chrome
npx cypress open --browser firefox
npx cypress open --browser edge
npx cypress open --browser electron

# Open with a specific config file
npx cypress open --config-file cypress.config.ts

# Open with a specific project path
npx cypress open --project /path/to/project

# Open E2E testing directly (skip launchpad)
npx cypress open --e2e

# Open Component testing directly
npx cypress open --component
```

---

## Running Tests (Headless)

Execute tests in headless mode for CI/CD or command-line execution.

```bash
# Run all tests with default browser (Electron)
npx cypress run

# Run and exit with specific exit code on failure
npx cypress run --exit

# Run with headed browser (visible browser window)
npx cypress run --headed

# Run without video recording
npx cypress run --no-video

# Run with specific viewport dimensions
npx cypress run --config viewportWidth=1920,viewportHeight=1080
```

---

## Browser Selection

Specify which browser Cypress should use for test execution.

```bash
# Built-in browsers
npx cypress run --browser chrome
npx cypress run --browser firefox
npx cypress run --browser edge
npx cypress run --browser electron

# Chrome variants
npx cypress run --browser chrome
npx cypress run --browser chrome:canary
npx cypress run --browser chromium

# Use browser by path (custom installation)
npx cypress run --browser /usr/bin/google-chrome-stable

# List detected browsers
npx cypress info
```

**Supported Browsers:**

| Browser | Flag | Notes |
|---------|------|-------|
| Chrome | `--browser chrome` | Most common for E2E testing |
| Firefox | `--browser firefox` | Good for cross-browser validation |
| Edge | `--browser edge` | Chromium-based, similar to Chrome |
| Electron | `--browser electron` | Default, bundled with Cypress |
| Chromium | `--browser chromium` | Open-source Chrome base |

---

## Spec File Selection

Run specific test files or patterns instead of the entire suite.

```bash
# Run a single spec file
npx cypress run --spec "cypress/e2e/login/login.cy.ts"

# Run multiple spec files (comma-separated)
npx cypress run --spec "cypress/e2e/login/login.cy.ts,cypress/e2e/login/login-negative.cy.ts"

# Run specs matching a glob pattern
npx cypress run --spec "cypress/e2e/login/*.cy.ts"

# Run specs in a specific folder
npx cypress run --spec "cypress/e2e/**/*.cy.ts"

# Combine with browser selection
npx cypress run --browser chrome --spec "cypress/e2e/login/login.cy.ts"
```

---

## Configuration Overrides

Override `cypress.config.ts` settings directly from the CLI.

```bash
# Override baseUrl
npx cypress run --config baseUrl=https://staging.example.com

# Override multiple config values (comma-separated)
npx cypress run --config baseUrl=https://staging.example.com,viewportWidth=1920,viewportHeight=1080

# Override timeouts
npx cypress run --config defaultCommandTimeout=15000,pageLoadTimeout=60000

# Override retry behavior
npx cypress run --config retries=3

# Separate run and open mode retries
npx cypress run --config '{"retries":{"runMode":3,"openMode":0}}'

# Disable video recording
npx cypress run --config video=false

# Use a different config file entirely
npx cypress run --config-file cypress.staging.config.ts

# Override reporter
npx cypress run --config reporter=spec
```

---

## Environment Variables

Pass environment variables to tests, accessible via `Cypress.env()`.

```bash
# Set a single environment variable
npx cypress run --env username=tomsmith

# Set multiple environment variables (comma-separated)
npx cypress run --env username=tomsmith,password=SuperSecretPassword!

# Reference in tests:
#   Cypress.env('username')  --> 'tomsmith'
#   Cypress.env('password')  --> 'SuperSecretPassword!'

# Override using OS environment variables (CYPRESS_ prefix)
export CYPRESS_LOGIN_USERNAME=tomsmith
export CYPRESS_LOGIN_PASSWORD=SuperSecretPassword!
npx cypress run
# Access in tests: Cypress.env('LOGIN_USERNAME')

# Use cypress.env.json file (auto-loaded if present)
# Create cypress.env.json:
# {
#   "LOGIN_USERNAME": "tomsmith",
#   "LOGIN_PASSWORD": "SuperSecretPassword!"
# }
```

**Environment Variable Priority (highest to lowest):**

1. `--env` CLI flag
2. `CYPRESS_*` OS environment variables
3. `cypress.env.json` file
4. `env` object in `cypress.config.ts`

---

## Recording and Dashboard

Record test runs to Cypress Cloud (formerly Dashboard) for result tracking, parallelization, and analytics.

```bash
# Record to Cypress Cloud (requires projectId in config and CYPRESS_RECORD_KEY)
npx cypress run --record

# Record with a specific key
npx cypress run --record --key <record-key>

# Tag the run for filtering in Dashboard
npx cypress run --record --tag "staging,smoke"

# Group runs together (useful for matrix CI)
npx cypress run --record --group "chrome-tests" --browser chrome
npx cypress run --record --group "firefox-tests" --browser firefox

# Parallel execution with Cypress Cloud (auto-balances specs across machines)
npx cypress run --record --parallel

# Parallel with grouping
npx cypress run --record --parallel --group "e2e" --browser chrome

# Set CI build ID for parallel coordination
npx cypress run --record --parallel --ci-build-id $BUILD_ID
```

---

## Reporter Options

Configure test result output format.

```bash
# Use built-in spec reporter (default)
npx cypress run --reporter spec

# Use built-in dot reporter (minimal output)
npx cypress run --reporter dot

# Use built-in JSON reporter
npx cypress run --reporter json

# Use Mochawesome reporter (configured in this project)
npx cypress run --reporter cypress-mochawesome-reporter

# Pass reporter options via CLI
npx cypress run --reporter cypress-mochawesome-reporter \
  --reporter-options "reportDir=cypress/reports,charts=true,overwrite=false"

# Use JUnit reporter (for CI systems)
npx cypress run --reporter junit --reporter-options "mochaFile=results/output-[hash].xml"
```

---

## Debugging

Tools and flags for troubleshooting test execution.

```bash
# Run with verbose Cypress debug logs
DEBUG=cypress:* npx cypress run

# Debug specific Cypress modules
DEBUG=cypress:server npx cypress run
DEBUG=cypress:network npx cypress run
DEBUG=cypress:proxy npx cypress run

# Run headed (watch the browser during execution)
npx cypress run --headed

# Slow down commands for visual debugging (in cypress.config.ts)
# Set: animationDistanceThreshold, slowTestThreshold

# Print Cypress and system information
npx cypress info

# Verify Cypress installation
npx cypress verify

# Print Cypress version
npx cypress version

# Print detailed version information
npx cypress version --component package
npx cypress version --component binary
npx cypress version --component electron
npx cypress version --component node
```

---

## Other Commands

### Installation and Cache Management

```bash
# Install Cypress binary
npx cypress install

# Install specific version
npx cypress install --force

# Clear Cypress cache
npx cypress cache clear

# List cached Cypress versions
npx cypress cache list

# Show cache path
npx cypress cache path

# Prune old cached versions
npx cypress cache prune
```

### System Information

```bash
# Display Cypress, system, and browser info
npx cypress info

# Verify the Cypress binary is installed and executable
npx cypress verify
```

---

## Project npm Scripts

These scripts are defined in this project's `package.json` for convenience.

| Script | Command | Description |
|--------|---------|-------------|
| `npm run cy:open` | `cypress open` | Opens the Cypress Test Runner GUI |
| `npm run cy:run` | `cypress run` | Runs all tests headless (default browser) |
| `npm run cy:run:chrome` | `cypress run --browser chrome` | Runs all tests in Chrome headless |
| `npm run cy:run:firefox` | `cypress run --browser firefox` | Runs all tests in Firefox headless |
| `npm run cy:run:edge` | `cypress run --browser edge` | Runs all tests in Edge headless |
| `npm run cy:run:all-browsers` | Runs chrome, firefox, edge sequentially | Full cross-browser validation |
| `npm run cy:run:parallel` | `cypress-parallel -s cy:run -t 3 -d cypress/e2e` | Runs 3 spec files across 3 threads |
| `npm run cy:run:parallel:chrome` | `cypress-parallel -s cy:run:chrome -t 3 -d cypress/e2e` | Parallel in Chrome |
| `npm run cy:report:merge` | `mochawesome-merge ...` | Merges individual JSON reports |
| `npm run cy:report:generate` | `marge ...` | Generates HTML from merged JSON |
| `npm run cy:report` | Merge + generate | Full report pipeline |
| `npm run lint` | `eslint 'cypress/**/*.ts'` | Checks code quality |
| `npm run lint:fix` | `eslint --fix` | Auto-fixes linting issues |
| `npm run typecheck` | `tsc --noEmit` | Validates TypeScript types |

---

## Common Patterns

### Run a specific test in a specific browser

```bash
npx cypress run --browser chrome --spec "cypress/e2e/login/login.cy.ts"
```

### Run tests with custom base URL (e.g., staging environment)

```bash
npx cypress run --config baseUrl=https://staging.the-internet.herokuapp.com
```

### Run tests with increased timeout for slow networks

```bash
npx cypress run --config defaultCommandTimeout=20000,pageLoadTimeout=60000
```

### Run tests with no video and no screenshots (faster CI)

```bash
npx cypress run --config video=false,screenshotOnRunFailure=false
```

### Run tests with custom environment variables

```bash
npx cypress run --env LOGIN_USERNAME=admin,LOGIN_PASSWORD=secret123
```

### Debug a failing test interactively

```bash
npx cypress open --browser chrome --e2e
# Then select the failing spec file in the Test Runner
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All tests passed |
| 1 | Tests failed |
| 2 | Missing dependency or configuration error |
| 3 | Cypress binary not found |

---

## Useful Links

- Cypress CLI Documentation: https://docs.cypress.io/guides/guides/command-line
- Cypress Configuration: https://docs.cypress.io/guides/references/configuration
- Cypress Environment Variables: https://docs.cypress.io/guides/guides/environment-variables
- Cypress Reporters: https://docs.cypress.io/guides/tooling/reporters
