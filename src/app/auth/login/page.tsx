import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "../_components/auth-shell";
import { LoginForm } from "../_components/forms";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: PageProps<"/auth/login">) {
  return (
    <AuthShell
      title="Sign in"
      description="Track orders and check out faster."
      footer={<>New to MobiGo?&nbsp;<Link href="/auth/sign-up" className="font-medium text-primary hover:underline">Create an account</Link></>}
    >
      <Suspense fallback={<LoginForm />}>
        {searchParams.then(({ next }) => <LoginForm next={typeof next === "string" ? next : undefined} />)}
      </Suspense>
    </AuthShell>
  );
}
