import { PayRollStatus, PayrollRun } from "@/types/payroll-run.types";

interface PayrollRunActionsProps {
  run: PayrollRun;
  irregularityCount: number;
  onPreview: (run: PayrollRun) => void;
  onAutoInitiate: (run: PayrollRun) => void;
  onReview: (run: PayrollRun) => void;
  onManualEdit: (run: PayrollRun) => void;
}

export default function PayrollRunActions({
  run,
  irregularityCount,
  onPreview,
  onAutoInitiate,
  onReview,
  onManualEdit,
}: PayrollRunActionsProps) {
  const isDraft = run.status === PayRollStatus.DRAFT;
  const needsApproval = run.status === PayRollStatus.UNDER_REVIEW || run.status === PayRollStatus.PENDING_FINANCE_APPROVAL;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onPreview(run)}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:bg-white/10"
      >
        Preview
      </button>

      {isDraft && (
        <button
          onClick={() => onAutoInitiate(run)}
          className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-cyan-400"
        >
          Auto-initiate
        </button>
      )}

      {(needsApproval || irregularityCount > 0) && (
        <button
          onClick={() => onReview(run)}
          className="rounded-lg border border-amber-200/50 bg-amber-100/10 px-3 py-2 text-xs font-semibold text-amber-50 transition hover:-translate-y-0.5 hover:bg-amber-200/20"
        >
          Review & approve
        </button>
      )}

      {(isDraft || needsApproval) && (
        <button
          onClick={() => onManualEdit(run)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:bg-white/10"
        >
          Edit initiation
        </button>
      )}
    </div>
  );
}
