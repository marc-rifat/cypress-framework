/**
 * Drag and Drop - Core Functionality Test Suite
 *
 * This test suite validates the drag-and-drop behavior on the page at
 * https://the-internet.herokuapp.com/drag_and_drop. The page has two
 * draggable columns labeled "A" (left) and "B" (right) inside a #columns
 * container. Dragging one column onto the other swaps their header text.
 *
 * The suite covers three critical areas:
 *
 * 1. INITIAL STATE: Verifies that column A is in the first position and
 *    column B is in the second position before any drag operations. This
 *    baseline ensures subsequent swap assertions are meaningful.
 *
 * 2. SINGLE SWAP OPERATIONS: Tests dragging A onto B and B onto A using
 *    the custom cy.dragAndDrop() command that dispatches real native DragEvent
 *    instances with a DataTransfer object. Verifies the column text content
 *    swaps correctly after each operation.
 *
 * 3. MULTIPLE SWAPS: Tests that two consecutive swaps restore the original
 *    order, three swaps result in a swapped state, and five rapid swaps
 *    (odd count) also end in a swapped state. These confirm the swap logic
 *    is idempotent and handles rapid repeated operations.
 *
 * Architecture notes:
 * - Uses the DragDropPage Page Object which provides drag methods backed by
 *   the custom cy.dragAndDrop() command. This command dispatches real native
 *   DragEvent instances with a DataTransfer object containing 'text/html' data,
 *   which is required because the page's drop handler calls
 *   e.dataTransfer.getData('text/html') to perform the content swap.
 * - The @4tw/cypress-drag-drop plugin is installed and available but not used
 *   for this page because the plugin expects DOM elements to physically move
 *   (change position). This page only swaps innerHTML content without moving
 *   DOM nodes, which causes the plugin's "drop success" detection to fail.
 * - Test data comes from cypress/fixtures/drag-drop.json which contains
 *   expected column text ("A", "B"), heading text, and selectors.
 * - Each test starts with a fresh page visit via beforeEach() to ensure
 *   columns are always in their initial A-B order.
 */

// Import the DragDropPage Page Object that encapsulates all selectors and
// actions for the /drag_and_drop page. It extends BasePage which provides
// visit(), verifyUrlContains(), and other common navigation methods.
import DragDropPage from '../../pages/DragDropPage';

// Create a single instance of the page object to reuse across all tests.
// The instance exposes methods like .dragFirstToLast(), .verifyColumnOrder(), etc.
const dragDropPage = new DragDropPage();

// describe() groups all drag-and-drop functionality tests together.
// Cypress uses Mocha under the hood, so describe/it/beforeEach all come
// from the Mocha test framework.
describe('Drag and Drop - Core Functionality', () => {

  // beforeEach() runs before EVERY test in this describe block (and nested blocks).
  // It navigates to the drag-and-drop page and waits for key elements to appear,
  // so each test starts from the same clean state with columns in A-B order.
  beforeEach(() => {
    // visit() navigates the browser to /drag_and_drop (appended to the baseUrl
    // configured in cypress.config.ts).
    dragDropPage.visit();
    // verifyPageLoaded() asserts the heading is visible, the container exists,
    // and both columns are present -- confirming the page fully rendered.
    dragDropPage.verifyPageLoaded();
  });

  // ---------------------------------------------------------------------------
  // INITIAL STATE
  // Verifies the page loads with columns in the correct default positions.
  // ---------------------------------------------------------------------------
  describe('Initial State', () => {

    it('should display column A in the first position and column B in the second', () => {
      // Load expected text values from the drag-drop fixture file.
      // cy.fixture() loads and parses the JSON file asynchronously.
      cy.fixture('drag-drop').then((data) => {
        // verifyColumnOrder() asserts the first column contains "A" and
        // the last column contains "B", confirming the default layout.
        dragDropPage.verifyColumnOrder(data.columnA, data.columnB);
      });
    });

    it('should have both columns visible in their initial state', () => {
      // Verify both column elements are visible on the page before any
      // drag operations are performed.
      dragDropPage.verifyColumnsVisible();
    });
  });

  // ---------------------------------------------------------------------------
  // SINGLE SWAP OPERATIONS
  // Tests individual drag operations that swap column positions once.
  // Uses cy.dragAndDrop() which dispatches real native DragEvent instances
  // with a DataTransfer object containing 'text/html' data. The page's drop
  // handler reads this data to perform the innerHTML swap between columns.
  // ---------------------------------------------------------------------------
  describe('Single Swap Operations', () => {

    it('should swap columns when dragging A onto B', () => {
      cy.fixture('drag-drop').then((data) => {
        // dragFirstToLast() dispatches native DragEvent instances (dragstart,
        // dragover, drop, dragend) with a real DataTransfer object on the DOM
        // elements. The page's drop handler reads e.dataTransfer.getData('text/html')
        // and swaps the innerHTML between source and target columns.
        dragDropPage.dragFirstToLast();

        // After the swap, column B should be first and column A should be last.
        // The swap only changes the innerHTML (header text) of each column --
        // the column DOM elements themselves stay in place.
        dragDropPage.verifyColumnOrder(data.columnB, data.columnA);
      });
    });

    it('should swap columns when dragging B onto A', () => {
      cy.fixture('drag-drop').then((data) => {
        // dragLastToFirst() drags the last column (B) onto the first column (A).
        dragDropPage.dragLastToFirst();

        // After this swap, B should be first and A should be last -- same result
        // as dragging A onto B, since both operations trigger the same swap logic.
        dragDropPage.verifyColumnOrder(data.columnB, data.columnA);
      });
    });

    it('should verify column headers update after swap', () => {
      cy.fixture('drag-drop').then((data) => {
        // Perform the swap.
        dragDropPage.dragFirstToLast();

        // Verify the inner <header> elements specifically contain the swapped text.
        // This is more precise than checking the column's full text -- it confirms
        // the swap happened in the correct child element.
        dragDropPage.firstColumn.find('header').should('contain.text', data.columnB);
        dragDropPage.lastColumn.find('header').should('contain.text', data.columnA);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // MULTIPLE SWAPS
  // Tests that repeated swaps cycle correctly and the swap logic is idempotent.
  // ---------------------------------------------------------------------------
  describe('Multiple Swaps', () => {

    it('should restore original order after two consecutive swaps', () => {
      cy.fixture('drag-drop').then((data) => {
        // First swap: A-B becomes B-A.
        dragDropPage.dragFirstToLast();
        // Verify intermediate state to confirm the first swap worked.
        dragDropPage.verifyColumnOrder(data.columnB, data.columnA);

        // Second swap: B-A becomes A-B (back to original).
        dragDropPage.dragFirstToLast();
        // Two swaps should restore the original order.
        dragDropPage.verifyColumnOrder(data.columnA, data.columnB);
      });
    });

    it('should end in swapped state after three consecutive swaps', () => {
      cy.fixture('drag-drop').then((data) => {
        // Three swaps: A-B -> B-A -> A-B -> B-A.
        // An odd number of swaps always ends in the swapped state.
        dragDropPage.dragFirstToLast();
        dragDropPage.dragFirstToLast();
        dragDropPage.dragFirstToLast();

        // After three swaps, columns should be in B-A order.
        dragDropPage.verifyColumnOrder(data.columnB, data.columnA);
      });
    });

    it('should handle five rapid consecutive swaps correctly', () => {
      cy.fixture('drag-drop').then((data) => {
        // Five swaps: odd count, so the final state should be swapped (B-A).
        // This tests that rapid repeated operations don't cause race conditions
        // or missed events in the application's swap handler.
        dragDropPage.dragFirstToLast();
        dragDropPage.dragFirstToLast();
        dragDropPage.dragFirstToLast();
        dragDropPage.dragFirstToLast();
        dragDropPage.dragFirstToLast();

        // Odd number of swaps ends in B-A order.
        dragDropPage.verifyColumnOrder(data.columnB, data.columnA);
      });
    });

    it('should restore original order after four consecutive swaps', () => {
      cy.fixture('drag-drop').then((data) => {
        // Four swaps: even count, so the final state should match the original.
        dragDropPage.dragFirstToLast();
        dragDropPage.dragFirstToLast();
        dragDropPage.dragFirstToLast();
        dragDropPage.dragFirstToLast();

        // Even number of swaps restores A-B order.
        dragDropPage.verifyColumnOrder(data.columnA, data.columnB);
      });
    });

    it('should support alternating drag directions across multiple swaps', () => {
      cy.fixture('drag-drop').then((data) => {
        // Alternate between dragging first-to-last and last-to-first.
        // Both directions should produce the same swap result.
        dragDropPage.dragFirstToLast();
        dragDropPage.verifyColumnOrder(data.columnB, data.columnA);

        // Drag in the opposite direction to restore original order.
        dragDropPage.dragLastToFirst();
        dragDropPage.verifyColumnOrder(data.columnA, data.columnB);
      });
    });
  });
});
