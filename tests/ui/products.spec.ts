import { test, expect } from '@fixtures/test';
import catalog from '@data/catalog.json';

test.describe('Product catalogue', () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.open();
  });

  test(
    'PROD-01: all products page lists the complete API catalogue',
    { tag: '@smoke' },
    async ({ api, productsPage }) => {
      const { body } = await api.getProducts();

      await expect(productsPage.heading).toHaveText('All Products');
      await expect(productsPage.productNames).toHaveText(body.products.map((p) => p.name));
    },
  );

  for (const term of catalog.searchTerms) {
    test(`PROD-02: UI search for "${term}" matches the API search`, async ({
      api,
      productsPage,
    }) => {
      const { body } = await api.searchProduct(term);

      await productsPage.search(term);

      await expect(productsPage.heading).toHaveText('Searched Products');
      await expect(productsPage.productNames).toHaveText(body.products.map((p) => p.name));
    });
  }

  test('PROD-03: searching for an unknown product shows no results', async ({ productsPage }) => {
    await productsPage.search(catalog.invalidSearchTerm);

    await expect(productsPage.heading).toHaveText('Searched Products');
    await expect(productsPage.productCards).toHaveCount(0);
  });

  for (const brand of catalog.brands) {
    test(`PROD-04: brand filter "${brand}" shows exactly that brand's products`, async ({
      api,
      productsPage,
    }) => {
      const { body } = await api.getProducts();
      const expected = body.products.filter((p) => p.brand === brand).map((p) => p.name);
      const sidebarCount = await productsPage.brandProductCount(brand);

      await productsPage.filterByBrand(brand);

      await expect(productsPage.heading).toHaveText(`Brand - ${brand} Products`);
      await expect(productsPage.productNames).toHaveText(expected);
      expect(sidebarCount, 'sidebar badge should match the product count').toBe(expected.length);
    });
  }

  for (const { category, subcategory } of catalog.categories) {
    test(`PROD-05: category filter "${category} > ${subcategory}" matches the API`, async ({
      api,
      productsPage,
    }) => {
      const { body } = await api.getProducts();
      const expected = body.products
        .filter(
          (p) => p.category.usertype.usertype === category && p.category.category === subcategory,
        )
        .map((p) => p.name);

      await productsPage.filterByCategory(category, subcategory);

      await expect(productsPage.heading).toHaveText(`${category} - ${subcategory} Products`);
      await expect(productsPage.productNames).toHaveText(expected);
    });
  }

  test('PROD-06: product detail page shows the product data from the API', async ({
    api,
    page,
    productsPage,
    productDetailPage,
  }) => {
    const { body } = await api.getProducts();
    expect(body.products.length, 'the API catalogue must not be empty').toBeGreaterThan(0);
    const product = body.products[0]!;

    await productsPage.openProductDetails(product.name);

    await expect(page).toHaveURL(new RegExp(`/product_details/${product.id}$`));
    await expect(productDetailPage.name).toHaveText(product.name);
    await expect(productDetailPage.category).toHaveText(
      `Category: ${product.category.usertype.usertype} > ${product.category.category}`,
    );
    await expect(productDetailPage.price).toHaveText(product.price);
    await expect(productDetailPage.brand).toHaveText(`Brand: ${product.brand}`);
    await expect(productDetailPage.availability).toHaveText('Availability: In Stock');
    await expect(productDetailPage.condition).toHaveText('Condition: New');
  });

  test('PROD-07: customer can write a product review', async ({ productDetailPage }) => {
    await productDetailPage.openProduct(1);

    await productDetailPage.writeReview({
      name: 'Playwright Reviewer',
      email: 'pw.reviewer@example.com',
      text: 'Automated review written by the Playwright suite.',
    });

    await expect(productDetailPage.reviewSuccess).toBeVisible();
  });
});
