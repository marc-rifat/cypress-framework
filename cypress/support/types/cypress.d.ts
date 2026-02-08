/**
 * TypeScript Type Declarations for Custom Cypress Commands
 *
 * This file extends Cypress's built-in TypeScript types to include our custom
 * commands (login, logout, verifyFlashMessage, verifyFlashClass). Without this
 * file, TypeScript would show red squiggly errors whenever you write something
 * like cy.login('user', 'pass') because TypeScript doesn't know that method
 * exists on the cy object.
 *
 * HOW IT WORKS:
 * Cypress ships with its own TypeScript definitions that describe every built-in
 * command (cy.get, cy.visit, cy.click, etc.) inside the Cypress.Chainable
 * interface. TypeScript supports "declaration merging" -- if you declare the
 * same interface in the same namespace again, TypeScript MERGES both declarations
 * together. So by re-declaring Cypress.Chainable here with our custom methods,
 * TypeScript adds them to the existing interface without replacing anything.
 *
 * IMPORTANT - KEEPING THIS FILE IN SYNC:
 * Every custom command defined in commands.ts MUST have a matching declaration
 * here. If you add a new command in commands.ts but forget to declare it here,
 * TypeScript will show errors wherever the command is used. Conversely, if you
 * declare a command here but don't implement it in commands.ts, the command will
 * appear in autocomplete but throw a runtime error when called.
 *
 * The return type Chainable<void> means these commands don't yield a specific
 * value to the next command in the chain, but they are still chainable (you can
 * write cy.login(...).then(() => ...) if needed).
 */

// This triple-slash directive tells TypeScript to include Cypress's built-in
// type definitions. It ensures all standard Cypress types (cy, Cypress namespace,
// Chainable interface, etc.) are available in this file. Without this line,
// TypeScript wouldn't know what "Cypress" or "Chainable" refer to.
/// <reference types="cypress" />

// "declare namespace Cypress" opens the existing Cypress namespace for merging.
// We don't use "import" here because this is a declaration file (.d.ts) that
// augments global types rather than defining a module.
declare namespace Cypress {

  // "interface Chainable" merges with Cypress's existing Chainable interface.
  // After merging, cy.login(), cy.logout(), etc. become valid TypeScript calls
  // with full autocomplete and type checking in any .ts file.
  interface Chainable {
    /**
     * Custom command: Performs a complete login action with the given credentials.
     * Navigates the browser to /login, clears and types the username, clears and
     * types the password, then clicks the submit button.
     *
     * Implementation: cypress/support/commands.ts
     * Usage example: cy.login('tomsmith', 'SuperSecretPassword!')
     *
     * @param username - The username string to type into the #username input field
     * @param password - The password string to type into the #password input field
     * @returns Chainable<void> - Can be chained but doesn't yield a specific value
     */
    login(username: string, password: string): Chainable<void>;

    /**
     * Custom command: Performs a logout action by clicking the logout button
     * on the secure area page (/secure). Assumes the user is already logged in
     * and the logout button (a.button[href="/logout"]) is visible on the page.
     *
     * Implementation: cypress/support/commands.ts
     * Usage example: cy.logout()
     *
     * @returns Chainable<void> - Can be chained but doesn't yield a specific value
     */
    logout(): Chainable<void>;

    /**
     * Custom command: Verifies the flash message banner (#flash) is visible and
     * contains the expected text. Uses substring matching via 'contain.text', so
     * the expectedMessage doesn't need to match the full banner text exactly.
     *
     * Implementation: cypress/support/commands.ts
     * Usage example: cy.verifyFlashMessage('You logged into a secure area!')
     *
     * @param expectedMessage - The text substring expected within the flash banner
     * @returns Chainable<void> - Can be chained but doesn't yield a specific value
     */
    verifyFlashMessage(expectedMessage: string): Chainable<void>;

    /**
     * Custom command: Verifies the flash message banner (#flash) is visible and
     * has the expected CSS class. The login app uses 'success' for green banners
     * (successful login/logout) and 'error' for red banners (failed login).
     *
     * Implementation: cypress/support/commands.ts
     * Usage example: cy.verifyFlashClass('success')  // green banner
     * Usage example: cy.verifyFlashClass('error')     // red banner
     *
     * @param expectedClass - The CSS class name to check for ('success' or 'error')
     * @returns Chainable<void> - Can be chained but doesn't yield a specific value
     */
    verifyFlashClass(expectedClass: string): Chainable<void>;

    /**
     * Custom command: Performs an HTML5 drag-and-drop operation by dispatching
     * native drag events (dragstart, dragover, drop, dragend) with a real
     * DataTransfer object. This is a fallback for pages where the
     * @4tw/cypress-drag-drop plugin's synthetic events don't trigger the
     * application's JavaScript handlers.
     *
     * Implementation: cypress/support/commands.ts
     * Usage example: cy.dragAndDrop('#column-a', '#column-b')
     *
     * @param sourceSelector - CSS selector for the element to drag FROM
     * @param targetSelector - CSS selector for the element to drag TO
     * @returns Chainable<void> - Can be chained but doesn't yield a specific value
     */
    dragAndDrop(sourceSelector: string, targetSelector: string): Chainable<void>;
  }
}
