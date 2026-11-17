# Playwright E2E Automation – AutomationExercise

![Playwright](https://img.shields.io/badge/Playwright-TypeScript-2EAD33?logo=playwright)
![Browsers](https://img.shields.io/badge/Browsers-Chromium%20%7C%20Firefox%20%7C%20WebKit-orange)
![Layers](https://img.shields.io/badge/Coverage-UI%20%2B%20API%20%2B%20E2E-blue)
![Pattern](https://img.shields.io/badge/Architecture-POM%20%2B%20Fixtures-purple)

UI, API and end-to-end regression suite for the
[AutomationExercise](https://automationexercise.com) practice store, built with
**Playwright + TypeScript**.

**What it shows:**

- **Self-contained test data.** Each test that needs an account gets a fresh user created through
  the API and deleted afterwards. There are no hard-coded or shared accounts, so tests run in
  parallel and in any order.
- **Cross-layer checks.** UI search results, filters, listings and product details are compared
  with the API response for the same query.
- **API contract testing.** Every response is validated with [Zod](https://zod.dev) schemas,
  including negative cases (400 / 404 / 405).
- **No sleeps or forced clicks.** Every check is a web-first assertion. Lint bans
  `waitForTimeout` and `force: true`.
- **Ad-proof runs.** Ad, consent and analytics hosts are blocked at the network layer before they
  can cover the page.
- **Full purchase journey.** The E2E test goes from browsing categories through cart, checkout,
  payment and invoice download. It checks the invoice text against the cart total.

---

## Quick start

Requirements: Node.js 22 or newer (24 recommended, see `.nvmrc`).

```bash
npm ci
npx playwright install            # Chromium, Firefox and WebKit
npm test                          # every project: api + 3 browsers
```

| Command                 | What it runs                                          |
| ----------------------- | ----------------------------------------------------- |
| `npm test`              | API tests + UI/E2E tests in Chromium, Firefox, WebKit |
| `npm run test:smoke`    | `@smoke` release gate (API + Chromium)                |
| `npm run test:api`      | API tests only (no browser needed)                    |
| `npm run test:chromium` | UI + E2E in Chromium (`test:firefox`, `test:webkit`)  |
| `npm run test:headed`   | Chromium with a visible browser                       |
| `npm run test:ui`       | Playwright UI mode                                    |
| `npm run report`        | Open the last HTML report                             |
| `npm run report:allure` | Build and open the Allure report                      |
| `npm run check`         | Typecheck + ESLint + Prettier                         |

Run one file or one test case:

```bash
npx playwright test tests/ui/cart.spec.ts --project=chromium
npx playwright test -g "E2E-01" --project=chromium --headed
```

Point the suite at another deployment of the store:

```bash
BASE_URL=https://staging.example.test npm test
```

---

## Project structure

```
.
├── src/
│   ├── api/
│   │   ├── automation-exercise.client.ts   # typed API client
│   │   └── schemas.ts                      # Zod response contracts
│   ├── config/env.ts                       # BASE_URL / CI switches
│   ├── data/
│   │   ├── catalog.json                    # data-driven search/brand/category/purchase input
│   │   └── user.factory.ts                 # unique Faker users, address lines, test card
│   ├── fixtures/
│   │   ├── network-noise.ts                # ad / consent / analytics blocking
│   │   └── test.ts                         # custom test: page objects + user fixtures
│   └── pages/
│       ├── components/                     # header, footer, cart modal
│       ├── base.page.ts                    # shared navigation + helpers
│       └── *.page.ts                       # one class per page
├── tests/
│   ├── api/                                # products & account API specs
│   ├── ui/                                 # auth, products, cart, checkout, contact
│   ├── e2e/purchase-flow.spec.ts           # complete customer journey
│   └── assets/                             # upload fixtures
├── docs/
│   ├── test-plan.md
│   └── test-cases.md                       # every test ID with its expected result
├── .github/workflows/playwright.yml
└── playwright.config.ts
```

### Fixtures

Specs import `test` and `expect` from `@fixtures/test` and ask for only what they need:

| Fixture          | Provides                                                       |
| ---------------- | -------------------------------------------------------------- |
| `api`            | Typed client for `/api/*`                                      |
| `newUser`        | Unique, not-yet-registered user (cleaned up if it got created) |
| `registeredUser` | User created via the API before the test, deleted after it     |
| `loggedInUser`   | `registeredUser`, already logged in through the UI             |
| `*Page`          | Page objects bound to the test's `page`                        |

```ts
test('CHK-02: delivery and billing addresses match the account details', async ({
  loggedInUser,
  productsPage,
  cartPage,
  checkoutPage,
}) => {
  await productsPage.open();
  await productsPage.addToCart('Blue Top');
  await cartPage.open();
  await cartPage.proceedToCheckout();

  for (const line of addressLines(loggedInUser)) {
    await expect(checkoutPage.deliveryAddress).toContainText(line);
  }
});
```

---

## Coverage

The suite has 36 test-case IDs. Data-driven variants expand them to 47 tests: 14 API tests plus
33 UI/E2E tests per browser, or 113 runs for a full `npm test`. Each ID is listed with its
expected result in [docs/test-cases.md](docs/test-cases.md).

| Area           | Spec                              | Highlights                                                        |
| -------------- | --------------------------------- | ----------------------------------------------------------------- |
| API            | `tests/api/*.api.spec.ts`         | Catalogue, brands, search, full account lifecycle, 400/404/405    |
| Authentication | `tests/ui/auth.spec.ts`           | UI registration + deletion, login/logout, invalid credentials     |
| Catalogue      | `tests/ui/products.spec.ts`       | UI vs API for listing, search, brand and category filters         |
| Cart           | `tests/ui/cart.spec.ts`           | Prices, quantities, duplicates, removal, persistence across login |
| Checkout       | `tests/ui/checkout.spec.ts`       | Guest gate, address check, payment validation                     |
| Contact        | `tests/ui/contact.spec.ts`        | Form with file upload, invalid email, newsletter                  |
| E2E            | `tests/e2e/purchase-flow.spec.ts` | Categories → cart → checkout → payment → invoice → logout         |

## Reports

- **HTML report:** `playwright-report/` (`npm run report`). Failures keep their trace,
  screenshot and video.
- **Allure:** results are written to `allure-results/`. `npm run report:allure` builds and opens
  the report with Allure 3, which does not need Java.
- **Overload label:** when the public site returns its _"under heavy load (queue full)"_ page,
  the failed test gets a `site-overloaded` annotation, which separates environment noise from
  real regressions.

## CI

The GitHub Actions workflow in `.github/workflows/playwright.yml` runs on every push and pull
request to `main`, and can also be started manually:

1. **Static checks:** typecheck, ESLint and Prettier.
2. **API tests.**
3. **UI tests:** Chromium, Firefox and WebKit, one browser at a time to stay polite to the shared
   site.

Each job uploads its HTML report and Allure results as artifacts.

## Notes

- The target is a public practice site. The suite keeps the load low with 2 workers and one CI
  browser at a time. Local runs retry once and CI runs retry twice, and a test that only passes
  on retry is reported as **flaky**.
- Generated emails use the reserved `example.com` domain, so no real mailbox is ever contacted.
