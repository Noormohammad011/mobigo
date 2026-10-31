"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, signIn, signUp, updatePassword } from "../actions";
import { Field, FormMessage, SubmitButton } from "./form-fields";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signIn, undefined);
  return (
    <form action={action} className="grid gap-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" required errors={state?.fieldErrors?.email} />
      <Field label="Password" name="password" type="password" autoComplete="current-password" required errors={state?.fieldErrors?.password} />
      <Link href="/auth/forgot-password" className="-mt-2 justify-self-end text-sm text-primary hover:underline">
        Forgot password?
      </Link>
      <FormMessage error={state?.error} />
      <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
    </form>
  );
}

export function SignUpForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signUp, undefined);
  const e = state?.fieldErrors;
  return (
    <form action={action} className="grid gap-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Full name" name="name" autoComplete="name" required errors={e?.name} />
      <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" required errors={e?.email} />
      <Field
        label="Mobile number (optional)"
        name="phone"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        placeholder="01XXXXXXXXX"
        hint="We call this number to confirm your orders."
        errors={e?.phone}
      />
      <Field label="Password" name="password" type="password" autoComplete="new-password" required errors={e?.password} hint="At least 8 characters." />
      <Field label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" required errors={e?.confirmPassword} />
      <FormMessage error={state?.error} />
      <SubmitButton pendingText="Creating account…">Create account</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, undefined);
  return (
    <form action={action} className="grid gap-4" noValidate>
      <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" required errors={state?.fieldErrors?.email} />
      <FormMessage error={state?.error} message={state?.message} />
      <SubmitButton pendingText="Sending…">Send reset link</SubmitButton>
    </form>
  );
}

export function UpdatePasswordForm() {
  const [state, action] = useActionState(updatePassword, undefined);
  return (
    <form action={action} className="grid gap-4" noValidate>
      <Field label="New password" name="password" type="password" autoComplete="new-password" required errors={state?.fieldErrors?.password} hint="At least 8 characters." />
      <Field label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" required errors={state?.fieldErrors?.confirmPassword} />
      <FormMessage error={state?.error} />
      <SubmitButton pendingText="Saving…">Save password</SubmitButton>
    </form>
  );
}
