import { IrregularitySeverity } from "@/lib/payrollIrregularities";

interface ExceptionBadgeProps {
  count: number;
  severity?: IrregularitySeverity | null;
}

const palette: Record<string, { bg: string; text: string }> = {
  high: { bg: "bg-rose-500/20", text: "text-rose-100" },
  medium: { bg: "bg-amber-500/20", text: "text-amber-50" },
  low: { bg: "bg-emerald-500/20", text: "text-emerald-100" },
  none: { bg: "bg-white/10", text: "text-slate-100" },
};

export default function ExceptionBadge({
  count,
  severity,
}: ExceptionBadgeProps) {
  const tone = severity ?? (count > 0 ? "medium" : "none");
  const colors = palette[tone] ?? palette.none;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {count > 0 ? `${count} irregularit${count > 1 ? "ies" : "y"}` : "Clean"}
    </span>
  );
}
