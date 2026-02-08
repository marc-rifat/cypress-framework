/**
 * Login - Negative and Edge Cases Test Suite
 *
 * This test suite validates that the login page correctly REJECTS invalid input
 * and handles unusual or malicious data gracefully. While the positive flow tests
 * (login.cy.ts) confirm "the right thing works," these tests confirm "the wrong
 * things fail properly." This is critical for security and user experience.
 *
 * The suite covers five categories:
 *
 * 1. INVALID CREDENTIALS: Tests with wrong username, wrong password, and both
 *    wrong. Verifies the correct error message appears for each scenario and
 *    the user stays on the login page.
 *
 * 2. EMPTY FIELDS: Tests submitting with no input at all, only a password
 *    (empty username), and only a username (empty password). Confirms the app
 *    does not crash or let empty credentials through.
 *
 * 3. SECURITY INPUTS: Tests with SQL injection payloads (e.g., ' OR '1'='1)
 *    and XSS payloads (e.g., <script>alert('xss')</script>). Verifies the app
 *    rejects these without executing malicious code or bypassing authentication.
 *
 * 4. BOUNDARY AND EDGE CASES: Tests with 256-character strings, special
 *    characters (!@#$%^&*...), and whitespace-only input. Also verifies the
 *    page remains intact after a failed login (no broken layout or missing elements).
 *
 * 5. DATA-DRIVEN CASE SENSITIVITY: Iterates through an array of credential
 *    variations (uppercase username, mixed case, etc.) loaded from the fixture
 *    file. Proves that authentication is case-sensitive -- "TOMSMITH" is not
 *    the same as "tomsmith".
 *
 * Architecture notes:
 * - Only LoginPage is needed here since all tests stay on the /login page
 *   (no successful logins reach the secure area).
 * - All test data comes from cypress/fixtures/users.json, which contains
 *   pre-defined credential sets for each scenario.
 * - The data-driven test uses a forEach loop to run multiple credential
 *   variations within a single it() block, reducing boilerplate.
 */

// Import the LoginPage Page Object. It encapsulates all selectors and actions
// for the /login page, so tests don't reference CSS selectors directly.
import LoginPage from '../../pages/LoginPage';

// Create a single LoginPage instance reused by all tests in this file.
const loginPage = new LoginPage();

describe('Login - Negative and Edge Cases', () => {

  // Before each test: navigate to /login and confirm the page rendered correctly.
  // This ensures every test starts from a known, clean state.
  beforeEach(() => {
    loginPage.visit();
    loginPage.verifyPageLoaded();
  });

  // ---------------------------------------------------------------------------
  // INVALID CREDENTIALS
  // Tests that wrong usernames/passwords produce the correct error messages.
  // ---------------------------------------------------------------------------
  describe('Invalid Credentials', () => {

    it('should show error for invalid username', () => {
      // Load test data from fixtures. users.invalidUsername has a wrong username
      // paired with the correct password.
      cy.fixture('users').then((users) => {
        cy.fixture('messages').then((messages) => {
          // Attempt login with wrong username, correct password.
          loginPage.login(users.invalidUsername.username, users.invalidUsername.password);

          // Verify we stayed on /login (did not reach /secure).
          loginPage.verifyUrlContains('/login');
          // Verify the flash banner shows the "invalid username" error text.
          loginPage.verifyFlashMessage(messages.invalidUsername);
          // Verify the flash banner has the 'error' CSS class (red background).
          loginPage.verifyFlashClass('error');
        });
      });
    });

    it('should show error for invalid password', () => {
      cy.fixture('users').then((users) => {
        cy.fixture('messages').then((messages) => {
          // Correct username, wrong password.
          loginPage.login(users.invalidPassword.username, users.invalidPassword.password);

          loginPage.verifyUrlContains('/login');
          // The app returns a different message for invalid password vs. username,
          // so we check for the specific password error.
          loginPage.verifyFlashMessage(messages.invalidPassword);
          loginPage.verifyFlashClass('error');
        });
      });
    });

    it('should show error when both username and password are invalid', () => {
      cy.fixture('users').then((users) => {
        cy.fixture('messages').then((messages) => {
          // Both fields are wrong. The app checks username first, so the error
          // message will be for the invalid username (not password).
          loginPage.login(users.bothInvalid.username, users.bothInvalid.password);

          loginPage.verifyUrlContains('/login');
          loginPage.verifyFlashMessage(messages.invalidUsername);
          loginPage.verifyFlashClass('error');
        });
      });
    });
  });

  // ---------------------------------------------------------------------------
  // EMPTY FIELDS
  // Tests that submitting with blank fields produces errors, not crashes.
  // ---------------------------------------------------------------------------
  describe('Empty Fields', () => {

    it('should show error when both fields are empty', () => {
      cy.fixture('messages').then((messages) => {
        // Click submit without typing anything. The form sends empty strings.
        loginPage.clickSubmit();

        loginPage.verifyUrlContains('/login');
        // Empty username triggers the "invalid username" error since the server
        // validates username before password.
        loginPage.verifyFlashMessage(messages.invalidUsername);
        loginPage.verifyFlashClass('error');
      });
    });

    it('should show error when username is empty', () => {
      cy.fixture('users').then((users) => {
        cy.fixture('messages').then((messages) => {
          // Only fill in the password, leave username empty.
          loginPage.typePassword(users.validUser.password);
          loginPage.clickSubmit();

          loginPage.verifyFlashMessage(messages.invalidUsername);
          loginPage.verifyFlashClass('error');
        });
      });
    });

    it('should show error when password is empty', () => {
      cy.fixture('users').then((users) => {
        cy.fixture('messages').then((messages) => {
          // Only fill in the username, leave password empty.
          loginPage.typeUsername(users.validUser.username);
          loginPage.clickSubmit();

          // Since the username is valid but password is empty, the app shows
          // the "invalid password" error this time.
          loginPage.verifyFlashMessage(messages.invalidPassword);
          loginPage.verifyFlashClass('error');
        });
      });
    });
  });

  // ---------------------------------------------------------------------------
  // SECURITY INPUTS
  // Tests that malicious payloads are rejected safely without causing damage.
  // ---------------------------------------------------------------------------
  describe('Security Inputs', () => {

    it('should handle SQL injection attempt without errors', () => {
      cy.fixture('users').then((users) => {
        // users.sqlInjection contains payloads like: ' OR '1'='1
        // A vulnerable app would interpret this as valid SQL and bypass auth.
        loginPage.login(users.sqlInjection.username, users.sqlInjection.password);

        // The app should treat the injection string as a literal username/password,
        // not as SQL. Verify we stayed on the login page with an error.
        loginPage.verifyUrlContains('/login');
        loginPage.flashMessage.should('be.visible');
        loginPage.verifyFlashClass('error');
      });
    });

    it('should handle XSS attempt without script execution', () => {
      cy.fixture('users').then((users) => {
        // users.xssAttack contains payloads like: <script>alert('xss')</script>
        // A vulnerable app would execute this script in the browser.
        loginPage.login(users.xssAttack.username, users.xssAttack.password);

        // Verify the app rejected the login and showed an error.
        loginPage.verifyUrlContains('/login');
        loginPage.flashMessage.should('be.visible');
        loginPage.verifyFlashClass('error');

        // CRITICAL: Verify no <script> tags were rendered in the page body.
        // cy.get('body') selects the <body> element, .then() gives us the jQuery
        // wrapper, and .html() returns the raw inner HTML string to inspect.
        cy.get('body').then(($body) => {
          const bodyHtml = $body.html();
          // If the app is vulnerable, the script tag would appear in the DOM.
          expect(bodyHtml).to.not.include('<script>alert');
        });
      });
    });
  });

  // ---------------------------------------------------------------------------
  // BOUNDARY AND EDGE CASES
  // Tests with extreme or unusual input that might break a fragile application.
  // ---------------------------------------------------------------------------
  describe('Boundary and Edge Cases', () => {

    it('should handle extremely long input strings', () => {
      cy.fixture('users').then((users) => {
        // users.longInput contains 256-character strings for both fields.
        // This tests that the app doesn't crash, truncate silently, or timeout
        // when processing very long input values.
        loginPage.login(users.longInput.username, users.longInput.password);

        loginPage.verifyUrlContains('/login');
        loginPage.flashMessage.should('be.visible');
        loginPage.verifyFlashClass('error');
      });
    });

    it('should handle special characters in credentials', () => {
      cy.fixture('users').then((users) => {
        // users.specialCharacters contains: !@#$%^&*()_+-=[]{}|;':",./<>?
        // Special characters can cause issues with URL encoding, form parsing,
        // or database queries if not handled properly.
        loginPage.login(users.specialCharacters.username, users.specialCharacters.password);

        loginPage.verifyUrlContains('/login');
        loginPage.flashMessage.should('be.visible');
        loginPage.verifyFlashClass('error');
      });
    });

    it('should handle whitespace-only input', () => {
      cy.fixture('users').then((users) => {
        // users.whitespaceOnly contains "   " (three spaces) for both fields.
        // Note: we use .clear().type() directly here instead of loginPage.login()
        // because Cypress's .type() command requires a non-empty string.
        // The login() method calls clear().type() internally, which works fine
        // with whitespace strings since they are non-empty.
        loginPage.usernameInput.clear().type(users.whitespaceOnly.username);
        loginPage.passwordInput.clear().type(users.whitespaceOnly.password);
        loginPage.clickSubmit();

        // Whitespace-only should be treated as invalid credentials.
        loginPage.verifyUrlContains('/login');
        loginPage.flashMessage.should('be.visible');
        loginPage.verifyFlashClass('error');
      });
    });

    it('should remain on login page after failed attempt without page reload artifacts', () => {
      cy.fixture('users').then((users) => {
        // After a failed login, the page should re-render cleanly with all
        // form elements intact. This catches issues where a failed POST might
        // leave the page in a broken state (missing elements, layout shifts, etc.).
        loginPage.login(users.invalidUsername.username, users.invalidUsername.password);

        // Verify the full page is loaded and all interactive elements are present.
        loginPage.verifyPageLoaded();
        loginPage.usernameInput.should('be.visible');
        loginPage.passwordInput.should('be.visible');
        loginPage.submitButton.should('be.visible');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // DATA-DRIVEN: CASE SENSITIVITY
  // Uses an array of test cases from the fixture file to verify that login
  // credentials are case-sensitive (e.g., "TOMSMITH" != "tomsmith").
  // ---------------------------------------------------------------------------
  describe('Data-Driven: Case Sensitivity', () => {

    // TypeScript interface describing the shape of each test case entry in
    // the users.json "caseSensitivity" array. This gives us type safety and
    // autocomplete when accessing properties inside the forEach loop.
    interface CaseSensitivityEntry {
      description: string;   // Human-readable label (e.g., "uppercase username")
      username: string;       // The username to test
      password: string;       // The password to test
      shouldFail: boolean;    // true = expect login failure, false = expect success
    }

    it('should validate case sensitivity across credential variations', () => {
      cy.fixture('users').then((users) => {
        cy.fixture('messages').then((messages) => {
          // Load the caseSensitivity array from users.json. It contains entries like:
          // { description: "uppercase username", username: "TOMSMITH", password: "SuperSecretPassword!", shouldFail: true }
          const testCases: CaseSensitivityEntry[] = users.caseSensitivity;

          // Iterate over each test case. forEach runs synchronously, but Cypress
          // commands inside are queued and execute in order. Each iteration visits
          // the login page, attempts login, and checks the result.
          testCases.forEach((testCase: CaseSensitivityEntry) => {
            // Navigate to /login fresh for each variation to clear any prior state.
            loginPage.visit();
            // Attempt login with this variation's credentials.
            loginPage.login(testCase.username, testCase.password);

            if (testCase.shouldFail) {
              // For variations that should fail (e.g., wrong case), verify the
              // error flash message appears with the 'error' CSS class.
              loginPage.flashMessage.should('be.visible');
              loginPage.verifyFlashClass('error');
            } else {
              // For the one variation that should succeed (correct case baseline),
              // verify we reached /secure and see the success message.
              cy.url().should('include', '/secure');
              cy.get('#flash').should('contain.text', messages.loginSuccess);
              // Navigate back to /login for the next iteration by clicking logout.
              cy.get('a.button[href="/logout"]').click();
            }
          });
        });
      });
    });
  });
});
