"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function SubmitButton({
  children,
  pending: pendingLabel = "Saving…",
  className = "btn btn-primary",
  ...rest
}: { children: ReactNode; pending?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className} {...rest}>
      {pending ? pendingLabel : children}
    </button>
  );
}

/** Submit button that asks for confirmation first (destructive actions). */
export function ConfirmButton({
  children,
  message = "Are you sure? This cannot be undone.",
  className = "btn btn-sm btn-danger",
}: {
  children: ReactNode;
  message?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-medium text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-dim">{hint}</span>}
    </label>
  );
}

/** Like Field, but a <div>: use for rich editors, whose toolbar buttons must not sit inside a <label>. */
export function Block({ label, hint, children, className = "" }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className} role="group" aria-label={label}>
      <span className="mb-1.5 block text-[13px] font-medium text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-dim">{hint}</span>}
    </div>
  );
}
