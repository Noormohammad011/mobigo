import { PrismaPg } from "@prisma/adapter-pg"
import { afterEach, beforeEach, vi } from "vitest"

import { PrismaClient } from "@/generated/prisma/client"
import { assertLocalTestDatabase } from "@/test/guard"

const TEST_URL = process.env.TEST_DATABASE_URL ?? "postgresql://mobigo:mobigo@localhost:5432/mobigo_test"
assertLocalTestDatabase(TEST_URL)
process.env.DATABASE_URL = TEST_URL
process.env.DIRECT_URL = TEST_URL

class RollbackSignal extends Error {
  constructor() {
    super("ROLLBACK")
    this.name = "ROLLBACK"
  }
}

type Tx = {
  $executeRawUnsafe: (query: string) => Promise<number>
  $transaction: (fn: unknown, options?: unknown) => Promise<unknown>
}

let currentTx: Tx | null = null
let depth = 0
let releaseTest: (() => void) | null = null
let pending: Promise<void> | null = null

const requireTx = (): Tx => {
  if (!currentTx) throw new Error("db used outside a test")
  return currentTx
}

const runSavepoint = async (tx: Tx, fn: () => Promise<unknown>) => {
  depth += 1
  const name = `sp_${depth}`
  try {
    await tx.$executeRawUnsafe(`SAVEPOINT ${name}`)
    const result = await fn()
    await tx.$executeRawUnsafe(`RELEASE SAVEPOINT ${name}`)
    return result
  } catch (error) {
    await tx.$executeRawUnsafe(`ROLLBACK TO SAVEPOINT ${name}`)
    throw error
  } finally {
    depth -= 1
  }
}

const testDb = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === "$connect" || prop === "$disconnect") return async () => {}
      if (prop === "$transaction") {
        return (fnOrArray: unknown) => {
          const tx = requireTx()
          if (Array.isArray(fnOrArray)) {
            return runSavepoint(tx, async () => {
              const results = []
              for (const op of fnOrArray) results.push(await op)
              return results
            })
          }
          return runSavepoint(tx, () => (fnOrArray as (client: Tx) => Promise<unknown>)(tx))
        }
      }
      const tx = requireTx()
      const value = (tx as Record<PropertyKey, unknown>)[prop]
      return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(tx) : value
    },
  }
)

vi.mock("@/lib/db", () => ({
  get db() {
    return testDb
  },
}))

const client = new PrismaClient({ adapter: new PrismaPg({ connectionString: TEST_URL }) })

beforeEach(async () => {
  let markReady!: () => void
  const ready = new Promise<void>((resolve) => {
    markReady = resolve
  })
  let release!: () => void
  const released = new Promise<void>((resolve) => {
    release = resolve
  })
  releaseTest = release
  pending = client
    .$transaction(
      async (tx) => {
        currentTx = tx as unknown as Tx
        markReady()
        await released
        throw new RollbackSignal()
      },
      { timeout: 60_000, maxWait: 10_000 }
    )
    .then(() => {
      throw new Error("test transaction committed")
    })
    .catch((error: unknown) => {
      if (error instanceof RollbackSignal) return
      throw error
    })
  await ready
})

afterEach(async () => {
  releaseTest?.()
  await pending
  currentTx = null
  pending = null
  releaseTest = null
  depth = 0
})
