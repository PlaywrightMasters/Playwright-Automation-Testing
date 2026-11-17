import type { Download, Locator, Page } from '@playwright/test';
import type { PaymentCard } from '@data/user.factory';
import { BasePage } from './base.page';

/** /payment – card form and the order confirmation that follows it. */
export class PaymentPage extends BasePage {
  protected readonly path = '/payment';

  readonly nameOnCard: Locator;
  readonly cardNumber: Locator;
  readonly cvc: Locator;
  readonly expiryMonth: Locator;
  readonly expiryYear: Locator;
  readonly payButton: Locator;
  readonly orderPlacedHeading: Locator;
  readonly confirmationMessage: Locator;
  readonly downloadInvoiceLink: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameOnCard = page.getByTestId('name-on-card');
    this.cardNumber = page.getByTestId('card-number');
    this.cvc = page.getByTestId('cvc');
    this.expiryMonth = page.getByTestId('expiry-month');
    this.expiryYear = page.getByTestId('expiry-year');
    this.payButton = page.getByTestId('pay-button');
    this.orderPlacedHeading = page.getByTestId('order-placed');
    this.confirmationMessage = page.getByText('Congratulations! Your order has been confirmed!');
    this.downloadInvoiceLink = page.getByRole('link', { name: 'Download Invoice' });
    this.continueButton = page.getByTestId('continue-button');
  }

  async pay(card: PaymentCard): Promise<void> {
    await this.nameOnCard.fill(card.nameOnCard);
    await this.cardNumber.fill(card.number);
    await this.cvc.fill(card.cvc);
    await this.expiryMonth.fill(card.expiryMonth);
    await this.expiryYear.fill(card.expiryYear);
    await this.payButton.click();
  }

  async downloadInvoice(): Promise<Download> {
    const download = this.page.waitForEvent('download');
    await this.downloadInvoiceLink.click();
    return download;
  }
}
