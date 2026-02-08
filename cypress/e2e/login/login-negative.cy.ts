import LoginPage from '../../pages/LoginPage';

const loginPage = new LoginPage();

describe('Login - Negative and Edge Cases', () => {
  beforeEach(() => {
    loginPage.visit();
    loginPage.verifyPageLoaded();
  });

  describe('Invalid Credentials', () => {
    it('should show error for invalid username', () => {
      cy.fixture('users').then((users) => {
        cy.fixture('messages').then((messages) => {
          loginPage.login(users.invalidUsername.username, users.invalidUsername.password);

          loginPage.verifyUrlContains('/login');
          loginPage.verifyFlashMessage(messages.invalidUsername);
          loginPage.verifyFlashClass('error');
        });
      });
    });

    it('should show error for invalid password', () => {
      cy.fixture('users').then((users) => {
        cy.fixture('messages').then((messages) => {
          loginPage.login(users.invalidPassword.username, users.invalidPassword.password);

          loginPage.verifyUrlContains('/login');
          loginPage.verifyFlashMessage(messages.invalidPassword);
          loginPage.verifyFlashClass('error');
        });
      });
    });

    it('should show error when both username and password are invalid', () => {
      cy.fixture('users').then((users) => {
        cy.fixture('messages').then((messages) => {
          loginPage.login(users.bothInvalid.username, users.bothInvalid.password);

          loginPage.verifyUrlContains('/login');
          loginPage.verifyFlashMessage(messages.invalidUsername);
          loginPage.verifyFlashClass('error');
        });
      });
    });
  });

  describe('Empty Fields', () => {
    it('should show error when both fields are empty', () => {
      cy.fixture('messages').then((messages) => {
        loginPage.clickSubmit();

        loginPage.verifyUrlContains('/login');
        loginPage.verifyFlashMessage(messages.invalidUsername);
        loginPage.verifyFlashClass('error');
      });
    });

    it('should show error when username is empty', () => {
      cy.fixture('users').then((users) => {
        cy.fixture('messages').then((messages) => {
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
          loginPage.typeUsername(users.validUser.username);
          loginPage.clickSubmit();

          loginPage.verifyFlashMessage(messages.invalidPassword);
          loginPage.verifyFlashClass('error');
        });
      });
    });
  });

  describe('Security Inputs', () => {
    it('should handle SQL injection attempt without errors', () => {
      cy.fixture('users').then((users) => {
        loginPage.login(users.sqlInjection.username, users.sqlInjection.password);

        loginPage.verifyUrlContains('/login');
        loginPage.flashMessage.should('be.visible');
        loginPage.verifyFlashClass('error');
      });
    });

    it('should handle XSS attempt without script execution', () => {
      cy.fixture('users').then((users) => {
        loginPage.login(users.xssAttack.username, users.xssAttack.password);

        loginPage.verifyUrlContains('/login');
        loginPage.flashMessage.should('be.visible');
        loginPage.verifyFlashClass('error');
        // Verify no script tags are rendered in the DOM
        cy.get('body').then(($body) => {
          const bodyHtml = $body.html();
          expect(bodyHtml).to.not.include('<script>alert');
        });
      });
    });
  });

  describe('Boundary and Edge Cases', () => {
    it('should handle extremely long input strings', () => {
      cy.fixture('users').then((users) => {
        loginPage.login(users.longInput.username, users.longInput.password);

        loginPage.verifyUrlContains('/login');
        loginPage.flashMessage.should('be.visible');
        loginPage.verifyFlashClass('error');
      });
    });

    it('should handle special characters in credentials', () => {
      cy.fixture('users').then((users) => {
        loginPage.login(users.specialCharacters.username, users.specialCharacters.password);

        loginPage.verifyUrlContains('/login');
        loginPage.flashMessage.should('be.visible');
        loginPage.verifyFlashClass('error');
      });
    });

    it('should handle whitespace-only input', () => {
      cy.fixture('users').then((users) => {
        loginPage.usernameInput.clear().type(users.whitespaceOnly.username);
        loginPage.passwordInput.clear().type(users.whitespaceOnly.password);
        loginPage.clickSubmit();

        loginPage.verifyUrlContains('/login');
        loginPage.flashMessage.should('be.visible');
        loginPage.verifyFlashClass('error');
      });
    });

    it('should remain on login page after failed attempt without page reload artifacts', () => {
      cy.fixture('users').then((users) => {
        loginPage.login(users.invalidUsername.username, users.invalidUsername.password);

        loginPage.verifyPageLoaded();
        loginPage.usernameInput.should('be.visible');
        loginPage.passwordInput.should('be.visible');
        loginPage.submitButton.should('be.visible');
      });
    });
  });

  describe('Data-Driven: Case Sensitivity', () => {
    interface CaseSensitivityEntry {
      description: string;
      username: string;
      password: string;
      shouldFail: boolean;
    }

    it('should validate case sensitivity across credential variations', () => {
      cy.fixture('users').then((users) => {
        cy.fixture('messages').then((messages) => {
          const testCases: CaseSensitivityEntry[] = users.caseSensitivity;

          testCases.forEach((testCase: CaseSensitivityEntry) => {
            loginPage.visit();
            loginPage.login(testCase.username, testCase.password);

            if (testCase.shouldFail) {
              loginPage.flashMessage.should('be.visible');
              loginPage.verifyFlashClass('error');
            } else {
              cy.url().should('include', '/secure');
              cy.get('#flash').should('contain.text', messages.loginSuccess);
              // Navigate back to login for next iteration
              cy.get('a.button[href="/logout"]').click();
            }
          });
        });
      });
    });
  });
});
