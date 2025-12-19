import {
  PayRollPaymentStatus,
  PayRollStatus,
  PayrollRun,
} from "../types/payroll-run.types";

export type IrregularitySeverity = "high" | "medium" | "low";

export interface Irregularity {
  id: string;
  label: string;
  detail: string;
  severity: IrregularitySeverity;
}

// Lightweight rule set to surface likely issues while previewing runs.
export function evaluateIrregularities(run: PayrollRun): Irregularity[] {
  const irregularities: Irregularity[] = [];

  if (run.exceptions > 0) {
    irregularities.push({
      id: `${run.runId}-exceptions`,
      label: `${run.exceptions} unresolved exception${run.exceptions > 1 ? "s" : ""}`,
      detail: "Resolve exceptions before approving or initiating payment.",
      severity: run.exceptions > 2 ? "high" : "medium",
    });
  }

  if (run.totalnetpay < 0) {
    irregularities.push({
      id: `${run.runId}-negative-net`,
      label: "Negative net pay detected",
      detail: "Net pay is negative; verify deductions and corrections.",
      severity: "high",
    });
  }

  if (run.employees === 0) {
    irregularities.push({
      id: `${run.runId}-no-headcount`,
      label: "No employees attached",
      detail: "Run has zero employees; confirm this is intentional.",
      severity: "high",
    });
  }

  if (
    run.paymentStatus === PayRollPaymentStatus.PENDING &&
    run.status === PayRollStatus.APPROVED
  ) {
    irregularities.push({
      id: `${run.runId}-pending-payment`,
      label: "Payment still pending",
      detail: "Run is approved but not yet initiated for payout.",
      severity: "medium",
    });
  }

  const periodDate = new Date(run.payrollPeriod);
  if (!Number.isNaN(periodDate.getTime())) {
    const msInDay = 24 * 60 * 60 * 1000;
    const daysSincePeriod = Math.floor((Date.now() - periodDate.getTime()) / msInDay);

    if (daysSincePeriod > 40) {
      irregularities.push({
        id: `${run.runId}-stale-period`,
        label: "Period is stale",
        detail: "This draft is over a month old; re-run calculations before approval.",
        severity: "low",
      });
    }
  }

  return irregularities;
}

export function getHighestSeverity(
  irregularities: Irregularity[],
): IrregularitySeverity | null {
  if (!irregularities.length) return null;
  if (irregularities.some((item) => item.severity === "high")) return "high";
  if (irregularities.some((item) => item.severity === "medium")) return "medium";
  return "low";
}
