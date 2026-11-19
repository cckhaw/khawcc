"use server";

import { redirect } from "next/navigation";
import { login, logout } from "@/lib/auth";

export type LoginState = { error?: string; email?: string } | undefined;

export async function loginAction(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const email = String(fd.get("email") ?? "");
  const password = String(fd.get("password") ?? "");
  if (!(await login(email, password))) return { error: "Invalid email or password.", email };
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/");
}
