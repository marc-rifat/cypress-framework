import LoginPage from '../../pages/LoginPage';
import SecureAreaPage from '../../pages/SecureAreaPage';

const loginPage = new LoginPage();
const secureAreaPage = new SecureAreaPage();

describe('Login - Core Positive Flows', () => {
  beforeEach(() => {
    loginPage.visit();
    loginPage.verifyPageLoaded();
  });

  describe('Successful Login', () => {
    it('should login successfully with valid credentials', () => {
      cy.fixture('users').then((users) => {
        cy.fixture('messages').then((messages) => {
          loginPage.login(users.validUser.username, users.validUser.password);

          secureAreaPage.verifyPageLoaded();
          secureAreaPage.verifyUrlContains('/secure');
          secureAreaPage.verifyFlashMessage(messages.loginSuccess);
          secureAreaPage.verifyFlashClass('success');
        });
      });
    });

    it('should display the logout button after successful login', () => {
      cy.fixture('users').then((users) => {
        loginPage.login(users.validUser.username, users.validUser.password);

        secureAreaPage.logoutButton.should('be.visible');
        secureAreaPage.logoutButton.should('contain.text', 'Logout');
      });
    });
  });

  describe('Logout Flow', () => {
    beforeEach(() => {
      cy.fixture('users').then((users) => {
        loginPage.login(users.validUser.username, users.validUser.password);
        secureAreaPage.verifyPageLoaded();
      });
    });

    it('should logout successfully from the secure area', () => {
      cy.fixture('messages').then((messages) => {
        secureAreaPage.clickLogout();

        loginPage.verifyUrlContains('/login');
        loginPage.verifyFlashMessage(messages.logoutSuccess);
        loginPage.verifyFlashClass('success');
      });
    });

    it('should redirect to login page after logout', () => {
      secureAreaPage.clickLogout();

      loginPage.verifyUrlContains('/login');
      loginPage.verifyPageLoaded();
    });

    it('should display the login form after logout', () => {
      secureAreaPage.clickLogout();

      loginPage.usernameInput.should('be.visible');
      loginPage.passwordInput.should('be.visible');
      loginPage.submitButton.should('be.visible');
    });
  });

  describe('Authentication Lifecycle', () => {
    it('should complete a full lifecycle: login -> verify -> logout -> re-login', () => {
      cy.fixture('users').then((users) => {
        cy.fixture('messages').then((messages) => {
          // First login
          loginPage.login(users.validUser.username, users.validUser.password);
          secureAreaPage.verifyPageLoaded();
          secureAreaPage.verifyFlashMessage(messages.loginSuccess);

          // Logout
          secureAreaPage.clickLogout();
          loginPage.verifyUrlContains('/login');
          loginPage.verifyFlashMessage(messages.logoutSuccess);

          // Re-login
          loginPage.login(users.validUser.username, users.validUser.password);
          secureAreaPage.verifyPageLoaded();
          secureAreaPage.verifyFlashMessage(messages.loginSuccess);
          secureAreaPage.verifyUrlContains('/secure');
        });
      });
    });
  });
});
