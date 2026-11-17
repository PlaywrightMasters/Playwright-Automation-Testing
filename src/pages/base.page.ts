import type { Locator, Page } from '@playwright/test';
import { Footer } from './components/footer.component';
import { Header } from './components/header.component';

/** Shared behaviour for every routable page of the store. */
export abstract class BasePage {
  readonly header: Header;
  readonly footer: Footer;

  protected abstract readonly path: string;

  constructor(readonly page: Page) {
    this.header = new Header(page);
    this.footer = new Footer(page);
  }

  async open(): Promise<void> {
    // Third-party scripts are blocked, but DOMContentLoaded is still the
    // earliest point at which the store's own markup is usable.
    await this.page.goto(this.path, { waitUntil: 'domcontentloaded' });
  }
}

export interface FieldValidity {
  valid: boolean;
  valueMissing: boolean;
  typeMismatch: boolean;
}

/**
 * Reads the native constraint-validation state of a form field. Asserting on
 * the state rather than `validationMessage` keeps tests browser- and
 * locale-independent.
 */
export function fieldValidity(field: Locator): Promise<FieldValidity> {
  return field.evaluate((element: HTMLInputElement | HTMLTextAreaElement) => ({
    valid: element.validity.valid,
    valueMissing: element.validity.valueMissing,
    typeMismatch: element.validity.typeMismatch,
  }));
}

/** Parses a store price such as "Rs. 1500" into a number. */
export function parsePrice(text: string): number {
  const match = /Rs\.\s*(\d+)/.exec(text);
  if (!match?.[1]) throw new Error(`Unable to parse price from "${text}"`);
  return Number(match[1]);
}
