import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { LockIcon } from "@/components/icons";
import { authConfigured, isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin sign-in", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center overflow-hidden px-5 py-16">
      <div className="canvas-glow" />
      <div className="glass w-full max-w-sm p-8 shadow-2xl">
        <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-card text-accent">
          <LockIcon width={20} height={20} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin sign-in</h1>
        <p className="mt-1 mb-6 text-sm text-muted">Restricted area. Content management only.</p>
        <LoginForm configured={authConfigured()} />
      </div>
    </div>
  );
}
