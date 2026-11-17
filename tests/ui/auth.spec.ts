import { test, expect } from '@fixtures/test';
import { fieldValidity } from '@pages/base.page';

test.describe('Authentication', () => {
  test.beforeEach(async ({ loginSignupPage }) => {
    await loginSignupPage.open();
  });

  test(
    'AUTH-01: new user registers through the UI and deletes the account',
    {
      tag: '@smoke',
    },
    async ({ loginSignupPage, signupPage, newUser }) => {
      await loginSignupPage.startSignup(newUser.name, newUser.email);
      await expect(signupPage.heading).toBeVisible();
      await expect(signupPage.nameInput).toHaveValue(newUser.name);
      await expect(signupPage.emailInput).toHaveValue(newUser.email);

      await signupPage.createAccount(newUser);
      await expect(signupPage.accountCreatedHeading).toHaveText('Account Created!');

      await signupPage.continueButton.click();
      await expect(signupPage.header.loggedInAs).toContainText(newUser.name);

      await signupPage.header.deleteAccount();
      await expect(signupPage.accountDeletedHeading).toHaveText('Account Deleted!');
    },
  );

  test(
    'AUTH-02: registered user logs in and out',
    { tag: '@smoke' },
    async ({ page, loginSignupPage, registeredUser }) => {
      await loginSignupPage.login(registeredUser.email, registeredUser.password);
      await expect(loginSignupPage.header.loggedInAs).toContainText(registeredUser.name);

      await loginSignupPage.header.logout();
      await expect(page).toHaveURL(/\/login$/);
      await expect(loginSignupPage.header.signupLoginLink).toBeVisible();
      await expect(loginSignupPage.header.loggedInAs).toBeHidden();
    },
  );

  test('AUTH-03: login with a wrong password is rejected', async ({
    loginSignupPage,
    registeredUser,
  }) => {
    await loginSignupPage.login(registeredUser.email, `${registeredUser.password}-wrong`);

    await expect(loginSignupPage.loginError).toBeVisible();
    await expect(loginSignupPage.header.loggedInAs).toBeHidden();
  });

  test('AUTH-04: login with an unregistered email is rejected', async ({
    loginSignupPage,
    newUser,
  }) => {
    await loginSignupPage.login(newUser.email, newUser.password);

    await expect(loginSignupPage.loginError).toBeVisible();
  });

  test('AUTH-05: signup with an already registered email is rejected', async ({
    loginSignupPage,
    registeredUser,
  }) => {
    await loginSignupPage.startSignup('Another Name', registeredUser.email);

    await expect(loginSignupPage.signupError).toBeVisible();
  });

  test('AUTH-06: signup with empty fields is blocked by form validation', async ({
    page,
    loginSignupPage,
  }) => {
    await loginSignupPage.signupButton.click();

    expect(await fieldValidity(loginSignupPage.signupName)).toMatchObject({ valueMissing: true });
    expect(await fieldValidity(loginSignupPage.signupEmail)).toMatchObject({ valueMissing: true });
    await expect(page).toHaveURL(/\/login$/);
  });
});
