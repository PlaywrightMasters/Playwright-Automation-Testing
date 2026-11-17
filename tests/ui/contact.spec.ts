import path from 'node:path';
import { test, expect } from '@fixtures/test';
import { fieldValidity } from '@pages/base.page';

const ATTACHMENT = path.resolve(__dirname, '../assets/contact-attachment.txt');

test.describe('Contact us & newsletter', () => {
  test(
    'CONT-01: contact form with an attachment is submitted',
    { tag: '@smoke' },
    async ({ contactPage }) => {
      await contactPage.open();
      await contactPage.fillForm({
        name: 'Playwright Tester',
        email: 'pw.contact@example.com',
        subject: 'Automated contact form check',
        message: 'This message was sent by the Playwright regression suite.',
        attachmentPath: ATTACHMENT,
      });

      await contactPage.submit();

      await expect(contactPage.successMessage).toHaveText(
        'Success! Your details have been submitted successfully.',
      );
    },
  );

  test('CONT-02: contact form rejects an invalid email address', async ({ contactPage }) => {
    await contactPage.open();
    await contactPage.fillForm({
      name: 'Playwright Tester',
      email: 'not-an-email',
      subject: 'Invalid email check',
      message: 'This submission must be blocked.',
    });

    await contactPage.submitButton.click();

    expect(await fieldValidity(contactPage.emailInput)).toMatchObject({ typeMismatch: true });
    await expect(contactPage.successMessage).toBeHidden();
  });

  test('CONT-03: footer newsletter subscription succeeds', async ({ productsPage }) => {
    await productsPage.open();

    await productsPage.footer.subscribe('pw.newsletter@example.com');

    await expect(productsPage.footer.subscriptionSuccess).toHaveText(
      'You have been successfully subscribed!',
    );
  });
});
