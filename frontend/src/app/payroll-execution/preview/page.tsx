"use client";

export default function PreviewLanding() {
  return (
    <div className="page-shell space-y-6">
      <div className="glass-card p-6">
        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
          Preview dashboard
        </div>
        <h1 className="mt-2 text-3xl font-bold text-slate-50">
          Select a payroll run to preview
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Choose any run from the table to open its preview dashboard,
          review irregularities, and approve initiation.
        </p>
        <div className="mt-4">
          <a
            href="/payroll-execution"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-cyan-400"
          >
            Go to payroll runs
          </a>
        </div>
      </div>
    </div>
  );
}
