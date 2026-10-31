import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { signOut } from "../auth/actions";

export const metadata: Metadata = { title: "My account", robots: { index: false, follow: false } };

export default function AccountPage() {
  return (
    <div className="page-container max-w-2xl py-8">
      <h1 className="mb-6 text-h1">My account</h1>
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <AccountDetails />
      </Suspense>
    </div>
  );
}

async function AccountDetails() {
  const user = await requireUser("/account");
  return (
    <section className="grid gap-4">
      <dl className="grid gap-1 text-sm">
        <dt className="text-muted-foreground">Name</dt>
        <dd className="font-medium">{user.name}</dd>
        <dt className="mt-2 text-muted-foreground">Email</dt>
        <dd className="font-medium">{user.email ?? "Not set"}</dd>
        <dt className="mt-2 text-muted-foreground">Mobile</dt>
        <dd className="font-medium">{user.phone ?? "Not set"}</dd>
      </dl>
      <nav className="flex flex-col gap-2 text-body-sm">
        <Link href="/account/orders" className="text-link underline">
          Order history
        </Link>
        <Link href="/account/wishlist" className="text-link underline">
          Wishlist
        </Link>
        <Link href="/track" className="text-link underline">
          Track an order
        </Link>
      </nav>
      <form action={signOut}>
        <Button type="submit" variant="outline" className="h-11 rounded-full">Sign out</Button>
      </form>
    </section>
  );
}
