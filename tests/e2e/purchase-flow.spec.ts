import { readFile } from 'node:fs/promises';
import { test, expect } from '@fixtures/test';
import catalog from '@data/catalog.json';
import { addressLines, TEST_CARD } from '@data/user.factory';

test(
  'E2E-01: customer buys from several categories, pays and downloads the invoice',
  {
    tag: ['@smoke', '@e2e'],
  },
  async ({ loggedInUser, page, productsPage, cartPage, checkoutPage, paymentPage }) => {
    // A dozen page loads: ~45 s in WebKit on its own and well over a minute
    // when the shared site is busy, so the default 60 s budget is too tight.
    test.slow();
    const orderedProducts = catalog.purchase.flatMap((group) => group.products);
    let expectedTotal = 0;

    await test.step('add products from each category', async () => {
      for (const { category, subcategory, products } of catalog.purchase) {
        await productsPage.open();
        await productsPage.filterByCategory(category, subcategory);
        await expect(productsPage.heading).toHaveText(`${category} - ${subcategory} Products`);
        for (const name of products) await productsPage.addToCart(name);
      }
    });

    await test.step('cart lists every product with consistent totals', async () => {
      await productsPage.header.cartLink.click();
      await expect(cartPage.productNames).toHaveText(orderedProducts);

      const lines = await cartPage.lines();
      for (const line of lines) {
        expect(line.total, `${line.name} line total`).toBe(line.unitPrice * line.quantity);
      }
      expectedTotal = lines.reduce((sum, line) => sum + line.total, 0);
    });

    await test.step('checkout shows the account address and order total', async () => {
      await cartPage.proceedToCheckout();

      for (const line of addressLines(loggedInUser)) {
        await expect(checkoutPage.deliveryAddress).toContainText(line);
      }
      await expect(checkoutPage.orderProductNames).toHaveText(orderedProducts);
      await expect(checkoutPage.totalAmount).toHaveText(`Rs. ${expectedTotal}`);

      await checkoutPage.placeOrder(`Automated order for ${loggedInUser.name}`);
    });

    await test.step('payment confirms the order', async () => {
      await paymentPage.pay(TEST_CARD);

      await expect(page).toHaveURL(/\/payment_done\//);
      await expect(paymentPage.orderPlacedHeading).toBeVisible();
      await expect(paymentPage.orderPlacedHeading).toHaveText('Order Placed!');
      await expect(paymentPage.confirmationMessage).toBeVisible();
    });

    await test.step('invoice names the customer and the order total', async () => {
      const download = await paymentPage.downloadInvoice();
      const invoice = await readFile(await download.path(), 'utf8');

      expect(invoice).toContain(`${loggedInUser.firstName} ${loggedInUser.lastName}`);
      expect(invoice).toContain(String(expectedTotal));
    });

    await test.step('customer logs out', async () => {
      await paymentPage.continueButton.click();
      await paymentPage.header.logout();

      await expect(page).toHaveURL(/\/login$/);
    });
  },
);
