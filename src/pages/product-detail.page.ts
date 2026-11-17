import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { CartModal } from './components/cart-modal.component';

/** /product_details/:id – product information, quantity and reviews. */
export class ProductDetailPage extends BasePage {
  /** `open()` shows the first product; use `openProduct(id)` for any other. */
  protected readonly path = '/product_details/1';

  readonly name: Locator;
  readonly category: Locator;
  readonly price: Locator;
  readonly availability: Locator;
  readonly condition: Locator;
  readonly brand: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly cartModal: CartModal;

  readonly reviewName: Locator;
  readonly reviewEmail: Locator;
  readonly reviewText: Locator;
  readonly reviewSubmit: Locator;
  readonly reviewSuccess: Locator;

  constructor(page: Page) {
    super(page);
    const info = page.locator('.product-information');
    this.name = info.locator('h2');
    this.category = info.locator('p', { hasText: 'Category:' });
    this.price = info.locator('span > span').first();
    this.availability = info.locator('p', { hasText: 'Availability:' });
    this.condition = info.locator('p', { hasText: 'Condition:' });
    this.brand = info.locator('p', { hasText: 'Brand:' });
    this.quantityInput = page.locator('#quantity');
    this.addToCartButton = info.getByRole('button', { name: 'Add to cart' });
    this.cartModal = new CartModal(page);

    this.reviewName = page.locator('#review-form #name');
    this.reviewEmail = page.locator('#review-form #email');
    this.reviewText = page.locator('#review-form #review');
    this.reviewSubmit = page.locator('#button-review');
    this.reviewSuccess = page.getByText('Thank you for your review.');
  }

  async openProduct(id: number): Promise<void> {
    await this.page.goto(`/product_details/${id}`, { waitUntil: 'domcontentloaded' });
  }

  async addToCart(quantity = 1): Promise<void> {
    await this.quantityInput.fill(String(quantity));
    await this.addToCartButton.click();
    await this.cartModal.continueShopping();
  }

  async writeReview(review: { name: string; email: string; text: string }): Promise<void> {
    await this.reviewName.fill(review.name);
    await this.reviewEmail.fill(review.email);
    await this.reviewText.fill(review.text);
    await this.reviewSubmit.click();
  }
}
