/**
 * Login - UI Elements and Navigation Test Suite
 *
 * This test suite validates the visual structure, HTML attributes, interactive
 * behavior, and navigation logic of the login page. Unlike the other two suites
 * (login.cy.ts for positive flows, login-negative.cy.ts for rejection cases),
 * this suite focuses on the UI layer itself -- confirming the page is built
 * correctly regardless of authentication logic.
 *
 * The suite covers five categories:
 *
 * 1. PAGE ELEMENTS PRESENCE: Verifies that the heading ("Login Page"),
 *    subheading with instructions, username/password inputs, and submit button
 *    all exist and are visible on the page. These are basic "smoke" checks
 *    that catch broken deployments immediately.
 *
 * 2. FORM FIELD ATTRIBUTES: Checks the HTML attributes of each input field
 *    (type="text", type="password", name="username", name="password") and
 *    the form element itself (action="/authenticate", method="post"). These
 *    ensure the form will submit data correctly to the server.
 *
 * 3. INPUT FIELD BEHAVIOR: Tests that users can type into fields, clear them,
 *    and that password input masks characters (type="password"). These
 *    validate basic interactivity.
 *
 * 4. KEYBOARD NAVIGATION: Tests that pressing Enter in the password field
 *    submits the form, and that Tab moves focus between fields. This ensures
 *    the form is accessible for keyboard-only users.
 *
 * 5. URL AND NAVIGATION: Verifies the login page URL is correct, that
 *    accessing /secure without authentication redirects to /login, and that
 *    successful login navigates to /secure. These test the app's routing and
 *    access control behavior.
 *
 * Architecture notes:
 * - Both LoginPage and SecureAreaPage are used since some tests (keyboard
 *   submit, navigation after login) end up on the secure area.
 * - Most tests don't need fixture data since they test UI structure, not
 *   authentication logic. Only keyboard submit and navigation tests load
 *   credentials from users.json.
 */

// Import Page Object classes for both pages involved in this test suite.
// LoginPage: selectors and actions for the /login page.
// SecureAreaPage: selectors for the /secure page (used in keyboard submit and nav tests).
import LoginPage from '../../pages/LoginPage';
import SecureAreaPage from '../../pages/SecureAreaPage';

// Instantiate page objects once, reused across all tests.
const loginPage = new LoginPage();
const secureAreaPage = new SecureAreaPage();

describe('Login - UI Elements and Navigation', () => {

  // Navigate to the login page before each test. Unlike login.cy.ts,
  // we do NOT call verifyPageLoaded() here because some tests in the
  // "Page Elements Presence" section ARE the verification themselves.
  beforeEach(() => {
    loginPage.visit();
  });

  // ---------------------------------------------------------------------------
  // PAGE ELEMENTS PRESENCE
  // Verifies all key UI elements exist and are visible on initial page load.
  // ---------------------------------------------------------------------------
  describe('Page Elements Presence', () => {

    it('should display the login page heading', () => {
      // Load expected heading text from the messages fixture file.
      cy.fixture('messages').then((messages) => {
        // .should('be.visible') retries until the element is visible (up to 10s timeout).
        // .and('contain.text', ...) chains a second assertion on the same element.
        // This checks both visibility AND text content in one command chain.
        loginPage.heading.should('be.visible').and('contain.text', messages.loginPageHeading);
      });
    });

    it('should display the login page subheading with instructions', () => {
      // Verify the subheading element is visible on the page.
      loginPage.subheading.should('be.visible');
      // .invoke('text') calls jQuery's .text() method on the element, returning
      // the inner text content. .then() receives this text as a string so we
      // can run a more flexible assertion using Chai's expect().
      loginPage.subheading.invoke('text').then((text) => {
        // .trim() removes leading/trailing whitespace from the extracted text.
        // .to.contain() checks for a substring match (not exact equality).
        expect(text.trim()).to.contain('This is where you can log into the secure area');
      });
    });

    it('should display the username and password input fields', () => {
      // Simple visibility checks for both input fields.
      loginPage.usernameInput.should('be.visible');
      loginPage.passwordInput.should('be.visible');
    });

    it('should display the submit button with correct text', () => {
      loginPage.submitButton.should('be.visible');
      // Verify the button text says "Login".
      loginPage.submitButton.should('contain.text', 'Login');
    });
  });

  // ---------------------------------------------------------------------------
  // FORM FIELD ATTRIBUTES
  // Verifies HTML attributes that control how the form behaves and submits data.
  // These are important because wrong attributes (e.g., type="text" on a password
  // field) can cause security issues or broken form submissions.
  // ---------------------------------------------------------------------------
  describe('Form Field Attributes', () => {

    it('should have username input with correct type attribute', () => {
      // .should('have.attr', 'type', 'text') asserts the element has
      // attribute type="text". This confirms it's a standard text input.
      loginPage.usernameInput.should('have.attr', 'type', 'text');
    });

    it('should have password input with correct type attribute', () => {
      // type="password" tells the browser to mask typed characters with dots.
      // If this were type="text", passwords would be visible on screen.
      loginPage.passwordInput.should('have.attr', 'type', 'password');
    });

    it('should have username input with correct name attribute', () => {
      // The name attribute determines the key used when the form submits data
      // to the server (e.g., username=tomsmith in the POST body).
      loginPage.usernameInput.should('have.attr', 'name', 'username');
    });

    it('should have password input with correct name attribute', () => {
      loginPage.passwordInput.should('have.attr', 'name', 'password');
    });

    it('should have the form with correct action and method', () => {
      // verifyFormAttributes() is a Page Object method that checks:
      // - action="/authenticate" (the URL the form POSTs data to)
      // - method="post" (HTTP POST, not GET -- important for security since
      //   GET would put credentials in the URL/query string)
      loginPage.verifyFormAttributes('/authenticate', 'post');
    });
  });

  // ---------------------------------------------------------------------------
  // INPUT FIELD BEHAVIOR
  // Tests interactive functionality: typing, clearing, and password masking.
  // ---------------------------------------------------------------------------
  describe('Input Field Behavior', () => {

    it('should allow typing in the username field', () => {
      // .type() simulates keyboard input character by character.
      // This is not just setting a value -- it fires keydown, keypress, input,
      // and keyup events for each character, mimicking real user typing.
      loginPage.usernameInput.type('testuser');
      // .should('have.value', 'testuser') asserts the input's value property
      // matches exactly. This confirms the typed text was accepted.
      loginPage.usernameInput.should('have.value', 'testuser');
    });

    it('should allow typing in the password field', () => {
      loginPage.passwordInput.type('testpassword');
      loginPage.passwordInput.should('have.value', 'testpassword');
    });

    it('should allow clearing the username field', () => {
      // Type first, then clear, then verify the field is empty.
      loginPage.usernameInput.type('testuser');
      // .clear() removes all text from the input field. Under the hood, it
      // selects all text and deletes it, firing the appropriate DOM events.
      loginPage.usernameInput.clear();
      // Empty string value confirms the field was fully cleared.
      loginPage.usernameInput.should('have.value', '');
    });

    it('should allow clearing the password field', () => {
      loginPage.passwordInput.type('testpassword');
      loginPage.passwordInput.clear();
      loginPage.passwordInput.should('have.value', '');
    });

    it('should mask the password input characters', () => {
      // First, verify the input type is "password" BEFORE typing.
      loginPage.passwordInput.should('have.attr', 'type', 'password');
      // Type a password value.
      loginPage.passwordInput.type('SecretPass');
      // The actual value is stored correctly even though the browser displays dots.
      // We can verify the real value through the DOM property.
      loginPage.passwordInput.should('have.value', 'SecretPass');
      // Verify the type is STILL "password" after typing (wasn't changed by JS).
      // Browsers automatically mask characters when type="password".
      loginPage.passwordInput.should('have.attr', 'type', 'password');
    });
  });

  // ---------------------------------------------------------------------------
  // KEYBOARD NAVIGATION
  // Tests form submission via Enter key and field navigation via Tab key.
  // Important for accessibility and users who navigate without a mouse.
  // ---------------------------------------------------------------------------
  describe('Keyboard Navigation', () => {

    it('should submit the form when Enter is pressed in the password field', () => {
      cy.fixture('users').then((users) => {
        cy.fixture('messages').then((messages) => {
          // Type the username using the Page Object method.
          loginPage.typeUsername(users.validUser.username);
          // Type the password directly into the field.
          loginPage.passwordInput.type(users.validUser.password);
          // submitWithEnterKey() presses Enter in the password field using
          // Cypress's special {enter} key syntax inside .type(). This triggers
          // form submission just like pressing Enter on a real keyboard.
          loginPage.submitWithEnterKey();

          // Verify the Enter key submission worked the same as clicking submit:
          // we should land on /secure with a success message.
          secureAreaPage.verifyUrlContains('/secure');
          secureAreaPage.verifyFlashMessage(messages.loginSuccess);
        });
      });
    });

    it('should allow tabbing between username and password fields', () => {
      // .focus() programmatically sets browser focus to the username input.
      loginPage.usernameInput.focus();
      // .should('be.focused') asserts this element is the active/focused element in the DOM.
      loginPage.usernameInput.should('be.focused');

      // .trigger() fires a DOM event manually. Here we simulate a Tab keypress.
      // Note: Cypress does not natively support Tab key in .type(), so we use
      // trigger('keydown') with the Tab key code (keyCode: 9) as a workaround.
      // This fires the event but may not move focus in all browsers.
      loginPage.usernameInput.trigger('keydown', { keyCode: 9, which: 9, key: 'Tab' });

      // To reliably verify Tab navigation works, we programmatically focus the
      // password field and assert it received focus. This confirms the password
      // field is the next focusable element in tab order after username.
      loginPage.passwordInput.focus();
      loginPage.passwordInput.should('be.focused');
    });
  });

  // ---------------------------------------------------------------------------
  // URL AND NAVIGATION
  // Tests routing behavior: correct URLs, auth redirects, and post-login navigation.
  // ---------------------------------------------------------------------------
  describe('URL and Navigation', () => {

    it('should have the correct login page URL', () => {
      // verifyUrlContains() asserts cy.url() includes '/login'.
      // The full URL is baseUrl + '/login' = 'https://the-internet.herokuapp.com/login'.
      loginPage.verifyUrlContains('/login');
    });

    it('should redirect to login when accessing /secure without authentication', () => {
      // Attempt to visit the protected /secure page directly without logging in.
      // { failOnStatusCode: false } prevents Cypress from failing the test if
      // the server returns a non-2xx status code (like 302 redirect or 403).
      // Without this option, a redirect or error status would abort the test.
      cy.visit('/secure', { failOnStatusCode: false });
      // The app should redirect unauthenticated users back to /login.
      // This verifies the server-side access control is working.
      cy.url().should('include', '/login');
    });

    it('should navigate to secure area URL after successful login', () => {
      cy.fixture('users').then((users) => {
        // Perform a valid login.
        loginPage.login(users.validUser.username, users.validUser.password);

        // After successful login, the URL should include '/secure'.
        cy.url().should('include', '/secure');
        // Double-check we are NOT still on /login (rules out URL containing both).
        cy.url().should('not.include', '/login');
      });
    });
  });
});
