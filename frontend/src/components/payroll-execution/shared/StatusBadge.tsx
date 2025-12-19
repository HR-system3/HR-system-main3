import { PayrollStatus, PayrollPaymentStatus } from '@/types/enums';

type StatusValue = PayrollStatus | PayrollPaymentStatus | string;

interface StatusBadgeProps {
  value: StatusValue;
  size?: "sm" | "md";
}

type Style = { bg: string; text: string; ring?: string };

// Use a Map-like structure to handle enum conflicts
const statusPaletteMap = new Map<StatusValue, Style>([
  [PayrollStatus.DRAFT, { bg: 'bg-white/10', text: 'text-slate-100' }],
  [PayrollStatus.CALCULATED, { bg: 'bg-cyan-500/20', text: 'text-cyan-200', ring: 'ring-1 ring-cyan-400/30' }],
  [PayrollStatus.APPROVED, { bg: 'bg-emerald-500/20', text: 'text-emerald-100', ring: 'ring-1 ring-emerald-400/30' }],
  [PayrollStatus.REJECTED, { bg: 'bg-rose-500/20', text: 'text-rose-100', ring: 'ring-1 ring-rose-400/30' }],
  [PayrollStatus.PAID, { bg: 'bg-amber-500/20', text: 'text-amber-50', ring: 'ring-1 ring-amber-400/30' }],
  [PayrollStatus.UNDER_REVIEW, { bg: 'bg-yellow-500/20', text: 'text-yellow-100', ring: 'ring-1 ring-yellow-400/30' }],
  [PayrollStatus.PENDING_FINANCE_APPROVAL, { bg: 'bg-blue-500/20', text: 'text-blue-100', ring: 'ring-1 ring-blue-400/30' }],
  [PayrollStatus.LOCKED, { bg: 'bg-gray-500/20', text: 'text-gray-100' }],
  [PayrollStatus.UNLOCKED, { bg: 'bg-green-500/20', text: 'text-green-100' }],
  [PayrollPaymentStatus.PENDING, { bg: 'bg-sky-500/20', text: 'text-sky-100' }],
  [PayrollPaymentStatus.FAILED, { bg: 'bg-rose-500/20', text: 'text-rose-100' }],
  [PayrollPaymentStatus.PAID, { bg: 'bg-emerald-500/20', text: 'text-emerald-50' }],
]);

export default function StatusBadge({
  value,
  size = "md",
}: StatusBadgeProps) {
  const palette = statusPaletteMap.get(value) ?? {
    bg: "bg-white/10",
    text: "text-slate-100",
  };

  const sizing =
    size === "sm"
      ? "px-3 py-1 text-[11px]"
      : "px-3.5 py-1.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-semibold tracking-tight ${palette.bg} ${palette.text} ${palette.ring ?? ""} ${sizing}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {String(value).replaceAll("_", " ")}
    </span>
  );
}
