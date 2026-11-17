import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  attachmentPath?: string;
}

/** /contact_us – "Get In Touch" form. */
export class ContactPage extends BasePage {
  protected readonly path = '/contact_us';

  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly subjectInput: Locator;
  readonly messageInput: Locator;
  readonly attachmentInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.getByTestId('name');
    this.emailInput = page.getByTestId('email');
    this.subjectInput = page.getByTestId('subject');
    this.messageInput = page.getByTestId('message');
    this.attachmentInput = page.locator('input[name="upload_file"]');
    this.submitButton = page.getByTestId('submit-button');
    this.successMessage = page.locator('#contact-page .status.alert-success');
  }

  async fillForm(contact: ContactMessage): Promise<void> {
    await this.nameInput.fill(contact.name);
    await this.emailInput.fill(contact.email);
    await this.subjectInput.fill(contact.subject);
    await this.messageInput.fill(contact.message);
    if (contact.attachmentPath) await this.attachmentInput.setInputFiles(contact.attachmentPath);
  }

  /** Submits and accepts the store's "Press OK to proceed!" confirm dialog. */
  async submit(): Promise<void> {
    this.page.once('dialog', (dialog) => void dialog.accept());
    await this.submitButton.click();
  }
}
