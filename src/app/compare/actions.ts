"use server"

import { getCompareTable, type CompareTablePayload } from "@/lib/queries/compare"
import { assertFlag } from "@/lib/flags"

export const loadCompareTableAction = async (slugs: string[]): Promise<CompareTablePayload> => {
  await assertFlag("compare")
  return getCompareTable(slugs)
}
