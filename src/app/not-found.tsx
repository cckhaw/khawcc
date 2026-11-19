import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">This page has gone quiet.</h1>
      <p className="mt-4 text-muted">The link may be old or mistyped. Try one of these instead.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">Home</Link>
        <Link href="/cv" className="btn">Experience (CV)</Link>
        <Link href="/book" className="btn">Thinking in Signals</Link>
      </div>
    </div>
  );
}
