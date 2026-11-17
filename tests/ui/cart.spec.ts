import { test, expect } from '@fixtures/test';

const PRODUCTS = ['Blue Top', 'Men Tshirt'];

test.describe('Cart', () => {
  test(
    'CART-01: products added from the listing show the API price and quantity 1',
    {
      tag: '@smoke',
    },
    async ({ api, productsPage, cartPage }) => {
      const { body } = await api.getProducts();

      await productsPage.open();
      for (const name of PRODUCTS) await productsPage.addToCart(name);
      await productsPage.header.cartLink.click();

      await expect(cartPage.productNames).toHaveText(PRODUCTS);
      for (const line of await cartPage.lines()) {
        const apiProduct = body.products.find((product) => product.name === line.name);
        expect(`Rs. ${line.unitPrice}`, `${line.name} price`).toBe(apiProduct?.price);
        expect(line.quantity, `${line.name} quantity`).toBe(1);
        expect(line.total, `${line.name} line total`).toBe(line.unitPrice);
      }
    },
  );

  test('CART-02: quantity chosen on the product page is kept in the cart', async ({
    productDetailPage,
    cartPage,
  }) => {
    await productDetailPage.openProduct(1);
    const name = await productDetailPage.name.innerText();

    await productDetailPage.addToCart(4);
    await productDetailPage.header.cartLink.click();

    await expect(cartPage.rows).toHaveCount(1);
    await expect(cartPage.quantityOf(name)).toHaveText('4');
  });

  test('CART-03: adding the same product twice increases its quantity', async ({
    productsPage,
    cartPage,
  }) => {
    await productsPage.open();
    await productsPage.addToCart('Blue Top');
    await productsPage.addToCart('Blue Top');
    await productsPage.header.cartLink.click();

    await expect(cartPage.rows).toHaveCount(1);
    await expect(cartPage.quantityOf('Blue Top')).toHaveText('2');
  });

  test('CART-04: removing every product leaves an empty cart', async ({
    productsPage,
    cartPage,
  }) => {
    await productsPage.open();
    for (const name of PRODUCTS) await productsPage.addToCart(name);
    await cartPage.open();

    for (const name of PRODUCTS) await cartPage.removeProduct(name);

    await expect(cartPage.rows).toHaveCount(0);
    await expect(cartPage.emptyCartMessage).toContainText('Cart is empty!');
  });

  test('CART-05: cart contents survive logging out and back in', async ({
    loggedInUser,
    productsPage,
    loginSignupPage,
    cartPage,
  }) => {
    await productsPage.open();
    for (const name of PRODUCTS) await productsPage.addToCart(name);

    await productsPage.header.logout();
    await loginSignupPage.login(loggedInUser.email, loggedInUser.password);
    await expect(loginSignupPage.header.loggedInAs).toContainText(loggedInUser.name);
    await loginSignupPage.header.cartLink.click();

    await expect(cartPage.rows).toHaveCount(PRODUCTS.length);
    for (const name of PRODUCTS) await expect(cartPage.row(name)).toBeVisible();
  });
});
