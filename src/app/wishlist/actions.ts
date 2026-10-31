"use server"

import { revalidatePath } from "next/cache"

import { getCurrentUser } from "@/lib/auth/session"
import { db } from "@/lib/db"

export async function toggleWishlistAction(productId: string): Promise<{ ok: true; saved: boolean } | { ok: false; reason: "guest" }> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, reason: "guest" }

  const existing = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  })

  if (existing) {
    await db.wishlistItem.delete({ where: { userId_productId: { userId: user.id, productId } } })
    revalidatePath("/account/wishlist")
    return { ok: true, saved: false }
  }

  await db.wishlistItem.create({ data: { userId: user.id, productId } })
  revalidatePath("/account/wishlist")
  return { ok: true, saved: true }
}

export const isProductWishlisted = async (userId: string, productId: string): Promise<boolean> => {
  const row = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { productId: true },
  })
  return Boolean(row)
}
