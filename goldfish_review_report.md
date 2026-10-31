# Goldfish Annotated Review Report

**Target:** `docs/scope/scope.md` (lines 1–232), `docs/specs/0001-test-setup.md` (lines 1–247), `docs/specs/0002-available-stock-rule.md` (lines 1–204)

Reviewers: design critic, structural. Standard: feature spec standard. Extra reading: `AGENTS.md`, `docs/PRD.md`, `docs/SCHEMA.md`, `docs/DESIGN_SYSTEM.md`.

## Prioritized Findings & AI Suggestions

### Race tests can deadlock the rollback tests [`design critic`] - Severity: Blocker
*   **Affected Scope:** [Lines 26, 100, 107–109, 209](docs/specs/0001-test-setup.md#L26-L209) (Test setup, `db` and `db-race`)
*   **Discrepancy Description:** `pnpm test` runs `db` and `db-race` together on `mobigo_test`. Rollback tests hold a transaction open. Race tests `TRUNCATE`. `fileParallelism: false` applies only inside `db-race`.
*   **Rationale:** A truncate needs a lock the open transaction still holds, and the open transaction waits on the truncate. AC-2 (tests do not see each other's rows) fails under the command AC-1 requires.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** One shared database is still right. The projects must not overlap in time. A second database would also work, and it costs another migrate on every run.
*   ***Proposed Edit:***
    *   Location: Commands table, `test` script, and the `db-race` environment cell
    *   Change: `test` runs `vitest run --project unit --project component --project db && vitest run --project db-race`. State that `db-race` still uses `mobigo_test`, and that it starts only after every rollback transaction has closed.

### Inactive preorder variants stay orderable [`design critic`] - Severity: Major
*   **Affected Scope:** [Lines 34–35, 161](docs/specs/0002-available-stock-rule.md#L34-L161) (AC-4, AC-5)
*   **Discrepancy Description:** Product status is checked before `isActive`, so an inactive variant of a preorder phone stays `preorder` with `maxQuantity` 5.
*   **Rationale:** Staff cannot pull one colour or storage option off a launch phone.
*   ***AI Suggestion:*** CONTEST
*   ***Justification:*** You chose this order on purpose: missing row, then product status, then inactive, so a preorder phone stays preorder even when one variant is inactive. Reversing it would undo that answer. A later admin catalog spec can still refuse to save an inactive variant on a preorder phone if you want that control.

### Preorder lines have no shared ceiling [`design critic`] - Severity: Major
*   **Affected Scope:** [Lines 16–17, 34, 143, 148–150](docs/specs/0002-available-stock-rule.md#L16-L150) (preorder contract)
*   **Discrepancy Description:** Preorder orders do not change stock, and `quantityAllowed` is true up to 5 per line. Nothing caps how many such orders can pile up. A reader who treats `quantityAllowed` as the only gate may also try to reserve, match 0 rows, and roll the order back.
*   **Rationale:** The stock check forbids `reservedStock` above `stock`. Reservation at zero stock cannot succeed.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** The missing global ceiling is a business rule you did not ask for. I am not adding one. The misread is real: "only quantity check" can be heard as "if this is true, reserve." The checkout follow-up already says to reserve only for reason `ok`.
*   ***Proposed Edit:***
    *   Location: Key invariants, the sentence that `quantityAllowed` is the only quantity check
    *   Change: Add: "`quantityAllowed` answers only whether the quantity is legal for that reason. It does not reserve stock. Reason `preorder` skips the reservation update. Reason `ok` is the only reason that may increase `reservedStock`."

### Held stock through shipped is easy to misread [`design critic`] - Severity: Major
*   **Affected Scope:** [Lines 20–21, 199–200](docs/specs/0002-available-stock-rule.md#L20-L200) (writer contract)
*   **Discrepancy Description:** The spec says units stay held until delivery. The column comment on `reservedStock` says the hold is for pending and confirmed orders only. Follow-ups never name shipped.
*   **Rationale:** SCHEMA decision 6 decrements `reservedStock` on delivered and on cancelled, which means the hold survives shipped. A writer that releases at shipped puts the phone back on sale while it is on the truck. This read will then sell it.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** The read trusts the column. The writers need one map, the one decision 6 already implies.
*   ***Proposed Edit:***
    *   Location: Contract for later specs
    *   Change: Add: "Hold `reservedStock` through pending, confirmed, and shipped. Delivered decrements `stock` and `reservedStock`. Cancelled decrements `reservedStock` only. Returned increments `stock`. The column comment that names only pending and confirmed is stale."

### Updating the flag does not refresh a prerendered badge [`design critic`] - Severity: Major
*   **Affected Scope:** [Lines 134, 151, 187–188](docs/specs/0002-available-stock-rule.md#L134-L188) (cached badges)
*   **Discrepancy Description:** Cached pages may keep reading `Product.inStock`. The writer contract updates that column and says nothing about the `"use cache"` page spec 0001 says is prerendered.
*   **Rationale:** Writing the column leaves the already rendered home badge in place.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** You accepted that a cached badge may be stale. This spec should not grow a cache system. The consequence currently implies that fixing the column fixes the badge. That is the part to correct. Admin catalog already says storefront caches refresh after a save.
*   ***Proposed Edit:***
    *   Location: Consequences, the cached badge bullet, and Follow-up
    *   Change: Replace the claim with: "A cached or prerendered badge can stay wrong after `Product.inStock` changes, until the page cache is invalidated." Add a follow-up: "Checkout and admin stock writes invalidate the home cache in the same path that sets `Product.inStock`."

### Two sessions share one test database [`design critic`] - Severity: Major
*   **Affected Scope:** [Lines 14, 100, 130–131](docs/specs/0001-test-setup.md#L14-L131) (isolation)
*   **Discrepancy Description:** Isolation covers `.next` and the dev port. `mobigo_test` and `mobigo_e2e` are single shared databases, and `pnpm test:e2e` runs `migrate reset --force`.
*   **Rationale:** A second run truncates or drops the database the other session has open. The threat named in the spec is two sessions in this folder.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** A database per session is heavier than this harness needs. Refusing to start when someone else is connected matches the fail-fast rule already in AC-10.
*   ***Proposed Edit:***
    *   Location: Key invariants and the e2e script task
    *   Change: Before migrate, truncate, or reset, if `pg_stat_activity` shows another client on that database, stop and name that session. Do not reset or truncate under them.

### End to end reset can wipe the Vitest database [`design critic`] - Severity: Major
*   **Affected Scope:** [Lines 28, 131, 144](docs/specs/0001-test-setup.md#L28-L144) (AC-3 guard)
*   **Discrepancy Description:** The guard allows any local name ending in `_test` or `_e2e`. The e2e script then runs `prisma migrate reset --force` on `E2E_DATABASE_URL`.
*   **Rationale:** An override that points the e2e URL at `mobigo_test` passes the guard and wipes the Vitest database.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** The shared local-host check stays. The suffix has to match the command.
*   ***Proposed Edit:***
    *   Location: AC-3 and the e2e script description
    *   Change: Vitest accepts only a name ending in `_test`. The e2e script accepts only a name ending in `_e2e`. A mismatch stops before reset.

### A custom e2e port breaks sign in [`design critic`] - Severity: Major
*   **Affected Scope:** [Lines 31, 136, 161](docs/specs/0001-test-setup.md#L31-L161) (`E2E_PORT`)
*   **Discrepancy Description:** `E2E_PORT` is overridable. `supabase/config.toml` pins the site URL and redirect URLs to port 3130.
*   **Rationale:** Sign in uses the real login form. Another port sends the browser to the wrong origin, so the account test fails whenever the override is used.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** Keeping the override is useful. The config has to follow it.
*   ***Proposed Edit:***
    *   Location: `scripts/e2e.ts` task and the configuration list
    *   Change: Before Supabase starts, write `site_url` and `additional_redirect_urls` from `E2E_PORT`. If the file still names a different port, stop.

### Parallel database files can exhaust connections [`design critic`] - Severity: Major
*   **Affected Scope:** [Lines 107, 196–199](docs/specs/0001-test-setup.md#L107-L199) (rollback proxy)
*   **Discrepancy Description:** Each `db` file opens its own client and holds a transaction. Files run in parallel. No worker cap and no `connection_limit` are written down.
*   **Rationale:** Later features all use this harness. Enough parallel files will fail on connection slots instead of on the assertion.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** A ceiling belongs in the spec so the next feature does not discover it by accident. 4 workers is a starting cap, not a tuned number.
*   ***Proposed Edit:***
    *   Location: `db` project description
    *   Change: The test URL sets `connection_limit=1`. The `db` project sets `maxWorkers: 4` and `isolate: true`. Database tests do not use `it.concurrent`.

### Checkout done when still reserves every line [`design critic`] - Severity: Major
*   **Affected Scope:** [Lines 141–143](docs/scope/scope.md#L141-L143) (COD checkout)
*   **Discrepancy Description:** Checkout says a valid order reserves stock. Spec 0002 says a preorder line is orderable and must not change stock.
*   **Rationale:** A checkout built from the scope row will try to reserve a launch phone, match 0 rows, and roll the order back.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** The branch is already decided in spec 0002. The scope row should not contradict it.
*   ***Proposed Edit:***
    *   Location: COD checkout, the done when line
    *   Change: After "reserves stock", add: "A preorder line is saved and does not change `stock` or `reservedStock`. Only an in stock line is reserved."

### The seen price has no column [`design critic`] - Severity: Major
*   **Affected Scope:** [Lines 137–138](docs/scope/scope.md#L137-L138) (Cart)
*   **Discrepancy Description:** The cart row says each line stores the price the shopper saw, and that a line can say low stock. `CartItem` has `variantId` and `quantity` only. Spec 0002 leaves low stock to the cart spec.
*   **Rationale:** After sign in, the seen price has nowhere to live, so "price changed" cannot be computed. Low stock is also still undefined.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** The missing price column is real (`CartItem` has no price). Low stock stays with the cart spec, which you already chose. I am not moving that threshold into spec 0002.
*   ***Proposed Edit:***
    *   Location: Cart, the opening sentence
    *   Change: Add: "The cart spec adds a price column on `CartItem`. Today the table stores only the variant and the quantity, so the seen price cannot be kept."

### Delivered orders are missing from the stock done when [`design critic`] - Severity: Major
*   **Affected Scope:** [Lines 194–196](docs/scope/scope.md#L194-L196) (Admin orders)
*   **Discrepancy Description:** Admin orders are done when cancel releases stock and return restocks it. SCHEMA decision 6 also decrements both columns on delivered. Spec 0002 says every stock change sets `Product.inStock` in that same transaction.
*   **Rationale:** A build can leave `reservedStock` in place after delivery, so available stock stays too low, and can leave the cached flag on the old meaning.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** Cancel and return are necessary and not sufficient. Delivered is the path that takes the unit off the shelf for good.
*   ***Proposed Edit:***
    *   Location: Admin orders, the done when line
    *   Change: Add: "Delivered decrements `stock` and `reservedStock`. Every stock change sets `Product.inStock` to the meaning in spec 0002."

### The end to end row sits outside the test table [`structural`] - Severity: Major
*   **Affected Scope:** [Lines 102–111](docs/specs/0001-test-setup.md#L102-L111) (Test layout and naming)
*   **Discrepancy Description:** The table ends at the database races row. A paragraph follows, then a lone pipe row for end to end tests.
*   **Rationale:** That row has no header, so the file pattern and the two viewports fall out of the only grid that says where each kind of test runs.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** The row is already written. It needs to be inside the table.
*   ***Proposed Edit:***
    *   Location: Test layout and naming
    *   Change: Move the end to end row into the table, directly under the database races row, and delete the stray pipe line after the paragraph.

### Typecheck is not in the scenario list [`structural`] - Severity: Nit
*   **Affected Scope:** [Lines 165–172](docs/specs/0001-test-setup.md#L165-L172) (Critical test scenarios)
*   **Discrepancy Description:** Scenarios cite AC-1 through AC-10. AC-11 (typecheck and lint stay clean) never appears.
*   **Rationale:** A builder using the scenario list can miss AC-11. It is only in build plan step 8.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** One line closes the trace from the criterion to a scenario.
*   ***Proposed Edit:***
    *   Location: Critical test scenarios
    *   Change: Add: "Clean tree: `pnpm typecheck` and `pnpm lint` pass with the test files and configs included, verifies **AC-11**."

### The schema doc still says Postgres 16 [`design critic`] - Severity: Nit
*   **Affected Scope:** [Line 46](docs/scope/scope.md#L46) (Stack and scaffold), and `docs/SCHEMA.md` line 3
*   **Discrepancy Description:** The scope and `AGENTS.md` say PostgreSQL 17. `docs/SCHEMA.md` line 3 says PostgreSQL 16.
*   **Rationale:** Migrations are checked against the version named in the schema doc. That name and the container version are different targets.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** The running choice is 17, in `AGENTS.md` and in the scope. The schema doc is the stale line. The scope stays 17.
*   ***Proposed Edit:***
    *   Location: `docs/SCHEMA.md` line 3
    *   Change: Replace "PostgreSQL 16" with "PostgreSQL 17".

### Concurrent tests inside one file are not forbidden [`design critic`] - Severity: Nit
*   **Affected Scope:** [Lines 198–200](docs/specs/0001-test-setup.md#L198-L200) (rollback proxy)
*   **Discrepancy Description:** `currentTx` is one module slot. The spec does not require `isolate: true` or forbid `it.concurrent` in database tests.
*   **Rationale:** Two concurrent tests in one file would share that slot and see each other's uncommitted rows.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** Same edit as the connection ceiling above. One sentence covers both.
*   ***Proposed Edit:***
    *   Location: `db` project description
    *   Change: Included in the connection ceiling edit: `isolate: true`, and database tests do not use `it.concurrent`.
