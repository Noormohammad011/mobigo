"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { normalizeBdPhone } from "@/lib/auth/phone";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
} | undefined;

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const password = z.string().min(8, "Use at least 8 characters.").max(72, "Use at most 72 characters.");

const signUpSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name.").max(100),
    email: z.email("Enter a valid email.").transform((v) => v.toLowerCase()),
    phone: z
      .string()
      .trim()
      .refine((v) => v === "" || normalizeBdPhone(v) !== null, "Use a Bangladeshi mobile number, e.g. 01712345678."),
    password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

export async function signUp(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const { name, email, phone, password } = parsed.data;
  const next = safeNextPath(formData.get("next"), "/account");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/confirm?next=${encodeURIComponent(next)}`,
      data: { name, phone: normalizeBdPhone(phone) },
    },
  });
  if (error) return { error: error.code === "weak_password" ? "Choose a stronger password." : error.message };

  // Email confirmation disabled in Supabase → a session exists right away.
  redirect(data.session ? next : "/auth/check-email");
}

const signInSchema = z.object({
  email: z.email("Enter a valid email.").transform((v) => v.toLowerCase()),
  password: z.string().min(1, "Enter your password."),
});

export async function signIn(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") return { error: "Confirm your email first. Check your inbox for the link." };
    return { error: "Incorrect email or password." };
  }
  redirect(safeNextPath(formData.get("next"), "/account"));
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = z.object({ email: z.email("Enter a valid email.") }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email.toLowerCase(), {
    redirectTo: `${siteUrl()}/auth/confirm?next=/auth/update-password`,
  });
  // Same message whether or not the account exists (no account enumeration).
  return { message: "If an account exists for that email, a reset link is on its way." };
}

export async function updatePassword(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = z
    .object({ password, confirmPassword: z.string() })
    .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.code === "same_password" ? "Choose a password you haven't used." : error.message };
  redirect("/account");
}
