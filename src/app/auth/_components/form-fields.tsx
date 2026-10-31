"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Field({
  label,
  name,
  errors,
  hint,
  ...input
}: ComponentProps<typeof Input> & { label: string; name: string; errors?: string[]; hint?: string }) {
  const describedBy = errors?.length ? `${name}-error` : hint ? `${name}-hint` : undefined;
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} aria-invalid={!!errors?.length} aria-describedby={describedBy} className="h-11" {...input} />
      {errors?.length ? (
        <p id={`${name}-error`} className="text-sm text-danger-text">{errors[0]}</p>
      ) : hint ? (
        <p id={`${name}-hint`} className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function SubmitButton({ children, pendingText }: { children: string; pendingText: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="h-11 w-full rounded-full" disabled={pending}>
      {pending ? pendingText : children}
    </Button>
  );
}

export function FormMessage({ error, message }: { error?: string; message?: string }) {
  if (error) return <p role="alert" className="text-sm text-danger-text">{error}</p>;
  if (message) return <p role="status" className="text-sm text-muted-foreground">{message}</p>;
  return null;
}
