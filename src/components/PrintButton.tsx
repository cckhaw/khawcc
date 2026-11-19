"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/**
 * On /cv: calls window.print() directly.
 * Elsewhere: routes to /cv?print=1, where the CV auto-opens the print dialog.
 */
export function PrintButton({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (window.location.pathname === href) window.print();
        else router.push(`${href}?print=1`);
      }}
    >
      {children}
    </button>
  );
}
