"use client";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-20">
      <div className="glass p-8">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-3 rounded-lg border border-line bg-card p-3 font-mono text-xs text-danger">
          {error.message || "Unexpected error"}
        </p>
        <button onClick={reset} className="btn mt-6">
          Try again
        </button>
      </div>
    </div>
  );
}
