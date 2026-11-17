import type { Locator, Page } from '@playwright/test';

/** Top navigation bar rendered on every page. */
export class Header {
  readonly nav: Locator;
  readonly homeLink: Locator;
  readonly productsLink: Locator;
  readonly cartLink: Locator;
  readonly signupLoginLink: Locator;
  readonly contactUsLink: Locator;
  readonly logoutLink: Locator;
  readonly deleteAccountLink: Locator;
  readonly loggedInAs: Locator;

  constructor(page: Page) {
    this.nav = page.locator('#header .navbar-nav');
    this.homeLink = this.nav.getByRole('link', { name: 'Home' });
    this.productsLink = this.nav.getByRole('link', { name: 'Products' });
    this.cartLink = this.nav.getByRole('link', { name: 'Cart' });
    this.signupLoginLink = this.nav.getByRole('link', { name: 'Signup / Login' });
    this.contactUsLink = this.nav.getByRole('link', { name: 'Contact us' });
    this.logoutLink = this.nav.getByRole('link', { name: 'Logout' });
    this.deleteAccountLink = this.nav.getByRole('link', { name: 'Delete Account' });
    this.loggedInAs = this.nav.getByText(/Logged in as/);
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }

  async deleteAccount(): Promise<void> {
    await this.deleteAccountLink.click();
  }
}
