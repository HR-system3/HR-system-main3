import React from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "accent" | "warning" | "danger" | "default";
  onConfirm?: () => void;
  onClose: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

const toneClassNames: Record<string, string> = {
  accent: "bg-cyan-500 text-slate-900 hover:bg-cyan-400",
  warning: "bg-amber-400 text-slate-900 hover:bg-amber-300",
  danger: "bg-rose-500 text-white hover:bg-rose-400",
  default: "bg-white/10 text-slate-50 hover:bg-white/20",
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "accent",
  onConfirm,
  onClose,
  children,
  footer,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-3 border-b border-white/5 px-6 py-5">
          <div>
            <div className="text-sm uppercase tracking-[0.16em] text-slate-400">
              Review
            </div>
            <h3 className="mt-1 text-xl font-bold text-slate-50">{title}</h3>
            {description && (
              <p className="mt-2 text-sm text-slate-300">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200 transition hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 text-slate-100">{children}</div>

        <div className="flex items-center justify-between gap-3 border-t border-white/5 px-6 py-4">
          {footer}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              {cancelLabel}
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${toneClassNames[tone]}`}
              >
                {confirmLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
