import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../_components/auth-shell";

export const metadata: Metadata = { title: "Check your email" };

export default function CheckEmailPage() {
  return (
    <AuthShell title="Check your email" footer={<Link href="/auth/login" className="font-medium text-primary hover:underline">Back to sign in</Link>}>
      <p className="text-sm text-muted-foreground">
        We sent you a confirmation link. Open it on this device to activate your account.
      </p>
    </AuthShell>
  );
}
