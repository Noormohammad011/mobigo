import AxeBuilder from "@axe-core/playwright"
import { test as base, expect, type Page } from "@playwright/test"

export const expectNoA11yViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze()
  const serious = results.violations.filter((item) => item.impact === "serious" || item.impact === "critical")
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
}

type Fixtures = { signedInPage: Page }

export const test = base.extend<Fixtures>({
  signedInPage: async ({ browser }, provide, workerInfo) => {
    const email = `e2e-${workerInfo.workerIndex}-${crypto.randomUUID()}@e2e.mobigo.test`
    const password = crypto.randomUUID() + crypto.randomUUID()
    const name = `E2E Worker ${workerInfo.workerIndex}`
    const secret = process.env.E2E_SUPABASE_SECRET_KEY
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!secret || !url) throw new Error("E2E_SUPABASE_SECRET_KEY is missing. Run pnpm test:e2e so the script can pass it.")
    const created = await fetch(`${url}/auth/v1/admin/users`, {
      method: "POST",
      headers: { apikey: secret, authorization: `Bearer ${secret}`, "content-type": "application/json" },
      body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { name } }),
    })
    if (!created.ok) throw new Error(`Could not create the e2e user (${created.status}).`)
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto("/auth/login")
    await page.getByLabel("Email").fill(email)
    await page.getByLabel("Password").fill(password)
    await page.getByRole("button", { name: "Sign in" }).click()
    await page.waitForURL("**/account")
    await provide(page)
    await context.close()
  },
})

export { expect }
