import type { Metadata } from "next";
import { AuthShell } from "../_components/auth-shell";
import { UpdatePasswordForm } from "../_components/forms";

export const metadata: Metadata = { title: "Set a new password" };

// Reached from the reset email via /auth/confirm, which signs the user in first.
export default function UpdatePasswordPage() {
  return (
    <AuthShell title="Set a new password">
      <UpdatePasswordForm />
    </AuthShell>
  );
}
