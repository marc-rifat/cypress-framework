/// <reference path="./types/cypress.d.ts" />

/**
 * Custom command to perform login with given credentials.
 * Navigates to the login page and submits the login form.
 */
Cypress.Commands.add('login', (username: string, password: string): void => {
  cy.visit('/login');
  cy.get('#username').clear().type(username);
  cy.get('#password').clear().type(password);
  cy.get('button[type="submit"]').click();
});

/**
 * Custom command to perform logout from the secure area.
 * Clicks the logout button and waits for navigation.
 */
Cypress.Commands.add('logout', (): void => {
  cy.get('a.button[href="/logout"]').click();
});

/**
 * Custom command to verify flash message text content.
 * Asserts the flash element contains the expected message substring.
 */
Cypress.Commands.add('verifyFlashMessage', (expectedMessage: string): void => {
  cy.get('#flash').should('be.visible').and('contain.text', expectedMessage);
});

/**
 * Custom command to verify flash message CSS class.
 * Asserts the flash element has the specified class.
 */
Cypress.Commands.add('verifyFlashClass', (expectedClass: string): void => {
  cy.get('#flash').should('be.visible').and('have.class', expectedClass);
});
