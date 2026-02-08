import BasePage from './BasePage';

/** CSS selectors for elements on the Login page. */
const SELECTORS = {
  LOGIN_FORM: '#login',
  USERNAME_INPUT: '#username',
  PASSWORD_INPUT: '#password',
  SUBMIT_BUTTON: 'button[type="submit"]',
  FLASH_MESSAGE: '#flash',
  PAGE_HEADING: 'h2',
  PAGE_SUBHEADING: 'h4',
  USERNAME_LABEL: 'label[for="username"]',
  PASSWORD_LABEL: 'label[for="password"]',
} as const;

/**
 * Page Object representing the Login page at /login.
 * Encapsulates all selectors, actions, and assertions
 * related to the login form and its elements.
 */
class LoginPage extends BasePage {
  protected readonly url = '/login';

  /**
   * Returns the login form element.
   */
  get form(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(SELECTORS.LOGIN_FORM);
  }

  /**
   * Returns the username input element.
   */
  get usernameInput(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(SELECTORS.USERNAME_INPUT);
  }

  /**
   * Returns the password input element.
   */
  get passwordInput(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(SELECTORS.PASSWORD_INPUT);
  }

  /**
   * Returns the submit button element.
   */
  get submitButton(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(SELECTORS.SUBMIT_BUTTON);
  }

  /**
   * Returns the flash message element.
   */
  get flashMessage(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(SELECTORS.FLASH_MESSAGE);
  }

  /**
   * Returns the page heading element.
   */
  get heading(): Cypress.Chainable<JQuery<HTMLHeadingElement>> {
    return cy.get(SELECTORS.PAGE_HEADING);
  }

  /**
   * Returns the page subheading element.
   */
  get subheading(): Cypress.Chainable<JQuery<HTMLHeadingElement>> {
    return cy.get(SELECTORS.PAGE_SUBHEADING);
  }

  /**
   * Types a value into the username input field.
   *
   * @param username - The username to enter
   */
  typeUsername(username: string): void {
    this.usernameInput.clear().type(username);
  }

  /**
   * Types a value into the password input field.
   *
   * @param password - The password to enter
   */
  typePassword(password: string): void {
    this.passwordInput.clear().type(password);
  }

  /**
   * Clicks the login submit button.
   */
  clickSubmit(): void {
    this.submitButton.click();
  }

  /**
   * Performs a complete login action with the given credentials.
   *
   * @param username - The username to enter
   * @param password - The password to enter
   */
  login(username: string, password: string): void {
    this.typeUsername(username);
    this.typePassword(password);
    this.clickSubmit();
  }

  /**
   * Verifies the flash message contains the expected text.
   *
   * @param expectedMessage - The text expected in the flash message
   */
  verifyFlashMessage(expectedMessage: string): void {
    this.flashMessage.should('be.visible').and('contain.text', expectedMessage);
  }

  /**
   * Verifies the flash message has the expected CSS class.
   *
   * @param expectedClass - The CSS class to verify (e.g., 'success' or 'error')
   */
  verifyFlashClass(expectedClass: string): void {
    this.flashMessage.should('be.visible').and('have.class', expectedClass);
  }

  /**
   * Verifies the login page has fully loaded by checking
   * for the presence of key elements.
   */
  verifyPageLoaded(): void {
    this.heading.should('be.visible').and('contain.text', 'Login Page');
    this.usernameInput.should('be.visible');
    this.passwordInput.should('be.visible');
    this.submitButton.should('be.visible');
  }

  /**
   * Verifies the form element attributes (action and method).
   *
   * @param action - The expected form action path
   * @param method - The expected form method
   */
  verifyFormAttributes(action: string, method: string): void {
    this.form.should('have.attr', 'action', action);
    this.form.should('have.attr', 'method', method);
  }

  /**
   * Submits the form by pressing Enter in the password field.
   * Used for keyboard navigation testing.
   */
  submitWithEnterKey(): void {
    this.passwordInput.type('{enter}');
  }
}

export default LoginPage;
