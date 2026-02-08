/**
 * Drag and Drop - UI Elements and Validation Test Suite
 *
 * This test suite validates the visual structure, HTML attributes, element
 * properties, and navigation behavior of the drag-and-drop page. Unlike the
 * core functionality suite (drag-drop.cy.ts) which tests swap behavior, this
 * suite focuses on the UI layer itself -- confirming the page is built correctly
 * and maintains its structure after drag operations.
 *
 * The suite covers six categories:
 *
 * 1. PAGE ELEMENTS PRESENCE: Verifies the heading ("Drag and Drop"), both
 *    columns, and the container are visible on initial page load. These are
 *    basic smoke checks that catch broken deployments immediately.
 *
 * 2. ELEMENT ATTRIBUTES: Checks HTML attributes critical to drag-and-drop
 *    functionality: draggable="true" on columns, the "column" CSS class,
 *    and the container's #columns id.
 *
 * 3. COLUMN STRUCTURE: Validates the DOM hierarchy -- columns are direct
 *    children of the container, share the same CSS class, and each contains
 *    a header element with the column label text.
 *
 * 4. COLUMN CONTENT: Verifies the text content of each column's header
 *    matches the expected fixture data.
 *
 * 5. URL AND NAVIGATION: Confirms the page URL is correct and remains
 *    unchanged after performing a drag-and-drop operation.
 *
 * 6. VISUAL STATE AFTER DRAG: Verifies that after a drag operation, the
 *    swapped text is correct, columns remain visible, the draggable attribute
 *    persists, the column count is unchanged, and the container structure
 *    is intact.
 *
 * Architecture notes:
 * - Uses the DragDropPage Page Object for element access and drag actions.
 * - Most tests load expected values from cypress/fixtures/drag-drop.json
 *   rather than hardcoding strings, for maintainability.
 * - Each test starts with a fresh page visit via beforeEach().
 */

// Import the DragDropPage Page Object that encapsulates all selectors and
// actions for the /drag_and_drop page.
import DragDropPage from '../../pages/DragDropPage';

// Create a single instance of the page object to reuse across all tests.
const dragDropPage = new DragDropPage();

describe('Drag and Drop - UI Elements and Validation', () => {

  // Navigate to the drag-and-drop page before each test.
  // Unlike the core functionality tests, we do NOT call verifyPageLoaded()
  // here because some tests in "Page Elements Presence" ARE the verification.
  beforeEach(() => {
    dragDropPage.visit();
  });

  // ---------------------------------------------------------------------------
  // PAGE ELEMENTS PRESENCE
  // Verifies all key UI elements exist and are visible on initial page load.
  // ---------------------------------------------------------------------------
  describe('Page Elements Presence', () => {

    it('should display the page heading with correct text', () => {
      // Load expected heading text from the drag-drop fixture file.
      cy.fixture('drag-drop').then((data) => {
        // .should('be.visible') retries until the element is visible (up to 10s timeout).
        // .and('contain.text', ...) chains a second assertion on the same element.
        dragDropPage.heading.should('be.visible').and('contain.text', data.pageHeading);
      });
    });

    it('should display two draggable columns', () => {
      cy.fixture('drag-drop').then((data) => {
        // .should('have.length', 2) asserts exactly two elements match the
        // .column selector inside #columns. This confirms no extra or missing columns.
        dragDropPage.allColumns.should('have.length', data.columnCount);
      });
    });

    it('should display the columns container', () => {
      // Assert the #columns container div exists on the page.
      // Note: The container has 0px computed height because its children are
      // floated, so we use should('exist') instead of should('be.visible').
      dragDropPage.container.should('exist');
    });

    it('should display the first column with text A', () => {
      cy.fixture('drag-drop').then((data) => {
        // Verify the first column is visible and contains the text "A".
        dragDropPage.firstColumn.should('be.visible').and('contain.text', data.columnA);
      });
    });

    it('should display the last column with text B', () => {
      cy.fixture('drag-drop').then((data) => {
        // Verify the last column is visible and contains the text "B".
        dragDropPage.lastColumn.should('be.visible').and('contain.text', data.columnB);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // ELEMENT ATTRIBUTES
  // Verifies HTML attributes that are critical for drag-and-drop functionality.
  // Without draggable="true", the browser won't initiate drag operations.
  // ---------------------------------------------------------------------------
  describe('Element Attributes', () => {

    it('should have draggable attribute on the first column', () => {
      // The draggable="true" attribute tells the browser this element can be
      // picked up and dragged. Without it, drag events won't fire.
      dragDropPage.firstColumn.should('have.attr', 'draggable', 'true');
    });

    it('should have draggable attribute on the last column', () => {
      dragDropPage.lastColumn.should('have.attr', 'draggable', 'true');
    });

    it('should have the column CSS class on both columns', () => {
      cy.fixture('drag-drop').then((data) => {
        // .should('have.class', 'column') asserts each column element has the
        // CSS class "column" in its classList. This class is used for styling
        // and as a selector in the page object.
        dragDropPage.firstColumn.should('have.class', data.columnClass);
        dragDropPage.lastColumn.should('have.class', data.columnClass);
      });
    });

    it('should have the correct id on the container element', () => {
      // The container must have id="columns" for the page object selectors
      // and the application's JavaScript to work correctly.
      dragDropPage.container.should('have.attr', 'id', 'columns');
    });
  });

  // ---------------------------------------------------------------------------
  // COLUMN STRUCTURE
  // Validates the DOM hierarchy and relationships between elements.
  // ---------------------------------------------------------------------------
  describe('Column Structure', () => {

    it('should have columns as direct children of the container', () => {
      // cy.children('.column') gets only the direct child elements matching
      // the .column selector. This confirms columns are not nested deeper
      // inside wrapper divs or other intermediary elements.
      dragDropPage.container.children('.column').should('have.length', 2);
    });

    it('should have both columns with the same CSS class', () => {
      // Get the class attribute of the first column, then verify the last
      // column has the same class. This ensures consistent styling.
      dragDropPage.firstColumn.invoke('attr', 'class').then((firstClass) => {
        dragDropPage.lastColumn.should('have.attr', 'class', firstClass as string);
      });
    });

    it('should have a header element inside each column', () => {
      // Each column contains a <header> element that holds the column label
      // text ("A" or "B"). Verify both columns have this child element.
      dragDropPage.firstColumn.find('header').should('exist');
      dragDropPage.lastColumn.find('header').should('exist');
    });

    it('should have header elements containing the column label text', () => {
      cy.fixture('drag-drop').then((data) => {
        // Verify the header inside the first column contains "A" and the
        // header inside the last column contains "B".
        dragDropPage.firstColumn.find('header').should('contain.text', data.columnA);
        dragDropPage.lastColumn.find('header').should('contain.text', data.columnB);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // COLUMN CONTENT
  // Verifies the text content of columns matches expected fixture data.
  // ---------------------------------------------------------------------------
  describe('Column Content', () => {

    it('should have the correct text in the first column header', () => {
      cy.fixture('drag-drop').then((data) => {
        // .invoke('text') calls jQuery's .text() method to extract the text
        // content of the header element. .then() receives the text as a string
        // for more flexible assertions using Chai's expect().
        dragDropPage.firstColumn.find('header').invoke('text').then((text) => {
          // .trim() removes leading/trailing whitespace from the extracted text.
          expect(text.trim()).to.equal(data.columnA);
        });
      });
    });

    it('should have the correct text in the last column header', () => {
      cy.fixture('drag-drop').then((data) => {
        dragDropPage.lastColumn.find('header').invoke('text').then((text) => {
          expect(text.trim()).to.equal(data.columnB);
        });
      });
    });
  });

  // ---------------------------------------------------------------------------
  // URL AND NAVIGATION
  // Verifies routing behavior and URL stability during drag operations.
  // ---------------------------------------------------------------------------
  describe('URL and Navigation', () => {

    it('should have the correct page URL', () => {
      cy.fixture('drag-drop').then((data) => {
        // verifyUrlContains() asserts cy.url() includes '/drag_and_drop'.
        // The full URL is baseUrl + '/drag_and_drop'.
        dragDropPage.verifyUrlContains(data.url);
      });
    });

    it('should not change the URL after a drag operation', () => {
      cy.fixture('drag-drop').then((data) => {
        // Capture the URL before the drag operation.
        cy.url().then((urlBefore) => {
          // Perform a drag-and-drop swap.
          dragDropPage.dragFirstToLast();

          // Verify the URL did not change. Drag-and-drop operations should be
          // purely client-side without any navigation or hash changes.
          cy.url().should('equal', urlBefore);
          // Also verify the URL still contains the expected path.
          dragDropPage.verifyUrlContains(data.url);
        });
      });
    });
  });

  // ---------------------------------------------------------------------------
  // VISUAL STATE AFTER DRAG
  // Verifies the page maintains its structure and styling after a swap.
  // ---------------------------------------------------------------------------
  describe('Visual State After Drag', () => {

    it('should display swapped text after dragging first column to last', () => {
      cy.fixture('drag-drop').then((data) => {
        // Perform the drag to swap columns.
        dragDropPage.dragFirstToLast();

        // After the swap, the first column should now show "B" and the last
        // column should show "A" -- the opposite of the initial state.
        dragDropPage.verifyColumnOrder(data.columnB, data.columnA);
      });
    });

    it('should keep both columns visible after a drag operation', () => {
      // Perform a drag operation.
      dragDropPage.dragFirstToLast();

      // Both columns should remain visible after the swap. A broken drag
      // handler could potentially hide or remove elements.
      dragDropPage.verifyColumnsVisible();
    });

    it('should preserve the draggable attribute after a swap', () => {
      // Perform a drag operation.
      dragDropPage.dragFirstToLast();

      // The draggable="true" attribute must persist after the swap so that
      // subsequent drag operations are still possible.
      dragDropPage.firstColumn.should('have.attr', 'draggable', 'true');
      dragDropPage.lastColumn.should('have.attr', 'draggable', 'true');
    });

    it('should maintain the column count after a drag operation', () => {
      cy.fixture('drag-drop').then((data) => {
        // Perform a drag operation.
        dragDropPage.dragFirstToLast();

        // Verify the container still has exactly 2 columns. A buggy drag
        // handler could duplicate or remove column elements.
        dragDropPage.allColumns.should('have.length', data.columnCount);
      });
    });

    it('should preserve the container structure after a swap', () => {
      // Perform a drag operation.
      dragDropPage.dragFirstToLast();

      // Verify the container still exists and has 2 direct column children.
      // The container uses should('exist') because it has 0px computed height
      // due to floated children, making should('be.visible') fail.
      dragDropPage.container.should('exist');
      dragDropPage.container.children('.column').should('have.length', 2);
    });

    it('should preserve the column CSS class after a swap', () => {
      cy.fixture('drag-drop').then((data) => {
        // Perform a drag operation.
        dragDropPage.dragFirstToLast();

        // Verify both columns still have the "column" CSS class after swapping.
        dragDropPage.firstColumn.should('have.class', data.columnClass);
        dragDropPage.lastColumn.should('have.class', data.columnClass);
      });
    });

    it('should have header elements inside columns after a swap', () => {
      // Perform a drag operation.
      dragDropPage.dragFirstToLast();

      // Verify the header child elements still exist inside both columns.
      // The swap should only change header text, not remove structural elements.
      dragDropPage.firstColumn.find('header').should('exist');
      dragDropPage.lastColumn.find('header').should('exist');
    });
  });
});
