import { test as base, expect } from '@playwright/test';
import { AutomationExerciseApi } from '@api/automation-exercise.client';
import { buildUser, type User } from '@data/user.factory';
import { CartPage } from '@pages/cart.page';
import { CheckoutPage } from '@pages/checkout.page';
import { ContactPage } from '@pages/contact.page';
import { LoginSignupPage } from '@pages/login-signup.page';
import { PaymentPage } from '@pages/payment.page';
import { ProductDetailPage } from '@pages/product-detail.page';
import { ProductsPage } from '@pages/products.page';
import { SignupPage } from '@pages/signup.page';
import { blockThirdPartyNoise } from './network-noise';

interface PageObjects {
  loginSignupPage: LoginSignupPage;
  signupPage: SignupPage;
  productsPage: ProductsPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  paymentPage: PaymentPage;
  contactPage: ContactPage;
}

interface DataFixtures {
  api: AutomationExerciseApi;
  /** Unique user data that is NOT registered yet; removed after the test if it was. */
  newUser: User;
  /** User registered through the API before the test and deleted after it. */
  registeredUser: User;
  /** `registeredUser`, already logged in through the UI. */
  loggedInUser: User;
}

async function deleteAccountQuietly(api: AutomationExerciseApi, user: User): Promise<void> {
  try {
    const { body } = await api.deleteAccount(user.email, user.password);
    // 404 means the test already deleted the account (or never created it).
    if (body.responseCode !== 200 && body.responseCode !== 404) {
      console.warn(`Cleanup of ${user.email} returned ${body.responseCode}: ${body.message}`);
    }
  } catch (error) {
    console.warn(`Cleanup of ${user.email} failed: ${String(error)}`);
  }
}

export const test = base.extend<PageObjects & DataFixtures>({
  context: async ({ context }, use) => {
    await blockThirdPartyNoise(context);
    await use(context);
  },

  page: async ({ page }, use, testInfo) => {
    await use(page);
    // Label failures caused by the public site's overload page so triage can
    // tell environment problems apart from product regressions.
    if (testInfo.status !== testInfo.expectedStatus) {
      const overloaded = await page
        .getByText('This website is under heavy load')
        .isVisible()
        .catch(() => false);
      if (overloaded) {
        testInfo.annotations.push({
          type: 'site-overloaded',
          description: 'The target answered "under heavy load (queue full)"; likely environmental.',
        });
      }
    }
  },

  api: async ({ request }, use) => {
    await use(new AutomationExerciseApi(request));
  },

  newUser: async ({ api }, use) => {
    const user = buildUser();
    await use(user);
    await deleteAccountQuietly(api, user);
  },

  registeredUser: async ({ api }, use) => {
    const user = buildUser();
    const { body } = await api.createAccount(user);
    if (body.responseCode !== 201) {
      throw new Error(`Could not create test user ${user.email}: ${body.message}`);
    }
    await use(user);
    await deleteAccountQuietly(api, user);
  },

  loggedInUser: async ({ registeredUser, loginSignupPage }, use) => {
    await loginSignupPage.open();
    await loginSignupPage.login(registeredUser.email, registeredUser.password);
    await expect(loginSignupPage.header.loggedInAs).toContainText(registeredUser.name);
    await use(registeredUser);
  },

  loginSignupPage: async ({ page }, use) => use(new LoginSignupPage(page)),
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  productDetailPage: async ({ page }, use) => use(new ProductDetailPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  paymentPage: async ({ page }, use) => use(new PaymentPage(page)),
  contactPage: async ({ page }, use) => use(new ContactPage(page)),
});

export { expect };
