import type { Locator, Page } from '@playwright/test';

/** Footer newsletter subscription widget. */
export class Footer {
  readonly subscriptionEmail: Locator;
  readonly subscribeButton: Locator;
  readonly subscriptionSuccess: Locator;

  constructor(page: Page) {
    this.subscriptionEmail = page.locator('#susbscribe_email');
    this.subscribeButton = page.locator('#subscribe');
    this.subscriptionSuccess = page.locator('#success-subscribe');
  }

  async subscribe(email: string): Promise<void> {
    await this.subscriptionEmail.fill(email);
    await this.subscribeButton.click();
  }
}
