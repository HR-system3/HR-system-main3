"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PayrollPreview,
  PayrollRun,
} from "@/types/payroll-run.types";

import { payrollRunService } from "@/services/api/payroll-run.service";
import StatusBadge from "@/components/payroll-execution/shared/StatusBadge";
import Money from "@/components/payroll-execution/shared/Money";
import ExceptionBadge from "@/components/payroll-execution/shared/ExceptionBadge";
import ConfirmDialog from "@/components/payroll-execution/shared/ConfirmDialog";
import {
  evaluateIrregularities,
  getHighestSeverity,
  Irregularity,
  IrregularitySeverity,
} from "@/lib/payrollIrregularities";
import Link from "next/link";

type ModalType = "approve" | "edit" | null;

const PayrollRunPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();

  const runId =
    typeof params.runid === "string"
      ? params.runid
      : params.runid?.[0];

  const [preview, setPreview] = useState<PayrollPreview | null>(null);
  const [run, setRun] = useState<PayrollRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [note, setNote] = useState("");
  const [editForm, setEditForm] = useState<{
    entity?: string;
    employees?: number;
    exceptions?: number;
    totalnetpay?: number;
  }>({});
  const [workflow, setWorkflow] = useState<{
    managerId: string;
    financeId: string;
    unlockReason: string;
    resolveNote: string;
  }>({ managerId: "", financeId: "", unlockReason: "", resolveNote: "" });
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) {
      setError("Invalid Payroll Run ID");
      setLoading(false);
      return;
    }

    const fetchRun = async () => {
      try {
        const data = await payrollRunService.getPayrollPreview(runId);
        setPreview(data);
        setRun(data.run);
        setEditForm({
          entity: data.run.entity,
          employees: data.run.employees,
          exceptions: data.run.exceptions,
          totalnetpay: data.run.totalnetpay,
        });
      } catch (err) {
        console.error(err);
        const message =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
          (err as Error)?.message ||
          "Unable to load payroll run (network or server error).";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchRun();
  }, [runId]);

  const isValidObjectId = (id: string) => /^[a-fA-F0-9]{24}$/.test(id?.trim() ?? "");

  const refreshPreview = useCallback(async () => {
    if (!run) return;
    const refreshed = await payrollRunService.getPayrollPreview(run._id ?? run.runId);
    setPreview(refreshed);
    setRun(refreshed.run);
  }, [run]);

  const irregularities = useMemo(
    () => {
      if (preview?.irregularities?.length) {
        return preview.irregularities.map((item): Irregularity => {
          const severity: IrregularitySeverity =
            item.bankStatus === "missing" || (item.netPay ?? 0) < 0 ? "high" : "medium";

          return {
            id: typeof item.employeeId === "string" ? item.employeeId : item.employeeId?._id ?? "",
            label: item.issue,
            detail:
              `${item.employee?.firstName ?? ""} ${item.employee?.lastName ?? ""}`.trim() ||
              item.employee?.employeeNumber ||
              item.employee?.workEmail ||
              "Employee",
            severity,
          };
        });
      }
      return run ? evaluateIrregularities(run) : [];
    },
    [preview?.irregularities, run]
  );

  const severity = getHighestSeverity(irregularities);

  const previewLines = useMemo(() => {
    if (!run) return [];

    const totals = preview?.totals;
    const totalNet = totals ? totals.totalNetPay : run.totalnetpay;
    const tax = totals ? totals.totalDeductions : Math.round(run.totalnetpay * 0.18);
    const gross = totals ? totals.totalNetPay + (totals.totalDeductions ?? 0) : run.totalnetpay + tax;
    const adjustments = totals ? totals.totalAllowances : run.exceptions * 4500;

    return [
      { label: "Gross earnings", amount: gross },
      { label: "Taxes & withholdings", amount: -tax },
      { label: "Adjustments / corrections", amount: -adjustments },
      {
        label: "Projected net pay",
        amount: totalNet,
        highlight: true,
      },
    ];
  }, [preview?.totals, run]);

  const handleApprove = async () => {
    if (!run) return;
    try {
      await payrollRunService.approveInitiation(run._id ?? run.runId, run.payrollSpecialistId);
      await refreshPreview();
    } catch (err) {
      console.error(err);
      setError("Unable to approve initiation");
    } finally {
      setModal(null);
      setNote("");
    }
  };

  const handleSaveEdit = async () => {
    if (!run) return;
    try {
      const updated = await payrollRunService.editInitiation(
        run._id ?? run.runId,
        run.payrollSpecialistId,
        editForm,
      );
      const refreshed = await payrollRunService.getPayrollPreview(updated._id ?? updated.runId);
      setPreview(refreshed);
      setRun(refreshed.run);
    } catch (err) {
      console.error(err);
      setError("Unable to save edits");
    } finally {
      setModal(null);
    }
  };

  const handleSendForApproval = async () => {
    if (!run) return;
    setActionMessage(null);
    if (!isValidObjectId(workflow.managerId) || !isValidObjectId(workflow.financeId)) {
      setActionMessage("Enter valid manager and finance ObjectIds.");
      return;
    }
    try {
      await payrollRunService.sendForApproval(run._id ?? run.runId, workflow.managerId, workflow.financeId);
      await refreshPreview();
      setActionMessage("Sent for approval.");
    } catch (err) {
      console.error(err);
      setActionMessage("Failed to send for approval.");
    }
  };

  const handleManagerApprove = async () => {
    if (!run) return;
    setActionMessage(null);
    if (!isValidObjectId(workflow.managerId)) {
      setActionMessage("Enter a valid manager ObjectId.");
      return;
    }
    try {
      await payrollRunService.approveByManager(run._id ?? run.runId, workflow.managerId);
      await refreshPreview();
      setActionMessage("Manager approval recorded.");
    } catch (err) {
      console.error(err);
      setActionMessage("Manager approval failed.");
    }
  };

  const handleFinanceApprove = async () => {
    if (!run) return;
    setActionMessage(null);
    if (!isValidObjectId(workflow.financeId)) {
      setActionMessage("Enter a valid finance ObjectId.");
      return;
    }
    try {
      await payrollRunService.approveByFinance(run._id ?? run.runId, workflow.financeId);
      await refreshPreview();
      setActionMessage("Finance approval recorded; payslips generated.");
    } catch (err) {
      console.error(err);
      setActionMessage("Finance approval failed.");
    }
  };

  const handleLock = async () => {
    if (!run) return;
    setActionMessage(null);
    if (!isValidObjectId(workflow.managerId)) {
      setActionMessage("Enter a valid manager ObjectId.");
      return;
    }
    try {
      await payrollRunService.lockRun(run._id ?? run.runId, workflow.managerId);
      await refreshPreview();
      setActionMessage("Run locked.");
    } catch (err) {
      console.error(err);
      setActionMessage("Lock failed.");
    }
  };

  const handleUnlock = async () => {
    if (!run) return;
    setActionMessage(null);
    if (!isValidObjectId(workflow.managerId) || !workflow.unlockReason.trim()) {
      setActionMessage("Enter a valid manager ObjectId and unlock reason.");
      return;
    }
    try {
      await payrollRunService.unlockRun(run._id ?? run.runId, workflow.managerId, workflow.unlockReason);
      await refreshPreview();
      setActionMessage("Run unlocked.");
    } catch (err) {
      console.error(err);
      setActionMessage("Unlock failed.");
    }
  };

  const handleResolveIrregularities = async () => {
    if (!run || !preview) return;
    setActionMessage(null);
    if (!isValidObjectId(workflow.managerId)) {
      setActionMessage("Enter a valid manager ObjectId.");
      return;
    }
    const resolvedDetails =
      preview.irregularities?.map((ir) => ({
        employeeId:
          typeof ir.employeeId === "string"
            ? ir.employeeId
            : (ir.employeeId && typeof ir.employeeId === "object" && "_id" in ir.employeeId
                ? (ir.employeeId as { _id: string })._id
                : ""),
        resolutionNote: workflow.resolveNote || "",
      })) ?? [];
    try {
      await payrollRunService.resolveIrregularities(run._id ?? run.runId, workflow.managerId, resolvedDetails);
      await refreshPreview();
      setActionMessage("Irregularities resolved.");
    } catch (err) {
      console.error(err);
      setActionMessage("Failed to resolve irregularities.");
    }
  };

  if (loading) {
    return <div className="page-shell text-slate-200">Loading preview…</div>;
  }

  if (error) {
    return <div className="page-shell text-amber-200">{error}</div>;
  }

  if (!run) {
    return <div className="page-shell text-slate-200">No payroll run found.</div>;
  }

  return (
    <div className="page-shell space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => router.push("/payroll-execution")}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/10"
        >
          ← Back to runs
        </button>

        <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100">
          Preview dashboard
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
              {run.entity}
            </div>
            <h1 className="mt-1 text-3xl font-bold text-slate-50">
              Payroll run {run.runId}
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Auto-generated draft preview. Review headcount, totals, and flagged
              irregularities before initiation.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <StatusBadge value={run.status} />
            <StatusBadge value={run.paymentStatus} size="sm" />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <PreviewStat
            label="Payroll period"
            value={new Date(run.payrollPeriod).toLocaleDateString()}
          />
          <PreviewStat label="Employees" value={run.employees} />
          <PreviewStat
            label="Projected net pay"
            value={<Money amount={preview?.totals?.totalNetPay ?? run.totalnetpay} />}
          />
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/payroll-execution/payslips/${encodeURIComponent(run._id ?? run.runId)}`}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/10"
          >
            View payslips
          </Link>
        </div>
      </div>

      {/* Preview & Irregularities */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-50">
            Preview payroll results
          </h2>

          <div className="mt-4 space-y-3">
            {previewLines.map((line) => (
              <div
                key={line.label}
                className={`flex justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 ${
                  line.highlight ? "ring-1 ring-cyan-400/30" : ""
                }`}
              >
                <div className="text-sm text-slate-200">{line.label}</div>
                <Money amount={line.amount} showSign />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-lg font-semibold text-slate-50">
            Irregularities flagged
          </h2>

          <ExceptionBadge count={irregularities.length} severity={severity} />

          <div className="mt-3 space-y-3">
            {irregularities.length === 0 && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-50">
                No irregularities detected.
              </div>
            )}

            {irregularities.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="text-sm font-semibold text-slate-100">
                  {item.label}
                </div>
                <div className="text-xs text-slate-300">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Initiation & workflow actions */}
      <div className="glass-card p-5 space-y-3">
        {run.status === "draft" && (
          <div className="flex gap-2">
            <button
              onClick={() => setModal("approve")}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400"
            >
              Review & approve
            </button>

            <button
              onClick={() => setModal("edit")}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/10"
            >
              Edit initiation
            </button>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Manager ID (ObjectId)"
            value={workflow.managerId}
            onChange={(e) => setWorkflow((p) => ({ ...p, managerId: e.target.value }))}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-slate-50"
          />
          <input
            placeholder="Finance ID (ObjectId)"
            value={workflow.financeId}
            onChange={(e) => setWorkflow((p) => ({ ...p, financeId: e.target.value }))}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-slate-50"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSendForApproval}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/10"
          >
            Send for approval
          </button>
          <button
            onClick={handleManagerApprove}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/10"
          >
            Manager approves
          </button>
          <button
            onClick={handleFinanceApprove}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400"
          >
            Finance approves
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Unlock reason"
            value={workflow.unlockReason}
            onChange={(e) => setWorkflow((p) => ({ ...p, unlockReason: e.target.value }))}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-slate-50"
          />
          <input
            placeholder="Resolution note"
            value={workflow.resolveNote}
            onChange={(e) => setWorkflow((p) => ({ ...p, resolveNote: e.target.value }))}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-slate-50"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleLock}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-indigo-400"
            disabled={run.status !== "approved"}
          >
            Lock payroll
          </button>
          <button
            onClick={handleUnlock}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/10"
            disabled={run.status !== "locked"}
          >
            Unlock
          </button>
          <button
            onClick={handleResolveIrregularities}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/10"
            disabled={irregularities.length === 0}
          >
            Resolve irregularities
          </button>
        </div>

        {actionMessage && <div className="text-sm text-slate-200">{actionMessage}</div>}
      </div>

      {/* Modals */}
      <ConfirmDialog
        open={modal === "approve"}
        title="Approve initiation"
        description="Approve initiation after reviewing preview results."
        confirmLabel="Approve"
        onConfirm={handleApprove}
        onClose={() => setModal(null)}
      >
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Approval note for audit trail"
          className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-50"
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={modal === "edit"}
        title="Manual edit of initiation"
        description="Adjust initiation details before approving payout."
        confirmLabel="Save edit"
        onConfirm={handleSaveEdit}
        onClose={() => setModal(null)}
      >
        <div className="grid gap-3">
          <label className="text-sm text-slate-200">
            Entity
            <input
              value={editForm.entity ?? ""}
              onChange={(e) => setEditForm((prev) => ({ ...prev, entity: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-slate-50"
            />
          </label>
          <label className="text-sm text-slate-200">
            Employees
            <input
              type="number"
              value={editForm.employees ?? ""}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, employees: Number(e.target.value) || 0 }))
              }
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-slate-50"
            />
          </label>
          <label className="text-sm text-slate-200">
            Exceptions
            <input
              type="number"
              value={editForm.exceptions ?? ""}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, exceptions: Number(e.target.value) || 0 }))
              }
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-slate-50"
            />
          </label>
          <label className="text-sm text-slate-200">
            Total net pay
            <input
              type="number"
              value={editForm.totalnetpay ?? ""}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, totalnetpay: Number(e.target.value) || 0 }))
              }
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-slate-50"
            />
          </label>
        </div>
      </ConfirmDialog>
    </div>
  );
};

export default PayrollRunPage;

interface PreviewStatProps {
  label: string;
  value: React.ReactNode;
}

function PreviewStat({ label, value }: PreviewStatProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-slate-50">{value}</div>
    </div>
  );
}
