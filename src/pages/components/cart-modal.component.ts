import type { Locator, Page } from '@playwright/test';

/** "Added!" confirmation dialog shown after adding a product to the cart. */
export class CartModal {
  readonly root: Locator;
  readonly continueShoppingButton: Locator;
  readonly viewCartLink: Locator;

  constructor(page: Page) {
    this.root = page.locator('#cartModal');
    this.continueShoppingButton = this.root.getByRole('button', { name: 'Continue Shopping' });
    this.viewCartLink = this.root.getByRole('link', { name: 'View Cart' });
  }

  /** Waits for the confirmation, then dismisses it so the page is usable again. */
  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
    await this.root.waitFor({ state: 'hidden' });
  }
}
