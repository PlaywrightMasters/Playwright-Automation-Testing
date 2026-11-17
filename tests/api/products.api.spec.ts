import { test, expect } from '@fixtures/test';
import catalog from '@data/catalog.json';

test.describe('Products & brands API', () => {
  test(
    'API-01: GET productsList returns a valid, non-empty catalogue',
    { tag: '@smoke' },
    async ({ api }) => {
      const { httpStatus, body } = await api.getProducts();

      expect(httpStatus).toBe(200);
      expect(body.products.length).toBeGreaterThan(0);
      const ids = body.products.map((product) => product.id);
      expect(new Set(ids).size, 'product ids must be unique').toBe(ids.length);
    },
  );

  test('API-02: POST productsList is rejected as an unsupported method', async ({ api }) => {
    const { body } = await api.postProducts();

    expect(body).toEqual({ responseCode: 405, message: 'This request method is not supported.' });
  });

  test('API-03: GET brandsList returns every brand used by the catalogue', async ({ api }) => {
    const [{ body: brands }, { body: products }] = await Promise.all([
      api.getBrands(),
      api.getProducts(),
    ]);

    const brandNames = new Set(brands.brands.map((entry) => entry.brand));
    const usedBrands = new Set(products.products.map((product) => product.brand));
    for (const brand of usedBrands) {
      expect(brandNames, `brand "${brand}" should be listed`).toContain(brand);
    }
  });

  test('API-04: PUT brandsList is rejected as an unsupported method', async ({ api }) => {
    const { body } = await api.putBrands();

    expect(body).toEqual({ responseCode: 405, message: 'This request method is not supported.' });
  });

  for (const term of catalog.searchTerms) {
    test(`API-05: searchProduct "${term}" only returns matching products`, async ({ api }) => {
      const { body } = await api.searchProduct(term);

      expect(body.products.length).toBeGreaterThan(0);
      for (const product of body.products) {
        const searchable = `${product.name} ${product.category.category}`.toLowerCase();
        expect(searchable, `${product.name} should match "${term}"`).toContain(term);
      }
    });
  }

  test('API-06: searchProduct without a term is a bad request', async ({ api }) => {
    const { body } = await api.searchProductWithoutTerm();

    expect(body).toEqual({
      responseCode: 400,
      message: 'Bad request, search_product parameter is missing in POST request.',
    });
  });
});
