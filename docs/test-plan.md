# Test Plan – AutomationExercise Store

## 1. Objective

Provide fast, trustworthy regression feedback for the core shopping journeys of the
[AutomationExercise](https://automationexercise.com) practice store, at both the UI and the
public API layer, across Chromium, Firefox and WebKit.

## 2. Scope

| In scope                                                                  | Out of scope                                  |
| ------------------------------------------------------------------------- | --------------------------------------------- |
| Registration, login, logout, account deletion                             | Visual regression / pixel comparison          |
| Product listing, search, brand and category filters, product details      | Accessibility audits                          |
| Cart: add, quantity, remove, persistence across sessions                  | Performance and load testing                  |
| Checkout: guest gate, address review, payment validation, order + invoice | Real payment processing (the gateway is fake) |
| Contact form (with attachment) and newsletter subscription                | Mobile viewports                              |
| Public REST API (`/api/*`) contracts and negative cases                   | Email delivery                                |

## 3. Approach

- **Page Object Model.** Page classes in `src/pages` own selectors and user actions; specs own
  the assertions, so a failing test reads like the business rule it protects.
- **Isolated test data.** Every test that needs an account gets a brand-new user created through
  the API (`registeredUser` fixture) and deleted afterwards. No shared or pre-registered accounts,
  so tests run fully in parallel and in any order.
- **Cross-layer oracles.** UI listings, search results, filters and product details are compared
  with the API response for the same query instead of hard-coded expectations.
- **Contract validation.** Every API response is parsed with a Zod schema; a contract change
  fails with a precise message.
- **Stability.** Ad, consent and analytics hosts are blocked at the network layer; only
  web-first assertions are used; `waitForTimeout` and `force: true` are banned by lint.
- **Browser-independent validation checks.** Native form validation is asserted through the
  `validity` state, not the localised browser message.

## 4. Environments

| Item     | Value                                                      |
| -------- | ---------------------------------------------------------- |
| Target   | `https://automationexercise.com` (override: `BASE_URL`)    |
| Browsers | Chromium, Firefox, WebKit (Playwright-managed builds)      |
| Runtime  | Node.js 24 (see `.nvmrc`), Playwright, TypeScript          |
| CI       | GitHub Actions – static checks, API job, UI browser matrix |

## 5. Test levels and tags

| Level | Location    | Tag      | Purpose                                     |
| ----- | ----------- | -------- | ------------------------------------------- |
| API   | `tests/api` | –        | Contract and negative-path coverage         |
| UI    | `tests/ui`  | –        | Feature-level behaviour                     |
| E2E   | `tests/e2e` | `@e2e`   | Complete customer purchase journey          |
| Smoke | any         | `@smoke` | Minimal release gate (`npm run test:smoke`) |

## 6. Entry and exit criteria

**Entry:** the target site responds; `npm run check` passes.

**Exit:** all API and UI tests pass on every browser in CI. Tests that pass only on retry are
reported as _flaky_ and must be triaged, not ignored.

## 7. Risks and mitigations

| Risk                                               | Mitigation                                                                 |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| Shared public site throttles bursts ("queue full") | 2 workers, one CI browser at a time, retries, `site-overloaded` annotation |
| Third-party ads/vignettes cover the page           | Ad and consent hosts aborted in a context-level route                      |
| Catalogue data changes                             | Expectations derived from the API at run time                              |
| Leftover test accounts                             | Fixture teardown deletes every account it created                          |
| Product overlay animation intercepts clicks        | Hover first, then click the overlay's own button                           |
| Long E2E journey exceeds 60 s in WebKit under load | `test.slow()` (180 s budget) and a `/payment_done/` URL check              |

## 8. Deliverables

- Automated suite (this repository) and [test case catalogue](test-cases.md)
- Playwright HTML report, traces, screenshots and videos of failures
- Allure results for trend reporting
