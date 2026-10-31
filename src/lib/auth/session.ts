import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import type { Role, User } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { normalizeBdPhone } from "./phone";

type Claims = {
  sub: string;
  email?: string;
  phone?: string;
  user_metadata?: { name?: unknown; phone?: unknown };
};

// Verified identity from the Supabase session (JWT signature checked by getClaims).
export const getCurrentUser = cache(async (): Promise<User | null> => {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as Claims | undefined;
  if (!claims?.sub) return null;

  const user = (await db.user.findUnique({ where: { id: claims.sub } })) ?? (await createProfile(claims));
  return user.isActive ? user : null;
});

export async function requireUser(next: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/auth/login?next=${encodeURIComponent(next)}`);
  return user;
}

// Roles come from our User table only, never from Supabase user_metadata (user-editable).
export async function requireRole(roles: Role[], next: string): Promise<User> {
  const user = await requireUser(next);
  if (!roles.includes(user.role)) notFound();
  return user;
}

// First sign-in: create the profile row. name/phone from user_metadata are display and
// contact data only; they never grant anything.
async function createProfile(claims: Claims): Promise<User> {
  const email = claims.email?.toLowerCase() || null;
  const name =
    (typeof claims.user_metadata?.name === "string" && claims.user_metadata.name.trim().slice(0, 100)) ||
    email?.split("@")[0] ||
    "Customer";
  const candidatePhone = normalizeBdPhone(claims.phone) ?? normalizeBdPhone(claims.user_metadata?.phone);
  const phoneTaken = candidatePhone ? await db.user.findUnique({ where: { phone: candidatePhone } }) : null;
  const phone = phoneTaken ? null : candidatePhone;

  // upsert: two parallel first requests must not both fail on the primary key.
  return db.user.upsert({
    where: { id: claims.sub },
    create: { id: claims.sub, name, email, phone },
    update: {},
  });
}
