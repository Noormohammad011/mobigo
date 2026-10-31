/**
 * Local sample data for MobiGo (PRD M0: brands, ~30 phones, home shelves, banners).
 *
 *   pnpm db:seed
 *
 * SAMPLE DATA ONLY: prices, stock and specs are illustrative, and the images are
 * generated placeholders written to public/seed/. The script wipes catalog and
 * content tables first, so it refuses to run against anything but a local DB.
 */
import "dotenv/config"
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient, type NetworkType, type ProductStatus } from "../src/generated/prisma/client"

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? ""
const host = (() => {
  try {
    return new URL(url).hostname
  } catch {
    return ""
  }
})()
if (!["localhost", "127.0.0.1", "::1", "db"].includes(host)) {
  console.error(`Refusing to seed: database host is "${host || "unset"}", not a local database.`)
  process.exit(1)
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })

// ── Deterministic pseudo-random, so every seed run produces the same catalog ──
let s = 42
const rand = () => ((s = (s * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32)

// ── Placeholder images ─────────────────────────────────────────────────────
const PUBLIC = join(process.cwd(), "public", "seed")
mkdirSync(join(PUBLIC, "phones"), { recursive: true })
mkdirSync(join(PUBLIC, "banners"), { recursive: true })

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16)
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v + amt))))
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`
}

function phoneSvg(hex: string, foldable: boolean) {
  const dark = shade(hex, -40)
  const w = foldable ? 360 : 300
  const x = (800 - w) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(hex, 25)}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>
<rect width="800" height="800" fill="#fff"/>
<ellipse cx="400" cy="728" rx="${w * 0.55}" ry="14" fill="#0b0b12" opacity=".08"/>
<rect x="${x}" y="90" width="${w}" height="620" rx="52" fill="url(#g)" stroke="#0b0b12" stroke-opacity=".14" stroke-width="4"/>
${foldable ? `<line x1="400" y1="94" x2="400" y2="706" stroke="#0b0b12" stroke-opacity=".18" stroke-width="3"/>` : ""}
<rect x="${x + 28}" y="120" width="132" height="168" rx="34" fill="#0b0b12" fill-opacity=".22"/>
<circle cx="${x + 70}" cy="166" r="26" fill="#16161f"/><circle cx="${x + 70}" cy="166" r="12" fill="#3a3a48"/>
<circle cx="${x + 70}" cy="242" r="26" fill="#16161f"/><circle cx="${x + 70}" cy="242" r="12" fill="#3a3a48"/>
<circle cx="${x + 124}" cy="204" r="20" fill="#16161f"/><circle cx="${x + 124}" cy="204" r="9" fill="#3a3a48"/>
</svg>`
}

function bannerSvg(o: { w: number; h: number; title: string; sub: string; from: string; to: string; accent: string }) {
  const t = o.w > 1200 ? 92 : o.w > 900 ? 64 : 52
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${o.w} ${o.h}" width="${o.w}" height="${o.h}">
<defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${o.from}"/><stop offset="1" stop-color="${o.to}"/></linearGradient></defs>
<rect width="${o.w}" height="${o.h}" fill="url(#b)"/>
<circle cx="${o.w * 0.82}" cy="${o.h * 0.5}" r="${o.h * 0.42}" fill="${o.accent}" opacity=".35"/>
<rect x="${o.w * 0.75}" y="${o.h * 0.14}" width="${o.h * 0.34}" height="${o.h * 0.72}" rx="${o.h * 0.05}" fill="#0b0b12" opacity=".55"/>
<text x="${o.w * 0.07}" y="${o.h * 0.46}" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="800" font-size="${t}" fill="#fff">${o.title}</text>
<text x="${o.w * 0.07}" y="${o.h * 0.46 + t * 0.95}" font-family="Inter, Arial, sans-serif" font-weight="500" font-size="${t * 0.42}" fill="#dde1ff">${o.sub}</text>
</svg>`
}

const imageFor = (hex: string, foldable: boolean) => {
  const file = `${hex.slice(1).toLowerCase()}${foldable ? "-fold" : ""}.svg`
  writeFileSync(join(PUBLIC, "phones", file), phoneSvg(hex, foldable))
  return `/seed/phones/${file}`
}

// ── Catalog definition ─────────────────────────────────────────────────────
type C = [name: string, hex: string]
type P = {
  name: string
  model?: string
  configs: [ram: number, storage: number, price: number][]
  colors: C[]
  network: NetworkType
  display: number
  battery: number
  chipset: string
  releasedDaysAgo: number
  status?: ProductStatus
  discount?: number // compare-at = price + discount (0 = no compare-at)
  outOfStock?: boolean
}

const brands: { name: string; slug: string; featured: boolean; products: P[] }[] = [
  {
    name: "Samsung",
    slug: "samsung",
    featured: true,
    products: [
      { name: "Galaxy S26 Ultra 5G", model: "SM-S948", configs: [[12, 256, 149999], [12, 512, 164999], [16, 1024, 189999]], colors: [["Titanium Black", "#2b2b30"], ["Titanium Silverblue", "#9fb4c8"], ["Titanium Violet", "#6d5a8f"]], network: "G5", display: 6.9, battery: 5000, chipset: "Snapdragon", releasedDaysAgo: 20, discount: 5000 },
      { name: "Galaxy S26+ 5G", configs: [[12, 256, 124999], [12, 512, 136999]], colors: [["Navy", "#28324a"], ["Icy Blue", "#bcd3e6"]], network: "G5", display: 6.7, battery: 4900, chipset: "Exynos", releasedDaysAgo: 20, discount: 4000 },
      { name: "Galaxy S26 5G", configs: [[12, 256, 99999]], colors: [["Mint", "#bfe3d0"], ["Onyx", "#26262b"]], network: "G5", display: 6.3, battery: 4300, chipset: "Exynos", releasedDaysAgo: 20 },
      { name: "Galaxy Z Fold7 5G", configs: [[12, 256, 199999], [12, 512, 214999]], colors: [["Blue Shadow", "#33415c"], ["Jetblack", "#1b1b1f"]], network: "G5", display: 8.0, battery: 4400, chipset: "Snapdragon", releasedDaysAgo: 110, discount: 15000 },
      { name: "Galaxy Z Flip7 5G", configs: [[12, 256, 119999]], colors: [["Coral Red", "#e0675a"], ["Blue Shadow", "#33415c"]], network: "G5", display: 6.9, battery: 4300, chipset: "Exynos", releasedDaysAgo: 110, discount: 8000 },
      { name: "Galaxy A57 5G", configs: [[8, 128, 47999], [8, 256, 52999]], colors: [["Awesome Navy", "#2f3b63"], ["Awesome Lilac", "#c7b6e3"]], network: "G5", display: 6.7, battery: 5000, chipset: "Exynos", releasedDaysAgo: 45, discount: 2000 },
      { name: "Galaxy A37 5G", configs: [[8, 128, 38999]], colors: [["Awesome Graphite", "#3c3c44"], ["Awesome Lime", "#d3e6a3"]], network: "G5", display: 6.7, battery: 5000, chipset: "Exynos", releasedDaysAgo: 45 },
      { name: "Galaxy M37 5G", configs: [[6, 128, 23999], [8, 128, 25999]], colors: [["Silver", "#d6d8dc"], ["Dark Blue", "#24304f"]], network: "G5", display: 6.7, battery: 6000, chipset: "Exynos", releasedDaysAgo: 150, discount: 1500 },
      { name: "Galaxy A17", configs: [[6, 128, 18999]], colors: [["Black", "#202024"], ["Light Blue", "#b9d4ec"]], network: "G4", display: 6.7, battery: 5000, chipset: "MediaTek", releasedDaysAgo: 200, discount: 1000 },
    ],
  },
  {
    name: "Apple",
    slug: "apple",
    featured: true,
    products: [
      { name: "iPhone 17 Pro Max", configs: [[12, 256, 189999], [12, 512, 219999], [12, 1024, 249999]], colors: [["Cosmic Orange", "#e3793f"], ["Deep Blue", "#2c3d5c"], ["Silver", "#e4e4e8"]], network: "G5", display: 6.9, battery: 4832, chipset: "Apple", releasedDaysAgo: 50, discount: 6000 },
      { name: "iPhone 17 Pro", configs: [[12, 256, 169999], [12, 512, 199999]], colors: [["Cosmic Orange", "#e3793f"], ["Deep Blue", "#2c3d5c"]], network: "G5", display: 6.3, battery: 3988, chipset: "Apple", releasedDaysAgo: 50, discount: 5000 },
      { name: "iPhone Air", configs: [[12, 256, 149999]], colors: [["Sky Blue", "#c9dcef"], ["Space Black", "#232327"]], network: "G5", display: 6.5, battery: 3149, chipset: "Apple", releasedDaysAgo: 50, outOfStock: true },
      { name: "iPhone 17", configs: [[8, 256, 119999], [8, 512, 144999]], colors: [["Lavender", "#cbbfe6"], ["Sage", "#b9c9a8"], ["Black", "#26262a"]], network: "G5", display: 6.3, battery: 3692, chipset: "Apple", releasedDaysAgo: 50, discount: 3000 },
      { name: "iPhone 16e", configs: [[8, 128, 84999]], colors: [["White", "#f1f1f1"], ["Black", "#26262a"]], network: "G5", display: 6.1, battery: 4005, chipset: "Apple", releasedDaysAgo: 250, discount: 7000 },
    ],
  },
  {
    name: "Xiaomi",
    slug: "xiaomi",
    featured: true,
    products: [
      { name: "Xiaomi 17 Pro 5G", configs: [[12, 256, 99999], [16, 512, 114999]], colors: [["Black", "#1f1f23"], ["Mist Purple", "#b4a4d6"]], network: "G5", display: 6.3, battery: 6300, chipset: "Snapdragon", releasedDaysAgo: 30, discount: 4000 },
      { name: "Redmi Note 15 Pro+ 5G", configs: [[8, 256, 42999], [12, 512, 49999]], colors: [["Midnight Black", "#1d1d22"], ["Glacier Blue", "#a8c8e8"]], network: "G5", display: 6.8, battery: 6500, chipset: "Snapdragon", releasedDaysAgo: 60, discount: 3000 },
      { name: "Redmi Note 15 Pro 5G", configs: [[8, 256, 34999]], colors: [["Titan Gray", "#5a5c63"], ["Mist Purple", "#b4a4d6"]], network: "G5", display: 6.8, battery: 6200, chipset: "MediaTek", releasedDaysAgo: 60, discount: 2000 },
      { name: "POCO X8 Pro 5G", configs: [[8, 256, 36999], [12, 512, 42999]], colors: [["Yellow", "#f2c94c"], ["Black", "#1d1d22"]], network: "G5", display: 6.7, battery: 6000, chipset: "MediaTek", releasedDaysAgo: 15, status: "PREORDER" },
      { name: "Redmi 15C", configs: [[4, 128, 13999], [6, 128, 15499]], colors: [["Midnight Black", "#1d1d22"], ["Mint Green", "#bfe3d0"]], network: "G4", display: 6.9, battery: 6000, chipset: "MediaTek", releasedDaysAgo: 120, discount: 1000 },
    ],
  },
  {
    name: "OnePlus",
    slug: "oneplus",
    featured: true,
    products: [
      { name: "OnePlus 15 5G", configs: [[12, 256, 94999], [16, 512, 109999]], colors: [["Infinite Black", "#18181c"], ["Sand Storm", "#c9b08e"]], network: "G5", display: 6.8, battery: 7300, chipset: "Snapdragon", releasedDaysAgo: 10, discount: 5000 },
      { name: "OnePlus Nord 6 5G", configs: [[12, 256, 49999]], colors: [["Midnight Ocean", "#22304a"], ["Frosted Silver", "#d9dadf"]], network: "G5", display: 6.8, battery: 6500, chipset: "Snapdragon", releasedDaysAgo: 90 },
      { name: "OnePlus Nord CE6 Lite 5G", configs: [[8, 128, 27999]], colors: [["Mega Blue", "#3e6bd6"], ["Pastel Lime", "#d7ea9e"]], network: "G5", display: 6.7, battery: 5500, chipset: "MediaTek", releasedDaysAgo: 90, discount: 2000 },
    ],
  },
  {
    name: "realme",
    slug: "realme",
    featured: true,
    products: [
      { name: "realme GT 8 Pro 5G", configs: [[12, 256, 79999], [16, 512, 89999]], colors: [["Urban Blue", "#2d4f8e"], ["Diary White", "#efeee9"]], network: "G5", display: 6.8, battery: 7000, chipset: "Snapdragon", releasedDaysAgo: 25, discount: 6000 },
      { name: "realme 15 Pro 5G", configs: [[8, 256, 41999]], colors: [["Flowing Silver", "#cfd3da"], ["Velvet Green", "#2f5a48"]], network: "G5", display: 6.8, battery: 7000, chipset: "Snapdragon", releasedDaysAgo: 100, discount: 3500 },
      { name: "realme Narzo 90 5G", configs: [[6, 128, 19999]], colors: [["Victory Gold", "#d4b36a"], ["Speed Silver", "#c7cad1"]], network: "G5", display: 6.7, battery: 6000, chipset: "MediaTek", releasedDaysAgo: 70, discount: 1500 },
      { name: "realme C85", configs: [[4, 128, 15999]], colors: [["Parrot Purple", "#7c5cc4"], ["Jade Green", "#3f8c74"]], network: "G4", display: 6.8, battery: 7000, chipset: "MediaTek", releasedDaysAgo: 80, outOfStock: true },
    ],
  },
  {
    name: "Google",
    slug: "google",
    featured: false,
    products: [
      { name: "Pixel 10 Pro XL", configs: [[16, 256, 159999], [16, 512, 179999]], colors: [["Obsidian", "#232326"], ["Moonstone", "#7d8a99"]], network: "G5", display: 6.8, battery: 5200, chipset: "Google Tensor", releasedDaysAgo: 70, discount: 10000 },
      { name: "Pixel 10 Pro", configs: [[16, 256, 139999]], colors: [["Porcelain", "#e9e3d8"], ["Obsidian", "#232326"]], network: "G5", display: 6.3, battery: 4870, chipset: "Google Tensor", releasedDaysAgo: 70, discount: 8000 },
      { name: "Pixel 10", configs: [[12, 128, 99999], [12, 256, 109999]], colors: [["Indigo", "#3b3f8f"], ["Lemongrass", "#d8e08a"]], network: "G5", display: 6.3, battery: 4970, chipset: "Google Tensor", releasedDaysAgo: 70 },
      { name: "Pixel 10a", configs: [[8, 128, 59999]], colors: [["Iris", "#8d8fd6"], ["Obsidian", "#232326"]], network: "G5", display: 6.3, battery: 5100, chipset: "Google Tensor", releasedDaysAgo: 5, status: "PREORDER" },
    ],
  },
]

const slugify = (v: string) =>
  v.toLowerCase().replace(/\+/g, "-plus").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

async function main() {
  console.log(`Seeding ${host}…`)

  // Wipe content and catalog (orders/carts/users are left untouched).
  await db.collectionItem.deleteMany()
  await db.collection.deleteMany()
  await db.banner.deleteMany()
  await db.wishlistItem.deleteMany()
  await db.cartItem.deleteMany()
  await db.specValue.deleteMany()
  await db.productFaq.deleteMany()
  await db.review.deleteMany()
  await db.productVariant.deleteMany()
  await db.productImage.deleteMany()
  await db.productColor.deleteMany()
  await db.product.deleteMany()
  await db.brand.deleteMany()
  await db.outlet.deleteMany()
  await db.setting.deleteMany()

  const now = Date.now()
  const created: { id: string; minPrice: number; maxSaving: number; releasedDaysAgo: number; status: ProductStatus }[] = []

  for (const [bi, b] of brands.entries()) {
    const brand = await db.brand.create({
      data: { name: b.name, slug: b.slug, isFeatured: b.featured, sortOrder: bi },
    })

    for (const p of b.products) {
      const slug = slugify(p.name)
      const status: ProductStatus = p.status ?? "ACTIVE"
      const foldable = /Fold|Flip/.test(p.name)

      // Per-variant rows: every color × every RAM/storage config.
      const variants = p.colors.flatMap(([, hex], ci) =>
        p.configs.map(([ram, storage, price]) => {
          const stock = p.outOfStock || status === "PREORDER" ? 0 : Math.floor(rand() * 12) + 1
          return {
            ci,
            hex,
            ramGb: ram,
            storageGb: storage,
            price,
            compareAtPrice: p.discount ? price + p.discount : null,
            stock,
          }
        })
      )
      const minPrice = Math.min(...variants.map((v) => v.price))
      const maxPrice = Math.max(...variants.map((v) => v.price))
      const maxSaving = Math.max(0, ...variants.map((v) => (v.compareAtPrice ? v.compareAtPrice - v.price : 0)))

      const product = await db.product.create({
        data: {
          brandId: brand.id,
          brandName: b.name,
          name: p.name,
          slug,
          modelNumber: p.model,
          shortDescription: `${p.display}″ display, ${p.battery} mAh battery, ${p.chipset} chipset.`,
          status,
          releaseDate: new Date(now - p.releasedDaysAgo * 86_400_000),
          warrantyInfo: "1 year official warranty",
          minPrice,
          maxPrice,
          maxSaving,
          inStock: variants.some((v) => v.stock > 0),
          network: p.network,
          displaySizeIn: p.display,
          batteryMah: p.battery,
          chipsetBrand: p.chipset,
          ramOptionsGb: [...new Set(p.configs.map((c) => c[0]))].sort((a, z) => a - z),
          storageOptionsGb: [...new Set(p.configs.map((c) => c[1]))].sort((a, z) => a - z),
          metaTitle: `${p.name} price in Bangladesh`,
        },
      })

      const colorIds: string[] = []
      for (const [ci, [name, hex]] of p.colors.entries()) {
        const color = await db.productColor.create({
          data: {
            productId: product.id,
            name,
            hex,
            sortOrder: ci,
            images: { create: [{ url: imageFor(hex, foldable), alt: `${p.name} in ${name}`, sortOrder: 0 }] },
          },
        })
        colorIds.push(color.id)
      }

      await db.productVariant.createMany({
        data: variants.map((v) => ({
          productId: product.id,
          colorId: colorIds[v.ci],
          sku: `${slug}-${p.colors[v.ci][0]}-${v.ramGb}-${v.storageGb}`.toUpperCase().replace(/[^A-Z0-9]+/g, "-"),
          ramGb: v.ramGb,
          storageGb: v.storageGb,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          stock: v.stock,
        })),
      })

      created.push({ id: product.id, minPrice, maxSaving, releasedDaysAgo: p.releasedDaysAgo, status })
    }
  }

  // ── Home shelves (PRD H-4) ──
  const shelves: { title: string; slug: string; description: string; ids: string[] }[] = [
    {
      title: "New Arrivals",
      slug: "new-arrivals",
      description: "The latest phones, just landed in Bangladesh.",
      ids: [...created].sort((a, z) => a.releasedDaysAgo - z.releasedDaysAgo).slice(0, 10).map((p) => p.id),
    },
    {
      title: "Best Deals",
      slug: "best-deals",
      description: "The biggest savings on official phones today.",
      ids: created.filter((p) => p.maxSaving > 0).sort((a, z) => z.maxSaving - a.maxSaving).slice(0, 10).map((p) => p.id),
    },
    {
      title: "Flagships",
      slug: "flagships",
      description: "The best cameras, displays and chips money can buy.",
      ids: created.filter((p) => p.minPrice >= 90000).sort((a, z) => z.minPrice - a.minPrice).slice(0, 10).map((p) => p.id),
    },
    {
      title: "Budget under ৳20k",
      slug: "budget-under-20k",
      description: "Reliable everyday phones that cost less than ৳20,000.",
      ids: created.filter((p) => p.minPrice < 20000).sort((a, z) => a.minPrice - z.minPrice).map((p) => p.id),
    },
  ]
  for (const [i, c] of shelves.entries()) {
    await db.collection.create({
      data: {
        title: c.title,
        slug: c.slug,
        description: c.description,
        sortOrder: i,
        items: { create: c.ids.map((productId, position) => ({ productId, position })) },
      },
    })
  }

  // ── Banners (PRD H-1): 3 hero slides + 2 desktop side tiles ──
  const hero = [
    { key: "s26-ultra", title: "Galaxy S26 Ultra", sub: "৳5,000 off today · Pay when it arrives", from: "#0b0b12", to: "#3b35b8", accent: "#7c84ff", link: "/phones/galaxy-s26-ultra-5g" },
    { key: "iphone-17", title: "iPhone 17 series", sub: "Official warranty · In stock now", from: "#16161f", to: "#e3793f", accent: "#ffb27a", link: "/brands/apple" },
    { key: "budget", title: "Smart phones, smart prices", sub: "Great picks under ৳20,000", from: "#0e7f3f", to: "#0b0b12", accent: "#12a150", link: "/collections/budget-under-20k" },
  ]
  for (const [i, h] of hero.entries()) {
    writeFileSync(join(PUBLIC, "banners", `${h.key}-desktop.svg`), bannerSvg({ w: 1920, h: 820, ...h }))
    writeFileSync(join(PUBLIC, "banners", `${h.key}-mobile.svg`), bannerSvg({ w: 1080, h: 608, ...h }))
    await db.banner.create({
      data: {
        title: h.title,
        placement: "HERO",
        imageDesktopUrl: `/seed/banners/${h.key}-desktop.svg`,
        imageMobileUrl: `/seed/banners/${h.key}-mobile.svg`,
        alt: `${h.title}: ${h.sub}`,
        linkUrl: h.link,
        sortOrder: i,
      },
    })
  }
  const side = [
    { key: "side-deals", title: "Best Deals", sub: "Save up to ৳15,000", from: "#3b35b8", to: "#5b5bf6", accent: "#dde1ff", link: "/collections/best-deals" },
    { key: "side-pixel", title: "Pixel 10a", sub: "Pre-order now", from: "#16161f", to: "#3a3a48", accent: "#8d8fd6", link: "/phones/pixel-10a" },
  ]
  for (const [i, t] of side.entries()) {
    writeFileSync(join(PUBLIC, "banners", `${t.key}.svg`), bannerSvg({ w: 800, h: 600, ...t }))
    await db.banner.create({
      data: {
        title: t.title,
        placement: "HERO_SIDE",
        imageDesktopUrl: `/seed/banners/${t.key}.svg`,
        imageMobileUrl: `/seed/banners/${t.key}.svg`,
        alt: `${t.title}: ${t.sub}`,
        linkUrl: t.link,
        sortOrder: i,
      },
    })
  }

  // ── Delivery zones, contact settings, outlets (shell + checkout) ──
  const zones = [
    { name: "Inside Dhaka", fee: 60, etaMinDays: 1, etaMaxDays: 2, districts: ["Dhaka"] },
    { name: "Dhaka suburbs", fee: 100, etaMinDays: 1, etaMaxDays: 3, districts: ["Gazipur", "Narayanganj", "Savar"] },
    { name: "Outside Dhaka", fee: 130, etaMinDays: 2, etaMaxDays: 5, districts: ["Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh", "Cumilla"] },
  ]
  for (const z of zones) {
    await db.deliveryZone.upsert({
      where: { name: z.name },
      update: { fee: z.fee, etaMinDays: z.etaMinDays, etaMaxDays: z.etaMaxDays },
      create: { name: z.name, fee: z.fee, etaMinDays: z.etaMinDays, etaMaxDays: z.etaMaxDays },
    })
  }
  const zoneRows = await db.deliveryZone.findMany()
  for (const z of zones) {
    const zoneId = zoneRows.find((r) => r.name === z.name)!.id
    for (const district of z.districts) {
      await db.deliveryZoneDistrict.upsert({ where: { district }, update: { zoneId }, create: { district, zoneId } })
    }
  }

  await db.setting.createMany({
    data: [
      { key: "support_phone", value: "09612-345678" },
      { key: "support_email", value: "hello@mobigo.example" },
      { key: "whatsapp_number", value: "8801712345678" },
      { key: "facebook_url", value: "https://facebook.com/" },
      { key: "youtube_url", value: "https://youtube.com/" },
      { key: "promo_modal_enabled", value: false },
    ],
  })

  await db.outlet.createMany({
    data: [
      { name: "Bashundhara City", address: "Level 5, Bashundhara City Shopping Complex, Panthapath, Dhaka", phone: "09612-345679", hours: "10am – 8pm, closed Tuesday", sortOrder: 0 },
      { name: "Jamuna Future Park", address: "Level 4, Jamuna Future Park, Kuril, Dhaka", phone: "09612-345680", hours: "10am – 9pm, closed Wednesday", sortOrder: 1 },
    ],
  })

  console.log(
    `Seeded ${brands.length} brands, ${created.length} phones, ${shelves.length} shelves, ${hero.length + side.length} banners.`
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
