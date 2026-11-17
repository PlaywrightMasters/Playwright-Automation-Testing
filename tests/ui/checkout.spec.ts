import { test, expect } from '@fixtures/test';
import { addressLines } from '@data/user.factory';
import { fieldValidity } from '@pages/base.page';

const PRODUCT = 'Blue Top';

test.describe('Checkout', () => {
  test('CHK-01: guest is asked to register or log in before checkout', async ({
    productsPage,
    cartPage,
  }) => {
    await productsPage.open();
    await productsPage.addToCart(PRODUCT);
    await cartPage.open();

    await cartPage.proceedToCheckout();

    await expect(cartPage.checkoutLoginModal).toBeVisible();
    await expect(cartPage.checkoutLoginModal).toContainText(
      'Register / Login account to proceed on checkout.',
    );
  });

  test(
    'CHK-02: delivery and billing addresses match the account details',
    {
      tag: '@smoke',
    },
    async ({ loggedInUser, productsPage, cartPage, checkoutPage }) => {
      await productsPage.open();
      await productsPage.addToCart(PRODUCT);
      await cartPage.open();

      await cartPage.proceedToCheckout();

      for (const line of addressLines(loggedInUser)) {
        await expect(checkoutPage.deliveryAddress).toContainText(line);
        await expect(checkoutPage.billingAddress).toContainText(line);
      }
      await expect(checkoutPage.orderProductNames).toHaveText([PRODUCT]);
    },
  );

  test('CHK-03: payment cannot be submitted with empty card details', async ({
    loggedInUser,
    page,
    productsPage,
    cartPage,
    checkoutPage,
    paymentPage,
  }) => {
    await productsPage.open();
    await productsPage.addToCart(PRODUCT);
    await cartPage.open();
    await cartPage.proceedToCheckout();
    await checkoutPage.placeOrder(`Order for ${loggedInUser.name}`);
    await expect(page).toHaveURL(/\/payment$/);

    await paymentPage.payButton.click();

    expect(await fieldValidity(paymentPage.nameOnCard)).toMatchObject({ valueMissing: true });
    await expect(page).toHaveURL(/\/payment$/);
    await expect(paymentPage.orderPlacedHeading).toBeHidden();
  });
});
