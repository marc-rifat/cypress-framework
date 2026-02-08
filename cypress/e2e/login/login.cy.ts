/**
 * Login - Core Positive Flows Test Suite
 *
 * This test suite validates the "happy path" authentication workflows for the
 * login page at https://the-internet.herokuapp.com/login. It covers three
 * critical areas that every login system must handle correctly:
 *
 * 1. SUCCESSFUL LOGIN: Verifies that a user with valid credentials can log in,
 *    sees a success message, lands on the correct secure page, and sees the
 *    logout button. These tests confirm the fundamental authentication mechanism
 *    works end-to-end.
 *
 * 2. LOGOUT FLOW: After logging in, verifies that clicking the logout button
 *    returns the user to the login page, displays a logout success message,
 *    and the login form is fully visible and ready for re-use.
 *
 * 3. AUTHENTICATION LIFECYCLE: A single end-to-end test that walks through
 *    the complete journey: login -> verify secure area -> logout -> verify
 *    login page -> re-login -> verify secure area again. This confirms
 *    session management works across multiple authentication cycles.
 *
 * Architecture notes:
 * - Uses the Page Object Model (POM) pattern. LoginPage and SecureAreaPage
 *   classes encapsulate all selectors and actions, so tests read like plain
 *   English and selectors only need updating in one place if the UI changes.
 * - Test data (credentials, expected messages) comes from fixture files
 *   (cypress/fixtures/users.json and messages.json), not hardcoded strings.
 *   cy.fixture() loads these JSON files asynchronously and passes data via
 *   .then() callbacks.
 * - beforeEach() runs before every single test in its describe block,
 *   ensuring each test starts from a clean, known state (the login page).
 */

// Import Page Object classes that encapsulate page selectors and actions.
// LoginPage handles everything on the /login page (form fields, submit, flash messages).
// SecureAreaPage handles the /secure page shown after successful login (heading, logout button).
import LoginPage from '../../pages/LoginPage';
import SecureAreaPage from '../../pages/SecureAreaPage';

// Create single instances of each page object to reuse across all tests.
// These objects expose methods like .visit(), .login(), .verifyPageLoaded(), etc.
const loginPage = new LoginPage();
const secureAreaPage = new SecureAreaPage();

// describe() groups related tests together. Cypress uses Mocha under the hood,
// so describe/it/beforeEach all come from the Mocha test framework.
describe('Login - Core Positive Flows', () => {

  // beforeEach() runs before EVERY test in this describe block (and nested blocks).
  // Here it navigates to the login page and waits for key elements to appear,
  // so each test starts from the same clean state.
  beforeEach(() => {
    // visit() navigates the browser to /login (appended to the baseUrl in cypress.config.ts).
    loginPage.visit();
    // verifyPageLoaded() asserts the heading, username input, password input,
    // and submit button are all visible -- confirming the page fully rendered.
    loginPage.verifyPageLoaded();
  });

  describe('Successful Login', () => {

    it('should login successfully with valid credentials', () => {
      // cy.fixture('users') loads the JSON file at cypress/fixtures/users.json.
      // The .then() callback receives the parsed JSON object as 'users'.
      // Fixtures keep test data separate from test logic for easy maintenance.
      cy.fixture('users').then((users) => {
        // Nest a second fixture load to also get expected messages.
        // messages.json contains strings like "You logged into a secure area!".
        cy.fixture('messages').then((messages) => {
          // login() is a Page Object method that types the username, types the
          // password, and clicks the submit button -- all in one call.
          loginPage.login(users.validUser.username, users.validUser.password);

          // After login, we should land on the secure area page.
          // verifyPageLoaded() checks the "Secure Area" heading and logout button are visible.
          secureAreaPage.verifyPageLoaded();
          // verifyUrlContains() asserts the browser URL includes '/secure'.
          secureAreaPage.verifyUrlContains('/secure');
          // verifyFlashMessage() checks the green/red banner contains the expected text.
          secureAreaPage.verifyFlashMessage(messages.loginSuccess);
          // verifyFlashClass() checks the banner has the CSS class 'success' (green background).
          secureAreaPage.verifyFlashClass('success');
        });
      });
    });

    it('should display the logout button after successful login', () => {
      cy.fixture('users').then((users) => {
        loginPage.login(users.validUser.username, users.validUser.password);

        // .should('be.visible') is a Cypress assertion that retries until the element
        // is visible or the timeout (10s default) expires. This is how Cypress handles
        // async rendering -- no manual waits or sleeps needed.
        secureAreaPage.logoutButton.should('be.visible');
        // .should('contain.text', 'Logout') asserts the button text includes "Logout".
        secureAreaPage.logoutButton.should('contain.text', 'Logout');
      });
    });
  });

  describe('Logout Flow', () => {

    // This nested beforeEach runs AFTER the parent beforeEach (which visits /login).
    // It logs in and verifies the secure area, so every test in this block starts
    // from an authenticated state on the /secure page.
    beforeEach(() => {
      cy.fixture('users').then((users) => {
        loginPage.login(users.validUser.username, users.validUser.password);
        secureAreaPage.verifyPageLoaded();
      });
    });

    it('should logout successfully from the secure area', () => {
      cy.fixture('messages').then((messages) => {
        // clickLogout() clicks the "Logout" button on the secure area page.
        secureAreaPage.clickLogout();

        // After logout, verify we are back on the login page with a success message.
        loginPage.verifyUrlContains('/login');
        loginPage.verifyFlashMessage(messages.logoutSuccess);
        loginPage.verifyFlashClass('success');
      });
    });

    it('should redirect to login page after logout', () => {
      secureAreaPage.clickLogout();

      // Confirm the URL changed back to /login and the page is fully loaded.
      loginPage.verifyUrlContains('/login');
      loginPage.verifyPageLoaded();
    });

    it('should display the login form after logout', () => {
      secureAreaPage.clickLogout();

      // Verify all three key form elements are visible and ready for input.
      // This confirms the form reset properly after logout.
      loginPage.usernameInput.should('be.visible');
      loginPage.passwordInput.should('be.visible');
      loginPage.submitButton.should('be.visible');
    });
  });

  describe('Authentication Lifecycle', () => {

    it('should complete a full lifecycle: login -> verify -> logout -> re-login', () => {
      cy.fixture('users').then((users) => {
        cy.fixture('messages').then((messages) => {

          // --- STEP 1: First login ---
          loginPage.login(users.validUser.username, users.validUser.password);
          secureAreaPage.verifyPageLoaded();
          secureAreaPage.verifyFlashMessage(messages.loginSuccess);

          // --- STEP 2: Logout ---
          secureAreaPage.clickLogout();
          loginPage.verifyUrlContains('/login');
          loginPage.verifyFlashMessage(messages.logoutSuccess);

          // --- STEP 3: Re-login to confirm session was fully cleared ---
          // This is critical: it proves the app doesn't have stale session state
          // that would prevent a fresh login after logout.
          loginPage.login(users.validUser.username, users.validUser.password);
          secureAreaPage.verifyPageLoaded();
          secureAreaPage.verifyFlashMessage(messages.loginSuccess);
          secureAreaPage.verifyUrlContains('/secure');
        });
      });
    });
  });
});
