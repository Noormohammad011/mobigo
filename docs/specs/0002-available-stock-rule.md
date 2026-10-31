# 0002. Available stock rule

**Date**: 2026-10-31
**Status**: In Progress

## Summary

Shoppers, the cart, and checkout need one shared answer for how many units of a phone can still be bought. That answer is the units on the shelf minus the units already held for open orders. This spec adds two server functions that compute it, and a pure rule the seed and the tests share. It does not change the database, and it does not place or cancel orders. Checkout and admin orders keep those writes, and they must use this number.

## Context

> ⚠️ Premise note: A live read is not a lock. Two shoppers can both see one unit left in the same moment. The only guard against selling that unit twice is the conditional stock update already described in SCHEMA decision 6, and you placed that write, and its race test, on the checkout spec. This spec will not catch an oversell if checkout reads the number and then updates stock in a separate, unconditional step.

Listing, the product page, the cart, and checkout can each invent a different meaning of in stock. The columns already exist on `ProductVariant`: `stock` and `reservedStock`. A database check keeps reserved stock at or above zero and at or below stock. `Product.inStock` is a stored yes or no that cached pages, including home, already read. The seed sets it from "any variant has stock above zero", which ignores product status and inactive variants.

Preorder phones in the seed have stock 0. The same check forbids reserved stock above real stock, so a preorder cannot use the normal reservation path. The product card already shows a Preorder badge from product status, separate from sold out.

`QuantityStepper` forces its maximum to at least 1, even when the number you pass is 0. A sold out phone can still offer a quantity.

Cash on delivery holds units from the moment an order is placed until it is delivered. Those held units live in `reservedStock`. This read trusts that column. It does not add up order lines. If the column and the orders ever drift, the read follows the column, because the reservation update and the check both use the column.

Not deciding means every later slice copies a slightly different formula, and a cached badge, a stepper, and checkout can disagree.

## Requirements

**User stories**:
- As a shopper, I want the badge, the quantity limit, and checkout to agree, so that I am not offered a phone the store cannot sell.
- As a shopper ordering a preorder phone, I want to place the order even though nothing is on the shelf yet, so that a launch phone is not shown as sold out.
- As a developer, I want one server function for that number, so that listing, the product page, the cart, and checkout cannot drift apart.

**Acceptance criteria**:
- **AC-1**: `getVariantAvailability` and `getProductAvailability` live in a server only module. Each takes a list of ids and an optional database client. One call reads every id in a single query and returns one result per input id, in the same order, including duplicates. An empty list returns an empty list. There is no public URL.
- **AC-2**: For an active variant of an ACTIVE product, available equals `stock` minus `reservedStock` when that result is at least 1, the reason is `ok`, and `maxQuantity` is the smaller of 5 and available. The 5 is the same upper bound as the cart check that limits a line to quantities 1 through 5.
- **AC-3**: When `stock` minus `reservedStock` is below 1 for an otherwise sellable variant, the reason is `out_of_stock`, available is 0, and `maxQuantity` is 0. The functions never return a negative available.
- **AC-4**: A PREORDER product returns reason `preorder`, available 0, and `maxQuantity` 5 on every variant, including when stock is above 0 and when a variant is inactive. The product result is `preorder` and not in stock.
- **AC-5**: Variant reason order is: missing row, then product status (`preorder`, then `draft`, then `discontinued`), then an inactive variant, then the number. Every reason except `ok` and `preorder` returns available 0 and `maxQuantity` 0. One unknown id in a list does not drop the other ids. There is no check on id shape. A blank id, or any id with no row, is `missing`. A product row with no variants is `out_of_stock` and not in stock. `missing` is only for an id with no product or variant row.
- **AC-6**: A product is in stock only when its status is ACTIVE and at least one active variant has `stock` minus `reservedStock` of at least 1. `getProductAvailability` returns that answer. `Product.inStock` means the same thing. These functions do not write the column. The seed sets the column with this rule.
- **AC-7**: The functions are not cached. A caller that passes a transaction client reads inside that transaction. A cached page may keep using `Product.inStock` for its badge. This build does not add cart or checkout. Those later specs call these functions on the live read.
- **AC-8**: A database failure throws. It is never reported as `out_of_stock`.
- **AC-9**: Shopper facing copy does not say how many units are left. `QuantityStepper` takes `maxQuantity` as its maximum and does not force that maximum up to 1. When `maxQuantity` is 0, the stepper does not offer a quantity.
- **AC-10**: The same inputs return the same result for a guest and for a signed in shopper. A client component cannot import the module.
- **AC-11**: `quantityAllowed(reason, maxQuantity, quantity)` is true only when `quantity` is a whole number from 1 through `maxQuantity` and `reason` is `ok` or `preorder`. Zero, negatives, fractions, and numbers above `maxQuantity` are false. Cart and checkout use this function rather than writing their own comparison.

## Options considered

### Option 1: Compute on read, two server functions, writes stay in later specs

A pure rule plus two server functions. Available is `stock` minus `reservedStock`, computed when asked, never stored. Variant and product reads each take many ids in one query. Checkout and admin orders keep the writes, and they call this rule.

**Pros**:
- One formula for every reader, with no new column to keep in sync.
- The database check and the reservation update already speak in `stock` and `reservedStock`.

**Cons**:
- A cached badge can be stale until the write specs maintain `Product.inStock`.
- The read cannot stop two shoppers who both pass the check a moment apart. Checkout still has to reserve with a conditional update.

### Option 2: Store available stock in its own column

Add `availableStock` and update it on every stock change.

**Pros**:
- Readers do no subtraction.
- A listing can filter on one column.

**Cons**:
- A third number can drift from `stock` and `reservedStock`, which the check and the reservation update already keep consistent.
- Every writer must remember the extra column. There is no measured read cost that needs it.

### Option 3: Add up open order lines on every read

Ignore `reservedStock` and sum quantities on orders that still hold stock.

**Pros**:
- The number cannot drift from the orders, because it is the orders.

**Cons**:
- It can disagree with the column the conditional update and the check use, so the read and the write would guard different numbers.
- A listing of many phones becomes a heavier query for a catalog that already stores the counter.

## Decision

**Chosen option**: Option 1: Compute on read, two server functions, writes stay in later specs.

Available stock is `stock` minus `reservedStock`, computed by `getVariantAvailability` and `getProductAvailability`. Nothing is added to the database.

**Implementation skills**: `prisma-client-api` (`.claude/skills/prisma-client-api/`, the transaction client argument) · `vercel-react-best-practices` (`.claude/skills/vercel-react-best-practices/`, server only module, no `use cache` on this read) · `postgres` (`~/.claude/skills/postgres/`, database tests against the real schema, as in spec 0001)

Staff inventory screens read `stock` and `reservedStock` themselves. They do not call these functions. Staff need the two numbers, and this rule hides the split on purpose. The runner up was one function for shoppers and staff, which would hide how many units are held.

The pure rule lives in `src/lib/stock-rule.ts` with no server imports, so unit tests and the seed can use it without Postgres. The queries live in `src/lib/stock.ts`. The runner up was one module and mocked database calls in unit tests, which throws away the unit project spec 0001 already splits out.

## Rationale

The columns and the check are already there, and the reservation update in SCHEMA decision 6 compares `stock` minus `reservedStock` in the database. A read that sums orders (option 3) would guard a different number than the write. A stored available column (option 2) adds a value we do not have a measured reason to cache, and the expert rule for this stack is to compute a derived number at read time until a measurement says otherwise. `Product.inStock` stays, because home already caches it, but its meaning is now this rule and this spec does not write it on read. Repairing it inside the read would hide a writer bug and do a write on a page view.

You asked for the oversell test to live with checkout. That matches the write living there. This spec proves the arithmetic, the reasons, and the cap. It does not pretend a read is a reservation.

## Feature design

**Data model sketch**:

No new table and no new column. No migration.

| Entity | Fields this rule uses | Notes |
|---|---|---|
| `Product` | `id` primary key, `status` required (`DRAFT`, `ACTIVE`, `PREORDER`, `DISCONTINUED`), `inStock` required boolean | One product has many variants. `inStock` is true only when `status` is ACTIVE and at least one active variant has available stock of at least 1. Writers in later specs set it in the same transaction as a stock change. This spec does not. |
| `ProductVariant` | `id` primary key, `productId` required foreign key, `stock` required int, `reservedStock` required int, `isActive` required boolean | Available is not stored. It is `stock` minus `reservedStock`. Check `variant_stock_ok` already enforces `stock >= 0`, `reservedStock >= 0`, and `reservedStock <= stock`. |

The read trusts `reservedStock`. It does not sum `OrderItem` rows. Orders stay owned by checkout.

**API surface**:

| Function | Inputs | Outputs | Who may call | Errors |
|---|---|---|---|---|
| `getVariantAvailability` | `variantIds: string[]` (required), `client` (optional, defaults to `db` from `src/lib/db.ts`; may be the client inside `db.$transaction`) | One row per input id, same order: `variantId`, `available`, `reason`, `maxQuantity` | Any server code. Not a client component. Not a URL. | Database failure throws. An unknown id is a `missing` row, not an error. |
| `getProductAvailability` | `productIds: string[]` (required), `client` (optional, same default) | One row per input id, same order: `productId`, `inStock`, `reason` | Same | Same |

Variant `reason` is `ok`, `preorder`, `out_of_stock`, `inactive`, `draft`, `discontinued`, or `missing`. Product `reason` is `ok`, `preorder`, `out_of_stock`, `draft`, `discontinued`, or `missing`.

`maxQuantity` is `min(5, available)` when the reason is `ok`, `5` when the reason is `preorder`, and `0` otherwise. The named constant is `LINE_QUANTITY_CAP` in `src/lib/stock-rule.ts`.

`quantityAllowed` lives in the same pure module. It does not touch the database.

**Value sourcing**:

| Action | Value | Source |
|---|---|---|
| Variant read | `available` when reason is `ok` | `ProductVariant.stock` minus `ProductVariant.reservedStock` |
| Variant read | `available` when reason is not `ok` | Always 0, including preorder with stock above 0 |
| Variant read | `reason` | Row missing, else `Product.status`, else `ProductVariant.isActive`, else the subtraction. Order fixed in AC-5 |
| Variant read | `maxQuantity` | Derived from `reason`, `available`, and `LINE_QUANTITY_CAP` (5, the upper bound of `cart_qty_range`) |
| Product read | `inStock` and product `reason` | `Product.status` and each active variant's `stock` minus `reservedStock`. True and `ok` only for ACTIVE with at least one active variant at 1 or more |
| Cached home badge | in stock or preorder | Existing `Product.inStock` and `Product.status`, not a live call. Meaning of `inStock` is AC-6. Seed writes it |
| Stepper | maximum | `maxQuantity` from the variant read. No "units left" copy |
| Cap of 5 | the constant | `LINE_QUANTITY_CAP`, matched to the cart check `quantity BETWEEN 1 AND 5` in the migration. A unit test reads that constraint and fails if the constant and the SQL disagree |
| Quantity check | allowed or not | `quantityAllowed`: whole number from 1 through `maxQuantity`, and reason `ok` or `preorder` |

**Key invariants**:
- These functions do not write `stock`, `reservedStock`, or `inStock`.
- Available returned to a caller is never negative.
- Reason `ok` is the only reason with available of at least 1.
- `quantityAllowed` is the only quantity check. A later spec does not reimplement it.
- A preorder is orderable (`maxQuantity` 5) and is not in stock.
- Reasons other than `ok` and `preorder` are not orderable.
- Result order matches the input id list.

Contract for later specs, not built here:
- Only reason `ok` may increase `reservedStock`, and only by a quantity from 1 to `maxQuantity`, using the conditional update in SCHEMA decision 6.
- A preorder order does not change `stock` or `reservedStock`.
- Any stock change sets `Product.inStock` in the same transaction to the AC-6 meaning.
- The test that two shoppers cannot take the last unit belongs to checkout.

**Security model**:
Catalog truth, not personal data. Guests and signed in shoppers get the same result because both use the server. The module starts with `import "server-only"`, so a client bundle cannot call it. There is no route, so there is nothing extra to rate limit. The stepper may stop below 5, which lets a shopper infer the count in that case. The page must not print the count. Staff who edit inventory read the two columns in the admin catalog spec, not this function.

**Critical test scenarios**:
- Happy path: an ACTIVE variant with stock 10 and reserved 3 returns available 7, reason `ok`, `maxQuantity` 5, and a list of two ids uses one query and keeps order, verifies **AC-1**, **AC-2**, **AC-7**
- Cap under 5: stock 2 and reserved 0 returns `maxQuantity` 2, verifies **AC-2**
- Sold out: stock 4 and reserved 4 returns `out_of_stock`, available 0, `maxQuantity` 0, verifies **AC-3**
- Preorder: status PREORDER with stock 6, and another with an inactive variant, both return `preorder`, available 0, `maxQuantity` 5, and the product is not in stock, verifies **AC-4**, **AC-6**
- Precedence: a missing id, a DRAFT product, a DISCONTINUED product, and an inactive variant of an ACTIVE product return `missing`, `draft`, `discontinued`, and `inactive`, and a mixed list still returns the known ids, verifies **AC-5**
- Product badge: one active variant in stock and one at zero marks the product in stock; all active variants at zero marks it `out_of_stock`; seed sets `inStock` the same way, verifies **AC-6**
- Transaction: a call with the transaction client sees a row written in that transaction and not yet committed, verifies **AC-7**
- Failure: a client whose query throws rejects the call, and the reason is not `out_of_stock`, verifies **AC-8**
- Stepper: maximum 0 does not offer a quantity, maximum 2 stops at 2, and no copy states the count, verifies **AC-9**
- Boundary: the module imports `server-only`, and a unit test of the pure rule needs no session, verifies **AC-10**
- Quantity: `quantityAllowed` accepts 1 through `maxQuantity` for `ok` and `preorder`, and rejects 0, fractions, and a number past the cap, verifies **AC-11**
- Empty product: a product row with no variants is `out_of_stock`. A blank id is `missing`, verifies **AC-5**

## Build plan

Tracer Bullet: the pure rule first, then one real database read, then the stepper that shoppers touch. No migration.

1. Add `src/lib/stock-rule.ts` with `LINE_QUANTITY_CAP`, the variant classifier, the product classifier, and `quantityAllowed`. Unit tests cover the reasons, a product with no variants, a blank id, the cap math, and a read of the `cart_qty_range` check so the constant stays 5. No database. Satisfies **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-11**.
2. Add `src/lib/stock.ts` (`import "server-only"`) with `getVariantAvailability` and `getProductAvailability`: one `findMany` for the ids, map back in input order, default client `db`, errors not caught. Database tests on the spec 0001 harness, including the product in stock rule, a call inside `db.$transaction`, and a thrown query. Satisfies **AC-1**, **AC-5**, **AC-6**, **AC-7**, **AC-8**, **AC-10**.
3. Change `QuantityStepper` so the maximum is the number it is given, including 0, and add a component test that 0 offers nothing and 2 stops at 2. Satisfies **AC-9**.
4. Point the seed's `inStock` assignment at the product classifier (ACTIVE, and at least one active variant with stock minus reserved stock of at least 1). Satisfies **AC-6**.

## Consequences

**Positive**:
- Listing, the product page, the cart, and checkout can share one number and one cap.
- Preorder stays orderable without breaking the stock check.
- The seed and the cached flag use the same meaning as the live read.

**Negative / tradeoffs**:
- Home and other cached badges can be wrong until checkout and admin orders update `Product.inStock` on every stock change.
- A shopper can infer the count when fewer than 5 are left, because the stepper stops there.
- This spec does not prove that two shoppers cannot buy the last unit. That proof waits on checkout.
- Staff do not get held units from this function. Admin catalog has to read the columns.

**Neutral**:
- No new environment variable, no new package, no migration.
- Database tests need the harness from spec 0001.

## Follow-up

- [ ] Checkout spec: call `quantityAllowed` and the live variant read inside the order transaction. Reserve only when the reason is `ok`, with the conditional update, and do not change stock for a preorder. Include the test that two buyers cannot take the last unit.
- [ ] Admin orders spec: status changes that release or restore stock also set `Product.inStock` to the AC-6 meaning in the same transaction.
- [ ] Admin catalog spec: editing stock sets `Product.inStock` the same way, and the screen shows `stock` and `reservedStock`, not this function.
- [ ] Cart spec: call `quantityAllowed` on the live read. Decide what "low stock" means. This function only returns the number.
- [ ] Build spec 0001 before the database tests in task 2. The pure unit tests in task 1 can land first.
- [x] The scope sentence for this feature still says the race test lives here. Point that sentence at checkout when the scope row is updated.
