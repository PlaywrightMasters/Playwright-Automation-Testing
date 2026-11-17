# Test Cases

Each ID appears at the start of the matching Playwright test title, so a report entry can be
traced back to this table (and vice versa) with a simple search.

## API – `tests/api`

| ID     | Title                                                                   | Expected result                                                       | Tag      |
| ------ | ----------------------------------------------------------------------- | --------------------------------------------------------------------- | -------- |
| API-01 | GET `productsList` returns a valid, non-empty catalogue                 | `responseCode` 200, schema valid, unique product ids                  | `@smoke` |
| API-02 | POST `productsList` is rejected                                         | 405 "This request method is not supported."                           |          |
| API-03 | GET `brandsList` covers every brand used by products                    | Every product brand is listed                                         |          |
| API-04 | PUT `brandsList` is rejected                                            | 405                                                                   |          |
| API-05 | `searchProduct` returns only matching products (per term)               | Every result's name or category contains the term                     |          |
| API-06 | `searchProduct` without a term                                          | 400 "…search_product parameter is missing…"                           |          |
| API-07 | Account lifecycle: create → duplicate → verify → read → update → delete | 201, 400, 200, matching details, 200 + persisted change, 200 then 404 | `@smoke` |
| API-08 | `verifyLogin` with unknown credentials                                  | 404 "User not found!"                                                 |          |
| API-09 | `verifyLogin` without an email                                          | 400 "…email or password parameter is missing…"                        |          |
| API-10 | DELETE `verifyLogin` is rejected                                        | 405                                                                   |          |
| API-11 | `getUserDetailByEmail` for an unknown email                             | 404 "Account not found with this email…"                              |          |

## Authentication – `tests/ui/auth.spec.ts`

| ID      | Title                                            | Expected result                                               | Tag      |
| ------- | ------------------------------------------------ | ------------------------------------------------------------- | -------- |
| AUTH-01 | Register through the UI, then delete the account | "Account Created!", logged in as the user, "Account Deleted!" | `@smoke` |
| AUTH-02 | Log in and log out                               | "Logged in as <name>", then back on `/login` and logged out   | `@smoke` |
| AUTH-03 | Wrong password                                   | "Your email or password is incorrect!"                        |          |
| AUTH-04 | Unregistered email                               | "Your email or password is incorrect!"                        |          |
| AUTH-05 | Sign up with an already registered email         | "Email Address already exist!"                                |          |
| AUTH-06 | Sign up with empty fields                        | Native validation (`valueMissing`) blocks submission          |          |

## Product catalogue – `tests/ui/products.spec.ts`

| ID      | Title                                    | Expected result                                               | Tag      |
| ------- | ---------------------------------------- | ------------------------------------------------------------- | -------- |
| PROD-01 | All products page                        | "All Products" lists exactly the API catalogue                | `@smoke` |
| PROD-02 | Search (data-driven terms)               | "Searched Products" lists exactly the API search result       |          |
| PROD-03 | Search for an unknown product            | No product cards                                              |          |
| PROD-04 | Brand filter (data-driven brands)        | Exactly the brand's API products; sidebar badge count matches |          |
| PROD-05 | Category filter (data-driven categories) | Exactly the category's API products                           |          |
| PROD-06 | Product detail page                      | Name, category, price, brand, availability, condition match   |          |
| PROD-07 | Write a review                           | "Thank you for your review."                                  |          |

## Cart – `tests/ui/cart.spec.ts`

| ID      | Title                               | Expected result                              | Tag      |
| ------- | ----------------------------------- | -------------------------------------------- | -------- |
| CART-01 | Add products from the listing       | Rows in order, API price, quantity 1, totals | `@smoke` |
| CART-02 | Quantity chosen on the product page | Cart shows quantity 4                        |          |
| CART-03 | Add the same product twice          | One row with quantity 2                      |          |
| CART-04 | Remove every product                | "Cart is empty!"                             |          |
| CART-05 | Cart survives logout and login      | Same products after logging back in          |          |

## Checkout – `tests/ui/checkout.spec.ts`

| ID     | Title                          | Expected result                                          | Tag      |
| ------ | ------------------------------ | -------------------------------------------------------- | -------- |
| CHK-01 | Guest proceeds to checkout     | "Register / Login account to proceed on checkout." modal |          |
| CHK-02 | Delivery and billing addresses | Both contain every address line of the account           | `@smoke` |
| CHK-03 | Pay with empty card details    | Native validation blocks payment; no order placed        |          |

## Contact & newsletter – `tests/ui/contact.spec.ts`

| ID      | Title                           | Expected result                                           | Tag      |
| ------- | ------------------------------- | --------------------------------------------------------- | -------- |
| CONT-01 | Contact form with attachment    | "Success! Your details have been submitted successfully." | `@smoke` |
| CONT-02 | Contact form with invalid email | Native validation (`typeMismatch`); no success message    |          |
| CONT-03 | Footer newsletter subscription  | "You have been successfully subscribed!"                  |          |

## End-to-end – `tests/e2e/purchase-flow.spec.ts`

| ID     | Title                                                       | Expected result                                                               | Tag             |
| ------ | ----------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------- |
| E2E-01 | Buy from several categories, pay, download invoice, log out | Cart and checkout totals agree, "Order Placed!", invoice names user and total | `@smoke` `@e2e` |
