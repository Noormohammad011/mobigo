const bdt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })

/** Integer BDT → "৳116,499" (DESIGN_SYSTEM §1 voice, §7.4 card). */
export function formatBDT(amount: number): string {
  return `৳${bdt.format(amount)}`
}
