import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/** /checkout – address review, order review and order comment. */
export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout';

  readonly deliveryAddress: Locator;
  readonly billingAddress: Locator;
  readonly orderProductNames: Locator;
  readonly totalAmount: Locator;
  readonly commentInput: Locator;
  readonly placeOrderLink: Locator;

  constructor(page: Page) {
    super(page);
    this.deliveryAddress = page.locator('#address_delivery');
    this.billingAddress = page.locator('#address_invoice');
    this.orderProductNames = page.locator('#cart_info .cart_description h4 a');
    this.totalAmount = page
      .locator('#cart_info tr', { hasText: 'Total Amount' })
      .locator('.cart_total_price');
    this.commentInput = page.locator('textarea[name="message"]');
    this.placeOrderLink = page.getByRole('link', { name: 'Place Order' });
  }

  async placeOrder(comment: string): Promise<void> {
    await this.commentInput.fill(comment);
    await this.placeOrderLink.click();
  }
}
