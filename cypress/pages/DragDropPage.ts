/**
 * Page Object for the Drag and Drop page at /drag_and_drop.
 *
 * This page has two draggable columns ("A" and "B") inside a #columns container.
 * Dragging one column onto the other swaps their text content. The columns have
 * no individual IDs -- they are identified by their position within the container
 * using :first-child and :last-child CSS pseudo-selectors.
 *
 * The page uses HTML5 native drag-and-drop, which means the columns have
 * draggable="true" attributes and the application's JavaScript listens for
 * dragstart, dragover, and drop events to perform the swap. The drop handler
 * reads e.dataTransfer.getData('text/html') to get the source column's HTML
 * content, then swaps innerHTML between source and target.
 *
 * This page object uses the custom cy.dragAndDrop() command that dispatches
 * real native DragEvent instances with a DataTransfer object. This is necessary
 * because the page's JavaScript requires a real DataTransfer with 'text/html'
 * data for the swap to work. The @4tw/cypress-drag-drop plugin is not used
 * here because it expects DOM elements to physically move (change bounding rect),
 * but this page only swaps innerHTML content without moving DOM nodes.
 *
 * Note: The page heading is h3 (not h2 like the login page). The #columns
 * container has 0px computed height because its children are floated, so we
 * use should('exist') instead of should('be.visible') when checking the container.
 */

import BasePage from './BasePage';

/**
 * CSS selectors for elements on the Drag and Drop page.
 * Columns are identified by position (first-child / last-child) because
 * the application does not assign individual IDs to each column -- only
 * the innerHTML (header text) swaps when a drag-and-drop occurs.
 */
const SELECTORS = {
  CONTAINER: '#columns',
  FIRST_COLUMN: '#columns > .column:first-child',
  LAST_COLUMN: '#columns > .column:last-child',
  ALL_COLUMNS: '#columns > .column',
  PAGE_HEADING: 'h3',
  COLUMN_HEADER: 'header',
} as const;

/**
 * Page Object representing the Drag and Drop page at /drag_and_drop.
 * Encapsulates all selectors, actions, and assertions related to the
 * two draggable columns and their swap behavior.
 */
class DragDropPage extends BasePage {
  protected readonly url = '/drag_and_drop';

  // ---------------------------------------------------------------------------
  // ELEMENT GETTERS
  // Each getter returns a Cypress chainable that can be used for assertions
  // or further actions. The getters abstract away the raw CSS selectors.
  // ---------------------------------------------------------------------------

  /**
   * Returns the columns container element (#columns).
   * Note: This element has 0px computed height due to floated children,
   * so use should('exist') instead of should('be.visible') for assertions.
   */
  get container(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(SELECTORS.CONTAINER);
  }

  /**
   * Returns the first (left) column element.
   * After a swap, this will contain the text of whatever column moved to
   * the first position.
   */
  get firstColumn(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(SELECTORS.FIRST_COLUMN);
  }

  /**
   * Returns the last (right) column element.
   * After a swap, this will contain the text of whatever column moved to
   * the last position.
   */
  get lastColumn(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(SELECTORS.LAST_COLUMN);
  }

  /**
   * Returns all column elements as a Cypress chainable collection.
   */
  get allColumns(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(SELECTORS.ALL_COLUMNS);
  }

  /**
   * Returns the page heading element (h3 on this page).
   */
  get heading(): Cypress.Chainable<JQuery<HTMLHeadingElement>> {
    return cy.get(SELECTORS.PAGE_HEADING);
  }

  // ---------------------------------------------------------------------------
  // DRAG ACTIONS
  // Uses cy.dragAndDrop() custom command which dispatches real native DragEvent
  // instances with a DataTransfer object containing 'text/html' data. This is
  // necessary because the page's drop handler calls
  // e.dataTransfer.getData('text/html') to read the source column's HTML content.
  // ---------------------------------------------------------------------------

  /**
   * Drags the first column onto the last column using the custom cy.dragAndDrop()
   * command that dispatches real native DragEvent instances with a DataTransfer
   * object. The page's JavaScript reads e.dataTransfer.getData('text/html') in
   * its drop handler, which requires a real DataTransfer with data set via setData().
   */
  dragFirstToLast(): void {
    cy.dragAndDrop(SELECTORS.FIRST_COLUMN, SELECTORS.LAST_COLUMN);
  }

  /**
   * Drags the last column onto the first column using the custom cy.dragAndDrop()
   * command with real native DragEvent instances.
   */
  dragLastToFirst(): void {
    cy.dragAndDrop(SELECTORS.LAST_COLUMN, SELECTORS.FIRST_COLUMN);
  }

  // ---------------------------------------------------------------------------
  // VERIFICATION METHODS
  // Assert the state of the page after drag operations or on initial load.
  // ---------------------------------------------------------------------------

  /**
   * Verifies the first column contains the expected text.
   *
   * @param expectedText - The text expected in the first column's header (e.g., "A" or "B")
   */
  verifyFirstColumnText(expectedText: string): void {
    this.firstColumn.should('contain.text', expectedText);
  }

  /**
   * Verifies the last column contains the expected text.
   *
   * @param expectedText - The text expected in the last column's header (e.g., "A" or "B")
   */
  verifyLastColumnText(expectedText: string): void {
    this.lastColumn.should('contain.text', expectedText);
  }

  /**
   * Verifies both columns show the expected text in the expected positions.
   * This is the primary assertion used after drag operations to confirm
   * the swap occurred (or didn't occur).
   *
   * @param firstText - Expected text in the first (left) column
   * @param lastText - Expected text in the last (right) column
   */
  verifyColumnOrder(firstText: string, lastText: string): void {
    this.verifyFirstColumnText(firstText);
    this.verifyLastColumnText(lastText);
  }

  /**
   * Verifies the drag-and-drop page has fully loaded by checking for the
   * presence of key elements: heading, container, and both columns.
   * Note: The container uses should('exist') instead of should('be.visible')
   * because it has 0px computed height due to its children being floated.
   */
  verifyPageLoaded(): void {
    this.heading.should('be.visible');
    this.container.should('exist');
    this.allColumns.should('have.length', 2);
  }

  /**
   * Verifies both columns are visible on the page.
   */
  verifyColumnsVisible(): void {
    this.firstColumn.should('be.visible');
    this.lastColumn.should('be.visible');
  }
}

export default DragDropPage;
