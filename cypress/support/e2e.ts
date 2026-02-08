/**
 * Cypress Support File - Global Test Configuration
 *
 * This file is the entry point for Cypress's support system. It runs
 * AUTOMATICALLY before every single test spec file in the project. You never
 * need to import it manually -- Cypress loads it based on the supportFile
 * setting in cypress.config.ts (set to 'cypress/support/e2e.ts').
 *
 * This file is responsible for three things:
 *
 * 1. IMPORTING CUSTOM COMMANDS: Loads commands.ts which registers cy.login(),
 *    cy.logout(), cy.verifyFlashMessage(), and cy.verifyFlashClass() on the
 *    cy object. After this import, all custom commands are available in every
 *    test file without any additional imports.
 *
 * 2. REGISTERING THE MOCHAWESOME REPORTER: Imports the reporter's browser-side
 *    registration module. This hooks into Cypress's test lifecycle events to
 *    capture test results, screenshots, and metadata for the HTML report
 *    generated after each test run.
 *
 * 3. HANDLING UNCAUGHT EXCEPTIONS: Registers a global error handler that
 *    prevents tests from failing due to JavaScript errors thrown by the
 *    application under test (the-internet.herokuapp.com). The herokuapp app
 *    occasionally throws errors from third-party scripts (Optimizely, etc.)
 *    that are unrelated to login functionality. Without this handler, those
 *    errors would cause every test to fail even though the login feature
 *    works correctly.
 *
 * EXECUTION ORDER:
 * Each time Cypress runs a spec file, this happens:
 *   1. This e2e.ts file loads (commands registered, reporter initialized)
 *   2. The uncaught:exception handler is attached to the global Cypress object
 *   3. The spec file's describe/it blocks are parsed
 *   4. beforeEach hooks run, then each test runs
 *   5. The uncaught:exception handler catches any app errors during tests
 */

// Triple-slash directive importing custom command type declarations.
// This ensures TypeScript recognizes cy.login(), cy.logout(), etc. throughout
// the support files. While tests get these types through their own imports,
// this reference is needed here for the commands.ts import to work cleanly.
/// <reference path="./types/cypress.d.ts" />

// Import and register all custom commands defined in commands.ts.
// After this import executes, cy.login(), cy.logout(), cy.verifyFlashMessage(),
// and cy.verifyFlashClass() are available globally in every test file.
// You don't need to import commands.ts in individual spec files.
import './commands';

// Register the Mochawesome reporter's browser-side component.
// This import hooks into Cypress's test runner events (test start, test pass,
// test fail, screenshot taken, etc.) to collect data for the HTML report.
// The server-side component is registered separately in cypress.config.ts via
// require('cypress-mochawesome-reporter/plugin')(on) in setupNodeEvents.
// Both components (browser-side here + server-side in config) are required
// for the reporter to generate complete HTML reports with embedded screenshots.
import 'cypress-mochawesome-reporter/register';

// -----------------------------------------------------------------------------
// GLOBAL UNCAUGHT EXCEPTION HANDLER
// -----------------------------------------------------------------------------
// Cypress.on('uncaught:exception', callback) registers an event listener that
// fires whenever the application under test throws an unhandled JavaScript error.
//
// By default, Cypress FAILS the current test when any uncaught exception occurs.
// This is usually the right behavior -- you want to know if the app is throwing
// errors. However, the-internet.herokuapp.com loads third-party tracking scripts
// (Optimizely, etc.) that occasionally throw errors unrelated to login functionality.
//
// HOW THE HANDLER WORKS:
//   - The callback receives the Error object with the error message and stack trace.
//   - Returning FALSE tells Cypress to IGNORE the error and continue the test.
//   - Returning TRUE (or not returning anything) lets Cypress FAIL the test.
//
// We selectively ignore two specific error patterns:
//   1. 'Cannot read properties of null' - Thrown by third-party scripts trying
//      to access DOM elements that don't exist. Common with analytics/tracking code.
//   2. 'Script error' - A generic cross-origin error message browsers emit when
//      a script loaded from a different domain throws an error. The browser hides
//      the actual error details for security reasons.
//
// All other uncaught exceptions will still fail the test as expected, ensuring
// real application bugs are caught while third-party noise is filtered out.
// -----------------------------------------------------------------------------
Cypress.on('uncaught:exception', (err: Error) => {
  // Check if the error message contains known third-party error patterns.
  // String.includes() does a case-sensitive substring search.

  // Null reference errors from third-party tracking/analytics scripts.
  if (err.message.includes('Cannot read properties of null')) {
    // Return false to tell Cypress: "Don't fail the test for this error."
    return false;
  }

  // Generic cross-origin script errors from external domains.
  if (err.message.includes('Script error')) {
    // Return false to suppress this error as well.
    return false;
  }

  // For any other error, return true (the default behavior).
  // This lets Cypress fail the test, which is what you want for real bugs
  // in the application's login functionality.
  return true;
});
