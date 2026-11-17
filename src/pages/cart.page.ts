import type { Locator, Page } from '@playwright/test';
import { BasePage, parsePrice } from './base.page';

export interface CartLine {
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

/** /view_cart – cart contents and the entry point to checkout. */
export class CartPage extends BasePage {
  protected readonly path = '/view_cart';

  readonly rows: Locator;
  readonly productNames: Locator;
  readonly emptyCartMessage: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly checkoutLoginModal: Locator;

  constructor(page: Page) {
    super(page);
    this.rows = page.locator('#cart_info_table tbody tr');
    this.productNames = this.rows.locator('.cart_description h4 a');
    this.emptyCartMessage = page.locator('#empty_cart');
    // Rendered as an <a> without href, so it has no link role.
    this.proceedToCheckoutButton = page.getByText('Proceed To Checkout');
    this.checkoutLoginModal = page.locator('#checkoutModal');
  }

  row(productName: string): Locator {
    return this.rows.filter({
      has: this.page.getByRole('link', { name: productName, exact: true }),
    });
  }

  quantityOf(productName: string): Locator {
    return this.row(productName).locator('.cart_quantity button');
  }

  async removeProduct(productName: string): Promise<void> {
    const row = this.row(productName);
    await row.locator('.cart_quantity_delete').click();
    await row.waitFor({ state: 'detached' });
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutButton.click();
  }

  /** Reads every cart row into numbers that tests can reason about. */
  async lines(): Promise<CartLine[]> {
    const lines: CartLine[] = [];
    for (const row of await this.rows.all()) {
      lines.push({
        name: await row.locator('.cart_description h4 a').innerText(),
        unitPrice: parsePrice(await row.locator('.cart_price').innerText()),
        quantity: Number(await row.locator('.cart_quantity button').innerText()),
        total: parsePrice(await row.locator('.cart_total_price').innerText()),
      });
    }
    return lines;
  }
}
