/// <reference path="./types/cypress.d.ts" />

import './commands';
import 'cypress-mochawesome-reporter/register';

/**
 * Global handler for uncaught exceptions.
 * Prevents tests from failing due to unhandled JS errors
 * originating from the herokuapp application itself.
 */
Cypress.on('uncaught:exception', (err: Error) => {
  // Returning false prevents Cypress from failing the test
  // on application-level JavaScript errors from herokuapp
  if (err.message.includes('Cannot read properties of null')) {
    return false;
  }
  if (err.message.includes('Script error')) {
    return false;
  }
  // Let other errors fail the test
  return true;
});
