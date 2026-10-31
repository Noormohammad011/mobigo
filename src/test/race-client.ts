import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "@/generated/prisma/client"
import { assertLocalTestDatabase } from "@/test/guard"

const url = process.env.TEST_DATABASE_URL ?? "postgresql://mobigo:mobigo@localhost:5432/mobigo_test"
assertLocalTestDatabase(url)

/** Real client for race tests. They commit, then truncate the tables they touched. */
export const raceDb = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })
