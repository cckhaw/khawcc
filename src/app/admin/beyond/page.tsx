import Link from "next/link";
import { BeyondEditor } from "@/components/admin/BeyondEditor";
import { requireAdmin } from "@/lib/auth";
import { getBeyond } from "@/lib/data";

export const metadata = { title: "Beyond the desk" };

export default async function AdminBeyond({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const [doc, sp] = await Promise.all([getBeyond(), searchParams]);
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Beyond the desk</h1>
        <p className="mt-1 text-sm text-muted">
          The quiet Strava / Instagram strip near the bottom of the home page. Your Strava and Instagram links are set in{" "}
          <Link href="/admin/profile" className="text-accent underline underline-offset-2">Profile</Link>.
        </p>
      </div>
      {sp.saved && <p className="rounded-xl border border-good/40 bg-good/10 px-4 py-2 text-sm text-good">Saved. The site has been revalidated.</p>}
      <BeyondEditor initial={doc} />
    </div>
  );
}
