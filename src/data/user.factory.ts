import { faker } from '@faker-js/faker';

/** Countries offered by the sign-up form's country dropdown. */
export const SIGNUP_COUNTRIES = [
  'India',
  'United States',
  'Canada',
  'Australia',
  'Israel',
  'New Zealand',
  'Singapore',
] as const;

export interface User {
  name: string;
  email: string;
  password: string;
  title: 'Mr' | 'Mrs';
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: (typeof SIGNUP_COUNTRIES)[number];
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
  newsletter: boolean;
  specialOffers: boolean;
}

/** Plain-letter names keep UI text assertions free of apostrophes and accents. */
function lettersOnly(value: string): string {
  return value.replace(/[^A-Za-z]/g, '') || 'Tester';
}

/**
 * Builds a unique, throw-away user. Emails use the reserved `example.com`
 * domain so no real mailbox is ever targeted.
 */
export function buildUser(overrides: Partial<User> = {}): User {
  const firstName = lettersOnly(faker.person.firstName());
  const lastName = lettersOnly(faker.person.lastName());
  const unique = `${Date.now()}${faker.string.alphanumeric({ length: 6, casing: 'lower' })}`;
  const birthDate = faker.date.birthdate({ mode: 'age', min: 18, max: 70 });

  return {
    name: `${firstName} ${lastName}`,
    email: `pw.${unique}@example.com`,
    password: `Pw!${faker.string.alphanumeric(10)}`,
    title: faker.helpers.arrayElement(['Mr', 'Mrs'] as const),
    birthDay: String(birthDate.getDate()),
    birthMonth: birthDate.toLocaleString('en-US', { month: 'long' }),
    birthYear: String(birthDate.getFullYear()),
    firstName,
    lastName,
    company: `${lettersOnly(faker.company.buzzNoun())} QA Labs`,
    address1: `${faker.number.int({ min: 1, max: 999 })} ${lettersOnly(faker.location.street())} Street`,
    address2: `Suite ${faker.number.int({ min: 1, max: 99 })}`,
    country: faker.helpers.arrayElement(SIGNUP_COUNTRIES),
    state: lettersOnly(faker.location.state()),
    city: lettersOnly(faker.location.city()),
    zipcode: faker.string.numeric(6),
    mobileNumber: faker.string.numeric({ length: 10, allowLeadingZeros: false }),
    newsletter: faker.datatype.boolean(),
    specialOffers: faker.datatype.boolean(),
    ...overrides,
  };
}

/** Delivery address lines exactly as the checkout page renders them. */
export function addressLines(user: User): string[] {
  return [
    `${user.title}. ${user.firstName} ${user.lastName}`,
    user.company,
    user.address1,
    user.address2,
    `${user.city} ${user.state} ${user.zipcode}`,
    user.country,
    user.mobileNumber,
  ];
}

export interface PaymentCard {
  nameOnCard: string;
  number: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
}

/** Dummy card accepted by the practice store's fake payment gateway. */
export const TEST_CARD: PaymentCard = {
  nameOnCard: 'Playwright Tester',
  number: '4111111111111111',
  cvc: '123',
  expiryMonth: '12',
  expiryYear: String(new Date().getFullYear() + 3),
};
