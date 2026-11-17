import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { CartModal } from './components/cart-modal.component';

/** /products – listing, search, brand and category filters. */
export class ProductsPage extends BasePage {
  protected readonly path = '/products';

  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productCards: Locator;
  readonly productNames: Locator;
  readonly cartModal: CartModal;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('.features_items h2.title');
    this.searchInput = page.getByPlaceholder('Search Product');
    this.searchButton = page.locator('#submit_search');
    this.productCards = page.locator('.features_items .product-image-wrapper');
    this.productNames = this.productCards.locator('.productinfo p');
    this.cartModal = new CartModal(page);
  }

  productCard(name: string): Locator {
    return this.productCards.filter({
      has: this.page.locator('.productinfo p').getByText(name, { exact: true }),
    });
  }

  brandLink(brand: string): Locator {
    // Link text is rendered as "(6)Polo": the count badge precedes the name.
    return this.page
      .locator('.brands-name a')
      .filter({ hasText: new RegExp(`\\)\\s*${escapeRegExp(brand)}\\s*$`) });
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  /** Reads the product count shown next to a brand in the sidebar. */
  async brandProductCount(brand: string): Promise<number> {
    const badge = await this.brandLink(brand).locator('span').innerText();
    return Number(badge.replace(/\D/g, ''));
  }

  async filterByBrand(brand: string): Promise<void> {
    await this.brandLink(brand).click();
  }

  async filterByCategory(category: string, subcategory: string): Promise<void> {
    await this.page.locator(`#accordian a[href="#${category}"]`).click();
    await this.page
      .locator(`#${category}`)
      .getByRole('link', { name: subcategory, exact: true })
      .click();
  }

  /**
   * Adds a product from the listing. The hover overlay slides over the card,
   * so the overlay's own button is used to avoid racing its animation.
   */
  async addToCart(name: string): Promise<void> {
    const card = this.productCard(name);
    await card.locator('.single-products').hover();
    await card.locator('.product-overlay .add-to-cart').click();
    await this.cartModal.continueShopping();
  }

  async openProductDetails(name: string): Promise<void> {
    await this.productCard(name).getByRole('link', { name: 'View Product' }).click();
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
