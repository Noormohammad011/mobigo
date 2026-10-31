import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../_components/auth-shell";
import { ForgotPasswordForm } from "../_components/forms";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      description="Enter your email and we'll send you a reset link."
      footer={<Link href="/auth/login" className="font-medium text-primary hover:underline">Back to sign in</Link>}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
