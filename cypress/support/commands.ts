/**
 * Custom Cypress Commands
 *
 * This file defines reusable custom commands that extend the cy object with
 * application-specific actions. Instead of repeating the same sequence of
 * Cypress commands in every test (visit login page, type username, type password,
 * click submit), you call cy.login('user', 'pass') and it does everything.
 *
 * HOW CUSTOM COMMANDS WORK IN CYPRESS:
 * Cypress.Commands.add('commandName', callbackFunction) registers a new method
 * on the cy object. After registration, you can call cy.commandName() anywhere
 * in your tests. The callback function contains the Cypress commands that run
 * when the custom command is invoked. Commands are queued (not executed immediately)
 * -- Cypress runs them in order after the test function returns.
 *
 * WHY USE CUSTOM COMMANDS VS PAGE OBJECTS:
 * This project uses BOTH patterns. Custom commands (this file) are useful for
 * quick, reusable actions that can be called directly on cy without importing
 * anything. Page Objects (cypress/pages/) provide a more structured, class-based
 * approach with typed getters and organized methods. The tests in this project
 * primarily use Page Objects, but custom commands are available as a convenience
 * for simpler scenarios or for use in beforeEach hooks.
 *
 * IMPORTANT - TYPE DECLARATIONS:
 * Every command defined here MUST have a matching type declaration in
 * cypress/support/types/cypress.d.ts. Without the declaration, TypeScript
 * will show errors when you try to use the command (e.g., cy.login is not
 * a function). The declaration tells TypeScript what parameters the command
 * accepts and what it returns.
 */

// Triple-slash directive that imports the custom type declarations from
// cypress.d.ts. This ensures TypeScript recognizes cy.login(), cy.logout(),
// etc. as valid methods in this file and everywhere else.
/// <reference path="./types/cypress.d.ts" />

// Import the @4tw/cypress-drag-drop plugin which registers .drag() and .move()
// commands on the cy object. The plugin synthesizes HTML5 drag-and-drop events
// (dragstart, drag, dragover, drop, dragend) that Cypress cannot produce natively
// because it does not create real DataTransfer objects during simulated mouse events.
import '@4tw/cypress-drag-drop';

// -----------------------------------------------------------------------------
// cy.login(username, password)
// -----------------------------------------------------------------------------
// Performs a complete login flow: navigates to /login, fills in credentials,
// and clicks submit. The .clear() before .type() ensures any pre-filled or
// leftover text in the input is removed before typing new values.
//
// Parameters:
//   username (string) - The value to type into the #username input field
//   password (string) - The value to type into the #password input field
//
// Example usage in a test:
//   cy.login('tomsmith', 'SuperSecretPassword!')
//   cy.url().should('include', '/secure')
// -----------------------------------------------------------------------------
Cypress.Commands.add('login', (username: string, password: string): void => {
  // Navigate to the login page. cy.visit() appends '/login' to the baseUrl
  // configured in cypress.config.ts (https://the-internet.herokuapp.com).
  cy.visit('/login');
  // Find the username input by its HTML id attribute (#username).
  // .clear() removes any existing text, then .type() simulates keyboard input.
  cy.get('#username').clear().type(username);
  // Same for the password field. The input type="password" means the browser
  // will mask the characters, but Cypress can still type into and read from it.
  cy.get('#password').clear().type(password);
  // Find the submit button by its type attribute and click it.
  // This submits the form via POST to /authenticate (the form's action URL).
  cy.get('button[type="submit"]').click();
});

// -----------------------------------------------------------------------------
// cy.logout()
// -----------------------------------------------------------------------------
// Clicks the logout button on the /secure page. Assumes the user is already
// logged in and on the secure area page. The logout button is an <a> tag
// styled as a button that navigates to /logout, which destroys the session
// and redirects back to /login.
//
// Example usage in a test:
//   cy.login('tomsmith', 'SuperSecretPassword!')
//   // ... do things on secure page ...
//   cy.logout()
//   cy.url().should('include', '/login')
// -----------------------------------------------------------------------------
Cypress.Commands.add('logout', (): void => {
  // The logout "button" is actually an anchor (<a>) tag with class "button"
  // and href="/logout". The CSS selector targets this specific element.
  cy.get('a.button[href="/logout"]').click();
});

// -----------------------------------------------------------------------------
// cy.verifyFlashMessage(expectedMessage)
// -----------------------------------------------------------------------------
// Asserts the flash message banner is visible and contains the expected text.
// The flash message is the colored banner (#flash) that appears at the top of
// the page after login/logout actions. It uses 'contain.text' (substring match)
// rather than 'have.text' (exact match) because the flash element includes
// extra whitespace and a close button icon in its actual text content.
//
// Parameters:
//   expectedMessage (string) - The text expected to appear within the flash banner
//
// Example usage:
//   cy.verifyFlashMessage('You logged into a secure area!')
// -----------------------------------------------------------------------------
Cypress.Commands.add('verifyFlashMessage', (expectedMessage: string): void => {
  // cy.get('#flash') finds the flash message element by its id.
  // .should('be.visible') retries until the element is visible (up to the
  // defaultCommandTimeout of 10 seconds configured in cypress.config.ts).
  // .and() chains a second assertion on the same element.
  // 'contain.text' checks that the element's text content includes the
  // expectedMessage as a substring.
  cy.get('#flash').should('be.visible').and('contain.text', expectedMessage);
});

// -----------------------------------------------------------------------------
// cy.verifyFlashClass(expectedClass)
// -----------------------------------------------------------------------------
// Asserts the flash message banner is visible and has the expected CSS class.
// The app uses two classes on the #flash element:
//   - 'success' = green background (successful login or logout)
//   - 'error'   = red background (failed login attempt)
//
// Parameters:
//   expectedClass (string) - The CSS class to check for ('success' or 'error')
//
// Example usage:
//   cy.verifyFlashClass('success')  // after successful login
//   cy.verifyFlashClass('error')    // after failed login
// -----------------------------------------------------------------------------
Cypress.Commands.add('verifyFlashClass', (expectedClass: string): void => {
  // .should('be.visible') confirms the flash banner is shown on the page.
  // .and('have.class', expectedClass) checks the element's classList contains
  // the specified class. The element typically has multiple classes like
  // "flash success" or "flash error", and 'have.class' matches if ANY of
  // the element's classes match the expected value.
  cy.get('#flash').should('be.visible').and('have.class', expectedClass);
});

// -----------------------------------------------------------------------------
// cy.dragAndDrop(sourceSelector, targetSelector)
// -----------------------------------------------------------------------------
// Performs an HTML5 drag-and-drop operation by manually dispatching the full
// sequence of drag events with a real DataTransfer object. This is a fallback
// for pages where the @4tw/cypress-drag-drop plugin's synthetic events don't
// trigger the application's JavaScript handlers. The herokuapp drag_and_drop
// page listens for the 'drop' event and reads e.dataTransfer.getData() to
// determine which column was dragged, so a real DataTransfer is required.
//
// The event sequence mimics what the browser fires during a native drag:
//   1. dragstart (on source) - Populates the DataTransfer with the source element's id
//   2. dragover (on target) - Tells the browser the target is a valid drop zone
//   3. drop (on target) - The target reads DataTransfer data and performs the swap
//   4. dragend (on source) - Cleanup signal that the drag operation completed
//
// Parameters:
//   sourceSelector (string) - CSS selector for the element to drag FROM
//   targetSelector (string) - CSS selector for the element to drag TO
//
// Example usage in a test:
//   cy.dragAndDrop('#column-a', '#column-b')
// -----------------------------------------------------------------------------
Cypress.Commands.add('dragAndDrop', (sourceSelector: string, targetSelector: string): void => {
  // Use cy.get().then() to access the raw DOM elements so we can dispatch
  // real native DragEvent instances (not jQuery events). This is necessary
  // because the herokuapp drag_and_drop page's JavaScript reads
  // e.dataTransfer.getData('text/html') in its drop handler, and jQuery
  // synthetic events created by Cypress's .trigger() don't properly persist
  // DataTransfer data between separate trigger calls.
  cy.get(sourceSelector).then(($source) => {
    cy.get(targetSelector).then(($target) => {
      // Get the raw DOM element from the jQuery wrapper. [0] accesses the
      // underlying HTMLElement that we can call dispatchEvent() on directly.
      const sourceEl = $source[0];
      const targetEl = $target[0];

      // Create a new DataTransfer object. This is the browser's native API
      // for passing data between drag source and drop target. Unlike the
      // @4tw/cypress-drag-drop plugin which uses synthetic events, we create
      // a single DataTransfer instance shared across all four drag events
      // so data set during dragstart is readable during drop.
      const dataTransfer = new DataTransfer();

      // Manually set the source element's innerHTML into the DataTransfer
      // as 'text/html'. The page's dragstart handler normally does this,
      // but because we're dispatching synthetic events, the handler's
      // setData() call may not persist across events. Setting it explicitly
      // ensures the drop handler can read it via getData('text/html').
      dataTransfer.setData('text/html', sourceEl.innerHTML);

      // 1. DRAGSTART on source: Signals the start of the drag operation.
      // The page's dragstart handler sets opacity to 0.4 and stores the
      // source element reference for the swap.
      sourceEl.dispatchEvent(
        new DragEvent('dragstart', { dataTransfer, bubbles: true })
      );

      // 2. DRAGOVER on target: Signals the target is a valid drop zone.
      // The page's dragover handler calls e.preventDefault() which is
      // required for the drop event to fire.
      targetEl.dispatchEvent(
        new DragEvent('dragover', { dataTransfer, bubbles: true })
      );

      // 3. DROP on target: The page's drop handler reads the DataTransfer
      // data and swaps innerHTML between the source and target elements.
      // dragSrcEl.innerHTML = this.innerHTML;
      // this.innerHTML = e.dataTransfer.getData('text/html');
      targetEl.dispatchEvent(
        new DragEvent('drop', { dataTransfer, bubbles: true })
      );

      // 4. DRAGEND on source: Cleanup signal. The page's dragend handler
      // restores opacity and removes the 'over' CSS class from all columns.
      sourceEl.dispatchEvent(
        new DragEvent('dragend', { dataTransfer, bubbles: true })
      );
    });
  });
});
