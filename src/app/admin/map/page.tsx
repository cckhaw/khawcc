import Link from "next/link";
import { ApacMapEditor } from "@/components/admin/ApacMapEditor";
import { requireAdmin } from "@/lib/auth";
import { getApacDoc } from "@/lib/data";

export const metadata = { title: "APAC map" };

export default async function AdminMap({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const [doc, sp] = await Promise.all([getApacDoc(), searchParams]);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">APAC map</h1>
          <p className="mt-1 text-sm text-muted">Projects shown on the home page map and the shareable image.</p>
        </div>
        <Link href="/apac-map" target="_blank" className="btn btn-sm">Open shareable image ↗</Link>
      </div>
      {sp.saved && <p className="rounded-xl border border-good/40 bg-good/10 px-4 py-2 text-sm text-good">Saved. The site has been revalidated.</p>}
      <ApacMapEditor initial={doc} />
    </div>
  );
}
