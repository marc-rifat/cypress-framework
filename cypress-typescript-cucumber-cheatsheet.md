# Cypress + TypeScript + Cucumber Cheatsheet

---

## Table of Contents

1. [Setup & Installation](#setup--installation)
2. [Project Configuration](#project-configuration)
3. [Recommended Directory Structure](#recommended-directory-structure)
4. [Gherkin Syntax (`.feature` files)](#gherkin-syntax-feature-files)
   - [Basic Feature File](#basic-feature-file)
   - [Scenario Outline (Data-Driven)](#scenario-outline-data-driven)
   - [Data Tables](#data-tables)
   - [Tags](#tags)
5. [Step Definitions](#step-definitions)
   - [Basic Steps](#basic-steps)
   - [Parameterized Steps](#parameterized-steps)
   - [Data Table Steps](#data-table-steps)
   - [Step with Doc String](#step-with-doc-string)
6. [Page Object Model](#page-object-model)
7. [Custom Commands (TypeScript)](#custom-commands-typescript)
8. [Common Cypress Assertions](#common-cypress-assertions)
   - [Visibility & Existence](#visibility--existence)
   - [Text & Value](#text--value)
   - [CSS & Attributes](#css--attributes)
   - [Length & Count](#length--count)
   - [URL & Location](#url--location)
9. [API Testing in Steps](#api-testing-in-steps)
10. [Hooks (Before / After)](#hooks-before--after)
11. [CLI Commands](#cli-commands)
    - [Basic Execution](#basic-execution)
    - [Headed vs Headless](#headed-vs-headless)
    - [Browser Selection](#browser-selection)
    - [Running Specific Tests](#running-specific-tests)
    - [Tag-Based Execution (Cucumber)](#tag-based-execution-cucumber)
    - [Parallel Execution](#parallel-execution)
    - [Environment Variables](#environment-variables)
    - [Recording & Reporting](#recording--reporting)
    - [Retry & Timeout](#retry--timeout)
    - [Housekeeping](#housekeeping)
    - [CI Quick-Reference Combos](#ci-quick-reference-combos)
12. [Debugging](#debugging)
13. [Tips & Patterns](#tips--patterns)

---

## Setup & Installation

### Initialize a new project

```bash
npm init -y
```

### Install Cypress

```bash
npm install --save-dev cypress
```

### Install TypeScript

```bash
npm install --save-dev typescript
```

### Install Cucumber preprocessor

```bash
npm install --save-dev @badeball/cypress-cucumber-preprocessor
```

### Install esbuild bundler (recommended)

```bash
npm install --save-dev @bahmutov/cypress-esbuild-preprocessor
```

### Install esbuild

```bash
npm install --save-dev esbuild
```

### Open Cypress for first-time scaffolding

```bash
npx cypress open
```

---

## Project Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "lib": ["ES2021", "DOM", "DOM.Iterable"],
    "module": "commonjs",
    "moduleResolution": "node",
    "types": ["cypress", "@badeball/cypress-cucumber-preprocessor"],
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["cypress/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### cypress.config.ts

```ts
import { defineConfig } from "cypress";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import { createEsbuildPlugin } from "@badeball/cypress-cucumber-preprocessor/esbuild";

export default defineConfig({
  e2e: {
    specPattern: "cypress/e2e/**/*.feature",
    baseUrl: "http://localhost:3000",
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);
      on(
        "file:preprocessor",
        createBundler({ plugins: [createEsbuildPlugin(config)] })
      );
      return config;
    },
  },
});
```

### .cypress-cucumber-preprocessorrc.json

```json
{
  "stepDefinitions": [
    "cypress/e2e/step_definitions/**/*.ts"
  ],
  "nonGlobalStepDefinitions": false
}
```

---

## Recommended Directory Structure

```
cypress/
├── e2e/
│   ├── features/
│   │   └── login.feature
│   └── step_definitions/
│       └── login.steps.ts
├── fixtures/
│   └── users.json
├── support/
│   ├── commands.ts
│   ├── e2e.ts
│   └── pages/
│       └── LoginPage.ts
└── plugins/
    └── index.ts
```

---

## Gherkin Syntax (`.feature` files)

### Basic Feature File

```gherkin
Feature: User Login

  Background:
    Given the user is on the login page

  Scenario: Successful login
    When the user enters valid credentials
    And the user clicks the login button
    Then the user should see the dashboard

  Scenario: Failed login
    When the user enters invalid credentials
    And the user clicks the login button
    Then an error message should be displayed
```

### Scenario Outline (Data-Driven)

```gherkin
Scenario Outline: Login with multiple users
  When the user enters "<username>" and "<password>"
  Then the result should be "<outcome>"

  Examples:
    | username | password | outcome |
    | admin    | pass123  | success |
    | guest    | wrong    | failure |
```

### Data Tables

```gherkin
Scenario: Fill out a form
  When the user fills in the form with:
    | field    | value           |
    | name     | John Doe        |
    | email    | john@example.com|
```

### Tags

```gherkin
@smoke
Feature: Critical Flows

  @regression
  Scenario: Checkout flow
    Given the user has items in cart
```

---

## Step Definitions

### Basic Steps

```ts
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("the user is on the login page", () => {
  cy.visit("/login");
});

When("the user enters valid credentials", () => {
  cy.get("[data-cy=username]").type("admin");
  cy.get("[data-cy=password]").type("password123");
});

Then("the user should see the dashboard", () => {
  cy.url().should("include", "/dashboard");
});
```

### Parameterized Steps

```ts
When("the user enters {string} and {string}", (username: string, password: string) => {
  cy.get("[data-cy=username]").type(username);
  cy.get("[data-cy=password]").type(password);
});

Then("the result should be {string}", (outcome: string) => {
  if (outcome === "success") {
    cy.url().should("include", "/dashboard");
  } else {
    cy.get("[data-cy=error]").should("be.visible");
  }
});
```

### Data Table Steps

```ts
When("the user fills in the form with:", (dataTable: DataTable) => {
  const rows = dataTable.hashes();
  rows.forEach((row) => {
    cy.get(`[data-cy=${row.field}]`).type(row.value);
  });
});
```

### Step with Doc String

```gherkin
When the user submits the following JSON:
  """
  {
    "name": "John",
    "role": "admin"
  }
  """
```

```ts
When("the user submits the following JSON:", (docString: string) => {
  const payload = JSON.parse(docString);
  cy.request("POST", "/api/users", payload);
});
```

---

## Page Object Model

### Page Class

```ts
// cypress/support/pages/LoginPage.ts
export class LoginPage {
  readonly url = "/login";

  visit(): void {
    cy.visit(this.url);
  }

  fillUsername(value: string): void {
    cy.get("[data-cy=username]").clear().type(value);
  }

  fillPassword(value: string): void {
    cy.get("[data-cy=password]").clear().type(value);
  }

  submit(): void {
    cy.get("[data-cy=login-btn]").click();
  }

  getErrorMessage(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get("[data-cy=error-message]");
  }
}
```

### Using Page Objects in Steps

```ts
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { LoginPage } from "../../support/pages/LoginPage";

const loginPage = new LoginPage();

Given("the user is on the login page", () => {
  loginPage.visit();
});

When("the user enters valid credentials", () => {
  loginPage.fillUsername("admin");
  loginPage.fillPassword("pass123");
  loginPage.submit();
});
```

---

## Custom Commands (TypeScript)

### Defining Commands

```ts
// cypress/support/commands.ts
declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
      getByDataCy(selector: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add("login", (username: string, password: string) => {
  cy.session([username, password], () => {
    cy.visit("/login");
    cy.get("[data-cy=username]").type(username);
    cy.get("[data-cy=password]").type(password);
    cy.get("[data-cy=login-btn]").click();
    cy.url().should("include", "/dashboard");
  });
});

Cypress.Commands.add("getByDataCy", (selector: string) => {
  return cy.get(`[data-cy=${selector}]`);
});

export {};
```

### Using Custom Commands in Steps

```ts
When("the user logs in as admin", () => {
  cy.login("admin", "password123");
});
```

---

## Common Cypress Assertions

### Visibility & Existence

```ts
cy.get(selector).should("be.visible");
cy.get(selector).should("not.exist");
cy.get(selector).should("exist");
cy.get(selector).should("be.disabled");
cy.get(selector).should("be.enabled");
```

### Text & Value

```ts
cy.get(selector).should("have.text", "Hello");
cy.get(selector).should("contain.text", "Hel");
cy.get(selector).should("have.value", "input-value");
cy.get(selector).invoke("text").should("match", /regex/);
```

### CSS & Attributes

```ts
cy.get(selector).should("have.class", "active");
cy.get(selector).should("have.attr", "href", "/home");
cy.get(selector).should("have.css", "color", "rgb(0, 0, 0)");
```

### Length & Count

```ts
cy.get("li").should("have.length", 5);
cy.get("li").should("have.length.greaterThan", 2);
```

### URL & Location

```ts
cy.url().should("include", "/dashboard");
cy.url().should("eq", "http://localhost:3000/dashboard");
cy.location("pathname").should("eq", "/login");
```

---

## API Testing in Steps

### Intercept & Stub

```ts
Given("the API returns a list of users", () => {
  cy.intercept("GET", "/api/users", {
    statusCode: 200,
    fixture: "users.json",
  }).as("getUsers");
});

Then("the API call should have been made", () => {
  cy.wait("@getUsers").its("response.statusCode").should("eq", 200);
});
```

### Direct API Request

```ts
When("the user is created via API", () => {
  cy.request({
    method: "POST",
    url: "/api/users",
    body: { name: "Jane", email: "jane@test.com" },
  }).then((response) => {
    expect(response.status).to.eq(201);
    expect(response.body).to.have.property("id");
  });
});
```

---

## Hooks (Before / After)

### Cucumber Hooks

```ts
import { Before, After, BeforeAll, AfterAll } from "@badeball/cypress-cucumber-preprocessor";

BeforeAll(() => {
  // runs once before all scenarios
});

Before(() => {
  // runs before each scenario
  cy.clearCookies();
  cy.clearLocalStorage();
});

Before({ tags: "@login" }, () => {
  // runs only before scenarios tagged @login
  cy.login("admin", "pass123");
});

After(() => {
  // runs after each scenario
});

AfterAll(() => {
  // runs once after all scenarios
});
```

---

## CLI Commands

### Basic Execution

#### Run all tests headlessly (default)

```bash
npx cypress run
```

#### Open interactive Test Runner (GUI)

```bash
npx cypress open
```

#### Open Test Runner for E2E tests only

```bash
npx cypress open --e2e
```

#### Open Test Runner for component tests only

```bash
npx cypress open --component
```

---

### Headed vs Headless

#### Run all tests in headed mode (visible browser)

```bash
npx cypress run --headed
```

#### Run a specific feature headed

```bash
npx cypress run --headed --spec "cypress/e2e/features/login.feature"
```

#### Run headlessly (explicit, default behavior)

```bash
npx cypress run --headless
```

---

### Browser Selection

#### Run in Chrome

```bash
npx cypress run --browser chrome
```

#### Run in Firefox

```bash
npx cypress run --browser firefox
```

#### Run in Edge

```bash
npx cypress run --browser edge
```

#### Run in Electron (default)

```bash
npx cypress run --browser electron
```

#### Run headed in Chrome

```bash
npx cypress run --headed --browser chrome
```

#### Run headed in Firefox

```bash
npx cypress run --headed --browser firefox
```

#### Open interactive runner in Chrome

```bash
npx cypress open --browser chrome
```

#### Open interactive runner in Firefox

```bash
npx cypress open --browser firefox
```

#### List all detected browsers

```bash
npx cypress info
```

#### Run with a specific browser binary path

```bash
npx cypress run --browser /usr/bin/google-chrome-stable
```

---

### Running Specific Tests

#### Run a single feature file

```bash
npx cypress run --spec "cypress/e2e/features/login.feature"
```

#### Run multiple specific feature files

```bash
npx cypress run --spec "cypress/e2e/features/login.feature,cypress/e2e/features/checkout.feature"
```

#### Run all features in a subfolder

```bash
npx cypress run --spec "cypress/e2e/features/auth/**/*.feature"
```

#### Run features matching a glob pattern

```bash
npx cypress run --spec "cypress/e2e/features/**/login*.feature"
```

#### Run a specific feature headed in Chrome

```bash
npx cypress run --spec "cypress/e2e/features/login.feature" --headed --browser chrome
```

---

### Tag-Based Execution (Cucumber)

#### Run scenarios tagged @smoke

```bash
npx cypress run --env tags="@smoke"
```

#### Run scenarios tagged @regression

```bash
npx cypress run --env tags="@regression"
```

#### Run scenarios with multiple tags (AND)

```bash
npx cypress run --env tags="@smoke and @login"
```

#### Run scenarios with either tag (OR)

```bash
npx cypress run --env tags="@smoke or @checkout"
```

#### Exclude scenarios tagged @wip

```bash
npx cypress run --env tags="not @wip"
```

#### Combine include and exclude tags

```bash
npx cypress run --env tags="@regression and not @flaky"
```

#### Run @smoke scenarios headed in Chrome

```bash
npx cypress run --env tags="@smoke" --headed --browser chrome
```

---

### Parallel Execution

#### Run tests in parallel with Cypress Cloud

```bash
npx cypress run --record --parallel --key YOUR_PROJECT_KEY
```

#### Run parallel with a specific CI build ID

```bash
npx cypress run --record --parallel --ci-build-id $BUILD_ID --key YOUR_PROJECT_KEY
```

#### Run parallel with a group name

```bash
npx cypress run --record --parallel --group "e2e-chrome" --key YOUR_PROJECT_KEY
```

#### Run parallel in Chrome with a group

```bash
npx cypress run --record --parallel --group "chrome-tests" --browser chrome --key YOUR_PROJECT_KEY
```

#### Run parallel in Firefox with a group (multi-browser CI matrix)

```bash
npx cypress run --record --parallel --group "firefox-tests" --browser firefox --key YOUR_PROJECT_KEY
```

#### Install cypress-parallel for local parallelism (no Cypress Cloud)

```bash
npm install --save-dev cypress-parallel
```

#### Run locally in parallel with cypress-parallel (4 threads)

```bash
npx cypress-parallel -s "cypress:run" -t 4 -d "cypress/e2e/features"
```

---

### Environment Variables

#### Pass a single env variable

```bash
npx cypress run --env baseUrl=http://staging.example.com
```

#### Pass multiple env variables

```bash
npx cypress run --env baseUrl=http://staging.example.com,apiKey=abc123
```

#### Use a config file override

```bash
npx cypress run --config-file cypress.staging.config.ts
```

#### Override a single config value

```bash
npx cypress run --config video=true,screenshotOnRunFailure=true
```

#### Override base URL directly

```bash
npx cypress run --config baseUrl=http://staging.example.com
```

---

### Recording & Reporting

#### Record test run to Cypress Cloud

```bash
npx cypress run --record --key YOUR_PROJECT_KEY
```

#### Record with a custom tag

```bash
npx cypress run --record --key YOUR_PROJECT_KEY --tag "nightly,staging"
```

#### Enable video recording

```bash
npx cypress run --config video=true
```

#### Disable video recording

```bash
npx cypress run --config video=false
```

#### Generate Cucumber JSON report (preprocessor config)

Add to `.cypress-cucumber-preprocessorrc.json`:

```json
{
  "json": {
    "enabled": true,
    "output": "cypress/reports/cucumber-report.json"
  }
}
```

#### Install multi-reporter for Cucumber HTML

```bash
npm install --save-dev multiple-cucumber-html-reporter
```

#### Generate Cucumber HTML report (after test run)

```bash
node generate-report.js
```

#### Install Mochawesome reporter

```bash
npm install --save-dev mochawesome mochawesome-merge mochawesome-report-generator
```

#### Merge Mochawesome JSON reports

```bash
npx mochawesome-merge "cypress/reports/*.json" > merged-report.json
```

#### Generate Mochawesome HTML report

```bash
npx marge merged-report.json --reportDir cypress/reports/html
```

---

### Retry & Timeout

#### Run with retries on failure

```bash
npx cypress run --config retries=2
```

#### Set separate retries for run mode vs open mode

```bash
npx cypress run --config retries='{"runMode":2,"openMode":0}'
```

#### Override default command timeout

```bash
npx cypress run --config defaultCommandTimeout=10000
```

#### Override page load timeout

```bash
npx cypress run --config pageLoadTimeout=60000
```

---

### Housekeeping

#### Verify Cypress installation

```bash
npx cypress verify
```

#### Show Cypress info (version, browsers, paths)

```bash
npx cypress info
```

#### Print Cypress version

```bash
npx cypress version
```

#### Clear Cypress cache

```bash
npx cypress cache clear
```

#### List cached Cypress versions

```bash
npx cypress cache list
```

#### Install Cypress binary (CI environments)

```bash
npx cypress install
```

#### Force reinstall Cypress binary

```bash
npx cypress install --force
```

---

### CI Quick-Reference Combos

#### Full headless Chrome run with recording

```bash
npx cypress run --browser chrome --record --key YOUR_PROJECT_KEY
```

#### Smoke tests only, headed Chrome, with video

```bash
npx cypress run --env tags="@smoke" --headed --browser chrome --config video=true
```

#### Specific feature, Firefox, with retries

```bash
npx cypress run --spec "cypress/e2e/features/checkout.feature" --browser firefox --config retries=2
```

#### Parallel smoke suite across Chrome nodes in CI

```bash
npx cypress run --env tags="@smoke" --browser chrome --record --parallel --group "smoke-chrome" --key YOUR_PROJECT_KEY
```

#### Staging environment, regression suite, headed Edge

```bash
npx cypress run --env tags="@regression",baseUrl=http://staging.example.com --headed --browser edge
```

---

## Debugging

### Pause execution

```ts
cy.pause();
```

### Debug in DevTools

```ts
cy.get(selector).debug();
```

### Log to command log

```ts
cy.log("Current step: navigating to dashboard");
```

### Screenshot on demand

```ts
cy.screenshot("after-login");
```

### Print to terminal (in Node context)

```ts
cy.task("log", "Message from test");
```

Task setup in `cypress.config.ts`:

```ts
setupNodeEvents(on, config) {
  on("task", {
    log(message: string) {
      console.log(message);
      return null;
    },
  });
}
```

---

## Tips & Patterns

- Use `data-cy` attributes for selectors instead of classes or IDs.
- Keep step definitions reusable and generic.
- Use `cy.session()` for login to avoid repeating auth flows.
- Use `cy.intercept()` to mock APIs and isolate frontend tests.
- Keep feature files focused on business behavior, not implementation.
- Use `Background` in Gherkin for shared preconditions.
- Tag scenarios for selective test runs (`@smoke`, `@regression`, `@wip`).
- Use fixtures (`cypress/fixtures/`) for test data.
- Avoid hardcoded waits (`cy.wait(5000)`); prefer assertions or aliases.
