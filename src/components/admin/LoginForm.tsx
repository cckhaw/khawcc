"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/actions/auth";

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, undefined);
  return (
    <form action={action} className="space-y-4">
      {!configured && (
        <p className="rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          Admin is not configured. Set <code className="font-mono">ADMIN_EMAIL</code>,{" "}
          <code className="font-mono">ADMIN_PASSWORD</code> (or <code className="font-mono">ADMIN_PASSWORD_HASH</code>) and a{" "}
          <code className="font-mono">SESSION_SECRET</code> of 16+ characters.
        </p>
      )}
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-muted">Email</span>
        <input name="email" type="email" autoComplete="username" required defaultValue={state?.email} className="field" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-muted">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="field" />
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
