import BasePage from './BasePage';

/** CSS selectors for elements on the Secure Area page. */
const SELECTORS = {
  PAGE_HEADING: 'h2',
  FLASH_MESSAGE: '#flash',
  LOGOUT_BUTTON: 'a.button[href="/logout"]',
} as const;

/**
 * Page Object representing the Secure Area page at /secure.
 * Encapsulates selectors, actions, and assertions for
 * the authenticated secure area and logout functionality.
 */
class SecureAreaPage extends BasePage {
  protected readonly url = '/secure';

  /**
   * Returns the page heading element.
   */
  get heading(): Cypress.Chainable<JQuery<HTMLHeadingElement>> {
    return cy.get(SELECTORS.PAGE_HEADING);
  }

  /**
   * Returns the flash message element.
   */
  get flashMessage(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(SELECTORS.FLASH_MESSAGE);
  }

  /**
   * Returns the logout button element.
   */
  get logoutButton(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(SELECTORS.LOGOUT_BUTTON);
  }

  /**
   * Clicks the logout button to sign out of the secure area.
   */
  clickLogout(): void {
    this.logoutButton.click();
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
   * Verifies the secure area page has fully loaded
   * by checking for key elements.
   */
  verifyPageLoaded(): void {
    this.heading.should('be.visible').and('contain.text', 'Secure Area');
    this.logoutButton.should('be.visible');
  }
}

export default SecureAreaPage;
