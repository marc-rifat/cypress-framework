/**
 * Abstract base class for all Page Objects.
 * Provides common navigation and verification methods
 * shared across all pages in the application.
 */
abstract class BasePage {
  /** The URL path for this page (relative to baseUrl). */
  protected abstract readonly url: string;

  /**
   * Navigates to this page using the configured baseUrl.
   *
   * @returns The Cypress chainable for further assertions
   */
  visit(): Cypress.Chainable<Cypress.AUTWindow> {
    return cy.visit(this.url);
  }

  /**
   * Asserts the current URL contains the given path fragment.
   *
   * @param path - The expected path substring in the URL
   */
  verifyUrlContains(path: string): void {
    cy.url().should('include', path);
  }

  /**
   * Returns the current URL as a Cypress chainable.
   *
   * @returns Chainable containing the current URL string
   */
  getCurrentUrl(): Cypress.Chainable<string> {
    return cy.url();
  }

  /**
   * Checks whether the given selector is visible on the page.
   *
   * @param selector - The CSS selector to check visibility for
   */
  isElementVisible(selector: string): void {
    cy.get(selector).should('be.visible');
  }

  /**
   * Gets the page title as a Cypress chainable.
   *
   * @returns Chainable containing the document title
   */
  getPageTitle(): Cypress.Chainable<string> {
    return cy.title();
  }
}

export default BasePage;
