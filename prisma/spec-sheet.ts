import type { PrismaClient } from "../src/generated/prisma/client"

type Db = Pick<PrismaClient, "specGroup" | "specAttribute" | "specValue" | "product">

/** Catalog groups and attributes for seed and backfill (spec 0015). */
export const SPEC_CATALOG = [
  {
    name: "Display",
    sortOrder: 0,
    attributes: [
      { name: "Size", unit: "inch", isKeySpec: true },
      { name: "Type", unit: null, isKeySpec: true },
      { name: "Refresh rate", unit: "Hz", isKeySpec: false },
    ],
  },
  {
    name: "Platform",
    sortOrder: 1,
    attributes: [
      { name: "Chipset", unit: null, isKeySpec: true },
      { name: "RAM", unit: "GB", isKeySpec: true },
      { name: "Storage", unit: "GB", isKeySpec: true },
    ],
  },
  {
    name: "Battery",
    sortOrder: 2,
    attributes: [
      { name: "Capacity", unit: "mAh", isKeySpec: true },
      { name: "Charging", unit: null, isKeySpec: false },
    ],
  },
  {
    name: "Camera",
    sortOrder: 3,
    attributes: [
      { name: "Main camera", unit: "MP", isKeySpec: true },
      { name: "Selfie camera", unit: "MP", isKeySpec: false },
    ],
  },
  {
    name: "Connectivity",
    sortOrder: 4,
    attributes: [
      { name: "Network", unit: null, isKeySpec: true },
      { name: "SIM", unit: null, isKeySpec: false },
    ],
  },
] as const

export type SpecProductInput = {
  id: string
  slug: string
  displaySizeIn: number | null
  batteryMah: number | null
  chipsetBrand: string | null
  network: string | null
  ramOptionsGb: number[]
  storageOptionsGb: number[]
}

const displayType = (slug: string) => (slug.includes("fold") || slug.includes("flip") ? "Foldable AMOLED" : "AMOLED")

const mainMp = (slug: string) => {
  let h = 0
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 1000
  return 50 + (h % 51)
}

export const ensureSpecCatalog = async (db: Db): Promise<Map<string, string>> => {
  const attrIds = new Map<string, string>()
  for (const group of SPEC_CATALOG) {
    const g = await db.specGroup.upsert({
      where: { name: group.name },
      create: { name: group.name, sortOrder: group.sortOrder },
      update: { sortOrder: group.sortOrder },
    })
    for (const [index, attr] of group.attributes.entries()) {
      const row = await db.specAttribute.upsert({
        where: { groupId_name: { groupId: g.id, name: attr.name } },
        create: {
          groupId: g.id,
          name: attr.name,
          unit: attr.unit,
          isKeySpec: attr.isKeySpec,
          isComparable: true,
          sortOrder: index,
        },
        update: { unit: attr.unit, isKeySpec: attr.isKeySpec, sortOrder: index },
      })
      attrIds.set(`${group.name}:${attr.name}`, row.id)
    }
  }
  return attrIds
}

export const specValuesForProduct = (product: SpecProductInput, attrIds: Map<string, string>) => {
  const ram = product.ramOptionsGb.length ? Math.max(...product.ramOptionsGb) : 8
  const storage = product.storageOptionsGb.length ? Math.max(...product.storageOptionsGb) : 256
  const storageLabel = storage >= 1024 ? `${storage / 1024} TB` : `${storage} GB`
  const network = product.network === "G5" ? "5G" : "4G LTE"
  const entries: { key: string; value: string }[] = [
    { key: "Display:Size", value: `${product.displaySizeIn ?? 6.6} inch` },
    { key: "Display:Type", value: displayType(product.slug) },
    { key: "Display:Refresh rate", value: product.network === "G5" ? "120 Hz" : "90 Hz" },
    { key: "Platform:Chipset", value: product.chipsetBrand ?? "Octa core" },
    { key: "Platform:RAM", value: `${ram} GB` },
    { key: "Platform:Storage", value: storageLabel },
    { key: "Battery:Capacity", value: `${product.batteryMah ?? 5000} mAh` },
    { key: "Battery:Charging", value: "Fast charging" },
    { key: "Camera:Main camera", value: `${mainMp(product.slug)} MP` },
    { key: "Camera:Selfie camera", value: "32 MP" },
    { key: "Connectivity:Network", value: network },
    { key: "Connectivity:SIM", value: "Dual nano SIM" },
  ]
  return entries
    .map((entry) => {
      const attributeId = attrIds.get(entry.key)
      if (!attributeId) return null
      return { attributeId, value: entry.value }
    })
    .filter((row): row is { attributeId: string; value: string } => row !== null)
}

export const upsertProductSpecs = async (db: Db, product: SpecProductInput, attrIds: Map<string, string>) => {
  const values = specValuesForProduct(product, attrIds)
  for (const row of values) {
    await db.specValue.upsert({
      where: { productId_attributeId: { productId: product.id, attributeId: row.attributeId } },
      create: { productId: product.id, attributeId: row.attributeId, value: row.value },
      update: { value: row.value },
    })
  }
}
