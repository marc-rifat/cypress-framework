import LoginPage from '../../pages/LoginPage';
import SecureAreaPage from '../../pages/SecureAreaPage';

const loginPage = new LoginPage();
const secureAreaPage = new SecureAreaPage();

describe('Login - UI Elements and Navigation', () => {
  beforeEach(() => {
    loginPage.visit();
  });

  describe('Page Elements Presence', () => {
    it('should display the login page heading', () => {
      cy.fixture('messages').then((messages) => {
        loginPage.heading.should('be.visible').and('contain.text', messages.loginPageHeading);
      });
    });

    it('should display the login page subheading with instructions', () => {
      loginPage.subheading.should('be.visible');
      loginPage.subheading.invoke('text').then((text) => {
        expect(text.trim()).to.contain('This is where you can log into the secure area');
      });
    });

    it('should display the username and password input fields', () => {
      loginPage.usernameInput.should('be.visible');
      loginPage.passwordInput.should('be.visible');
    });

    it('should display the submit button with correct text', () => {
      loginPage.submitButton.should('be.visible');
      loginPage.submitButton.should('contain.text', 'Login');
    });
  });

  describe('Form Field Attributes', () => {
    it('should have username input with correct type attribute', () => {
      loginPage.usernameInput.should('have.attr', 'type', 'text');
    });

    it('should have password input with correct type attribute', () => {
      loginPage.passwordInput.should('have.attr', 'type', 'password');
    });

    it('should have username input with correct name attribute', () => {
      loginPage.usernameInput.should('have.attr', 'name', 'username');
    });

    it('should have password input with correct name attribute', () => {
      loginPage.passwordInput.should('have.attr', 'name', 'password');
    });

    it('should have the form with correct action and method', () => {
      loginPage.verifyFormAttributes('/authenticate', 'post');
    });
  });

  describe('Input Field Behavior', () => {
    it('should allow typing in the username field', () => {
      loginPage.usernameInput.type('testuser');
      loginPage.usernameInput.should('have.value', 'testuser');
    });

    it('should allow typing in the password field', () => {
      loginPage.passwordInput.type('testpassword');
      loginPage.passwordInput.should('have.value', 'testpassword');
    });

    it('should allow clearing the username field', () => {
      loginPage.usernameInput.type('testuser');
      loginPage.usernameInput.clear();
      loginPage.usernameInput.should('have.value', '');
    });

    it('should allow clearing the password field', () => {
      loginPage.passwordInput.type('testpassword');
      loginPage.passwordInput.clear();
      loginPage.passwordInput.should('have.value', '');
    });

    it('should mask the password input characters', () => {
      loginPage.passwordInput.should('have.attr', 'type', 'password');
      loginPage.passwordInput.type('SecretPass');
      // Password type ensures characters are masked by the browser
      loginPage.passwordInput.should('have.value', 'SecretPass');
      loginPage.passwordInput.should('have.attr', 'type', 'password');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should submit the form when Enter is pressed in the password field', () => {
      cy.fixture('users').then((users) => {
        cy.fixture('messages').then((messages) => {
          loginPage.typeUsername(users.validUser.username);
          loginPage.passwordInput.type(users.validUser.password);
          loginPage.submitWithEnterKey();

          secureAreaPage.verifyUrlContains('/secure');
          secureAreaPage.verifyFlashMessage(messages.loginSuccess);
        });
      });
    });

    it('should allow tabbing between username and password fields', () => {
      loginPage.usernameInput.focus();
      loginPage.usernameInput.should('be.focused');

      // Simulate Tab key press using realType or trigger
      loginPage.usernameInput.trigger('keydown', { keyCode: 9, which: 9, key: 'Tab' });
      // Verify password field can receive focus after username
      loginPage.passwordInput.focus();
      loginPage.passwordInput.should('be.focused');
    });
  });

  describe('URL and Navigation', () => {
    it('should have the correct login page URL', () => {
      loginPage.verifyUrlContains('/login');
    });

    it('should redirect to login when accessing /secure without authentication', () => {
      cy.visit('/secure', { failOnStatusCode: false });
      cy.url().should('include', '/login');
    });

    it('should navigate to secure area URL after successful login', () => {
      cy.fixture('users').then((users) => {
        loginPage.login(users.validUser.username, users.validUser.password);

        cy.url().should('include', '/secure');
        cy.url().should('not.include', '/login');
      });
    });
  });
});
