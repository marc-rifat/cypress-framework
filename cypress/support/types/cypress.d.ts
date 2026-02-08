/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Performs a login action with the given credentials.
     * Navigates to the login page and submits the form.
     *
     * @param username - The username to enter
     * @param password - The password to enter
     */
    login(username: string, password: string): Chainable<void>;

    /**
     * Performs a logout action by clicking the logout button
     * on the secure area page.
     */
    logout(): Chainable<void>;

    /**
     * Verifies that the flash message contains the expected text.
     *
     * @param expectedMessage - The text expected within the flash message
     */
    verifyFlashMessage(expectedMessage: string): Chainable<void>;

    /**
     * Verifies the flash message element has the expected CSS class.
     *
     * @param expectedClass - The CSS class expected on the flash element (e.g., 'success' or 'error')
     */
    verifyFlashClass(expectedClass: string): Chainable<void>;
  }
}
