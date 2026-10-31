import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../_components/auth-shell";

export const metadata: Metadata = { title: "Link problem" };

// Fixed copy only; never render text from the query string.
export default function AuthErrorPage() {
  return (
    <AuthShell
      title="This link didn't work"
      footer={<Link href="/auth/login" className="font-medium text-primary hover:underline">Back to sign in</Link>}
    >
      <p className="text-sm text-muted-foreground">
        The link may have expired or already been used. Request a new one from the sign-in page.
      </p>
    </AuthShell>
  );
}
