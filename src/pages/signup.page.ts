import type { Locator, Page } from '@playwright/test';
import type { User } from '@data/user.factory';
import { BasePage } from './base.page';

/** /signup – "Enter Account Information" form plus the account status screens. */
export class SignupPage extends BasePage {
  protected readonly path = '/signup';

  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly createAccountButton: Locator;
  readonly accountCreatedHeading: Locator;
  readonly accountDeletedHeading: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByText('Enter Account Information');
    this.nameInput = page.getByTestId('name');
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.createAccountButton = page.getByTestId('create-account');
    this.accountCreatedHeading = page.getByTestId('account-created');
    this.accountDeletedHeading = page.getByTestId('account-deleted');
    this.continueButton = page.getByTestId('continue-button');
  }

  async fillAccountInformation(user: User): Promise<void> {
    await this.page.locator(user.title === 'Mr' ? '#id_gender1' : '#id_gender2').check();
    await this.passwordInput.fill(user.password);
    await this.page.getByTestId('days').selectOption(user.birthDay);
    await this.page.getByTestId('months').selectOption({ label: user.birthMonth });
    await this.page.getByTestId('years').selectOption(user.birthYear);
    await this.page.locator('#newsletter').setChecked(user.newsletter);
    await this.page.locator('#optin').setChecked(user.specialOffers);

    await this.page.getByTestId('first_name').fill(user.firstName);
    await this.page.getByTestId('last_name').fill(user.lastName);
    await this.page.getByTestId('company').fill(user.company);
    await this.page.getByTestId('address').fill(user.address1);
    await this.page.getByTestId('address2').fill(user.address2);
    await this.page.getByTestId('country').selectOption(user.country);
    await this.page.getByTestId('state').fill(user.state);
    await this.page.getByTestId('city').fill(user.city);
    await this.page.getByTestId('zipcode').fill(user.zipcode);
    await this.page.getByTestId('mobile_number').fill(user.mobileNumber);
  }

  async createAccount(user: User): Promise<void> {
    await this.fillAccountInformation(user);
    await this.createAccountButton.click();
  }
}
