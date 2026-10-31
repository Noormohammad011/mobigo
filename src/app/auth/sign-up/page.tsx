import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "../_components/auth-shell";
import { SignUpForm } from "../_components/forms";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage({ searchParams }: PageProps<"/auth/sign-up">) {
  return (
    <AuthShell
      title="Create your account"
      description="You can also check out as a guest, no account needed."
      footer={<>Already have an account?&nbsp;<Link href="/auth/login" className="font-medium text-primary hover:underline">Sign in</Link></>}
    >
      <Suspense fallback={<SignUpForm />}>
        {searchParams.then(({ next }) => <SignUpForm next={typeof next === "string" ? next : undefined} />)}
      </Suspense>
    </AuthShell>
  );
}
