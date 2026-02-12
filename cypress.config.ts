/**
 * Cypress Configuration File
 *
 * This is the central configuration file for the entire Cypress test framework.
 * Cypress reads this file on startup to determine how tests are discovered,
 * which browser settings to use, where to save artifacts, and how to report
 * results. Every setting here applies globally to all test specs unless
 * overridden at the test level.
 *
 * KEY CONCEPTS FOR NEWCOMERS:
 *
 * - defineConfig() is a helper function from Cypress that provides TypeScript
 *   autocomplete and validation for all config options. It doesn't change
 *   behavior -- it just makes the config type-safe.
 *
 * - The "e2e" block contains settings specific to end-to-end testing (as opposed
 *   to component testing, which Cypress also supports but we don't use here).
 *
 * - baseUrl is prepended to every cy.visit() and cy.request() call. So
 *   cy.visit('/login') actually navigates to 'https://the-internet.herokuapp.com/login'.
 *
 * - Timeouts control how long Cypress waits before failing an operation.
 *   Cypress automatically retries assertions until they pass or timeout expires.
 *
 * - The reporter section configures Mochawesome to generate HTML reports with
 *   charts, embedded screenshots, and inline CSS/JS (no external dependencies).
 *
 * - setupNodeEvents runs in Node.js (not the browser) and is used to register
 *   plugins like the Mochawesome reporter's server-side component.
 */

// Import Cypress's defineConfig helper for type-safe configuration.
// This is a TypeScript utility that provides autocomplete for all config options.
import { defineConfig } from 'cypress';

// Export the configuration object as the default export.
// Cypress automatically loads this file because it's named cypress.config.ts
// in the project root.
export default defineConfig({

  // All settings inside "e2e" apply to end-to-end tests (browser-based tests
  // that navigate to real URLs). Cypress also supports "component" testing
  // for testing individual UI components in isolation, but that's not used here.
  e2e: {

    // -------------------------------------------------------------------------
    // URL AND FILE SETTINGS
    // -------------------------------------------------------------------------

    // The base URL prepended to all cy.visit() calls. Instead of writing
    // cy.visit('https://the-internet.herokuapp.com/login') in every test,
    // you just write cy.visit('/login'). This makes it easy to switch between
    // environments (dev, staging, prod) by changing just this one value.
    baseUrl: 'https://the-internet.herokuapp.com',

    // Glob pattern that tells Cypress where to find test spec files.
    // **/*.cy.ts means: any file ending in .cy.ts inside any subfolder of
    // cypress/e2e/. Currently matches: login.cy.ts, login-negative.cy.ts,
    // login-ui.cy.ts inside cypress/e2e/login/.
    specPattern: 'cypress/e2e/**/*.cy.ts',

    // Path to the support file that runs before every test spec.
    // This file (e2e.ts) imports custom commands and registers the reporter.
    // Cypress loads it automatically -- you never import it in test files.
    supportFile: 'cypress/support/e2e.ts',

    // Directory where cy.fixture('filename') looks for JSON fixture files.
    // cy.fixture('users') loads cypress/fixtures/users.json.
    fixturesFolder: 'cypress/fixtures',

    // -------------------------------------------------------------------------
    // ARTIFACT STORAGE
    // -------------------------------------------------------------------------

    // Directory where Cypress saves screenshots (taken on test failure or
    // manually via cy.screenshot()). These folders are gitignored.
    screenshotsFolder: 'cypress/screenshots',

    // Directory where Cypress saves video recordings of test runs.
    videosFolder: 'cypress/videos',

    // When true, Cypress records a video of every spec file execution.
    // Videos are saved to videosFolder and can be reviewed to debug failures.
    // Set to false to speed up CI runs if video evidence isn't needed.
    video: true,

    // When true, Cypress automatically takes a screenshot when a test fails.
    // Screenshots are embedded in the Mochawesome HTML report for easy debugging.
    screenshotOnRunFailure: true,

    // -------------------------------------------------------------------------
    // TIMEOUTS
    // -------------------------------------------------------------------------
    // Cypress automatically retries commands and assertions until they pass
    // or the timeout expires. These values control how long Cypress waits.
    // If your app or network is slow, increase these. If tests are hanging
    // on elements that will never appear, decrease these to fail faster.

    // How long cy.get(), cy.find(), and .should() wait for an element to
    // appear and assertions to pass. Default is 4000ms; set to 10000ms (10s)
    // here because herokuapp can be slow to respond.
    defaultCommandTimeout: 10000,

    // How long cy.visit() waits for the page to fire its 'load' event.
    // Set to 30000ms (30s) to handle slow initial page loads.
    pageLoadTimeout: 30000,

    // How long cy.request() and cy.intercept() wait for a server response.
    requestTimeout: 10000,

    // Maximum time to wait for a response after the request is sent.
    responseTimeout: 30000,

    // -------------------------------------------------------------------------
    // VIEWPORT
    // -------------------------------------------------------------------------

    // The browser viewport size for all tests. 1280x720 is a standard
    // laptop/desktop resolution. Tests see the page at this exact size,
    // which affects responsive layouts and element visibility.
    viewportWidth: 1280,
    viewportHeight: 720,

    // -------------------------------------------------------------------------
    // RETRIES
    // -------------------------------------------------------------------------

    // Automatic test retries when a test fails. Cypress re-runs the failed
    // test from scratch (including beforeEach hooks) up to this many times.
    retries: {
      // runMode: Used in headless mode (cypress run / CI pipelines).
      // Set to 2 so flaky tests get 2 additional attempts before being
      // marked as failed. Total attempts = 1 original + 2 retries = 3.
      runMode: 2,
      // openMode: Used in interactive mode (cypress open / Test Runner GUI).
      // Set to 0 because during development you want immediate feedback on
      // failures without automatic retries masking real issues.
      openMode: 0,
    },

    // -------------------------------------------------------------------------
    // REPORTER CONFIGURATION
    // -------------------------------------------------------------------------

    // Use cypress-mochawesome-reporter instead of Cypress's default spec reporter.
    // This generates rich HTML reports with charts, screenshots, and test details.
    reporter: 'cypress-mochawesome-reporter',

    // Options passed to the Mochawesome reporter to control report output.
    reporterOptions: {
      // Directory where the HTML report and supporting files are saved.
      reportDir: 'cypress/reports',

      // Include pie charts showing pass/fail distribution in the report.
      charts: true,

      // The <title> text shown in the browser tab when viewing the report.
      reportPageTitle: 'Cypress Login Tests Report',

      // Embed screenshot images directly in the HTML (base64-encoded) instead
      // of saving them as separate files. Makes the report self-contained.
      embeddedScreenshots: true,

      // Bundle all CSS and JavaScript into the HTML file rather than loading
      // from external CDN URLs. This allows viewing the report offline.
      inlineAssets: true,

      // When a test has retries, only save the final attempt's screenshots
      // (not intermediate failed attempts). Reduces report clutter.
      saveAllAttempts: false,

      // Overwrite the previous report file on each test run instead of creating
      // numbered copies (index.html, index_001.html, index_002.html, etc.).
      overwrite: true,

      // Generate an HTML report (the visual report you open in a browser).
      html: true,

      // Also generate a JSON report (machine-readable, used for CI integrations
      // or programmatic access to test results).
      json: true,
    },

    // -------------------------------------------------------------------------
    // NODE EVENT PLUGINS
    // -------------------------------------------------------------------------

    // setupNodeEvents runs in Node.js (server-side), not in the browser.
    // It receives two arguments:
    //   - on: Function to register event listeners (e.g., on('after:run', ...))
    //   - config: The resolved Cypress configuration object (can be modified)
    //
    // This is where server-side plugins are registered. The Mochawesome reporter
    // has two components: a browser-side part (registered in e2e.ts via import)
    // and a server-side part (registered here) that handles file I/O for
    // generating the HTML report.
    setupNodeEvents(on, config) {
      // Register the Mochawesome reporter's server-side plugin.
      // Uses require() instead of import because setupNodeEvents runs in a
      // CommonJS context. The @typescript-eslint/no-require-imports rule is
      // disabled for this file in eslint.config.mjs.
      require('cypress-mochawesome-reporter/plugin')(on);
      // Return the config object (possibly modified by plugins) so Cypress
      // uses the updated configuration.
      return config;
    },
  },
});
