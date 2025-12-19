"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { payslipService } from "@/services/api/payslip.service";
import { Payslip } from "@/types/payroll-run.types";

export default function PayslipListPage() {
  const params = useParams();
  const router = useRouter();

  const runId =
    typeof params.runid === "string"
      ? params.runid
      : params.runid?.[0];

  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayslips = async () => {
      if (!runId) {
        setError("Invalid run id");
        setLoading(false);
        return;
      }
      try {
        const data = await payslipService.getPayslipsByRun(runId);
        setPayslips(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load payslips. Confirm the run is approved/paid.");
      } finally {
        setLoading(false);
      }
    };
    fetchPayslips();
  }, [runId]);

  const canDownload = useMemo(() => payslips.length > 0, [payslips]);

  const downloadPayslip = (p: Payslip) => {
    const blob = new Blob([JSON.stringify(p, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${p.employeeId && typeof p.employeeId !== "string" ? p.employeeId.employeeNumber || p.employeeId._id : "payslip"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-shell space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => router.push("/payroll-execution")}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/10"
        >
          ← Back to runs
        </button>
        <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100">
          Payslips
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Run</div>
            <div className="text-xl font-semibold text-slate-50">{runId}</div>
          </div>
          <div className="text-sm text-slate-300">
            {canDownload ? `${payslips.length} payslips ready` : "No payslips generated yet"}
          </div>
        </div>

        {loading && <div className="mt-4 text-slate-200">Loading payslips…</div>}
        {error && <div className="mt-4 text-rose-300">{error}</div>}

        {!loading && !error && payslips.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border border-white/10">
              <thead className="bg-white/5 text-left text-sm text-slate-300">
                <tr>
                  <th className="px-3 py-2">Employee</th>
                  <th className="px-3 py-2">Net Pay</th>
                  <th className="px-3 py-2">Gross</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Download</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-100">
                {payslips.map((p) => {
                  const emp =
                    typeof p.employeeId === "string"
                      ? p.employeeId
                      : `${p.employeeId.firstName ?? ""} ${p.employeeId.lastName ?? ""}`.trim() ||
                        p.employeeId.employeeNumber ||
                        p.employeeId._id;
                  return (
                    <tr key={p._id} className="border-t border-white/5">
                      <td className="px-3 py-2">{emp}</td>
                      <td className="px-3 py-2">{p.netPay}</td>
                      <td className="px-3 py-2">{p.totalGrossSalary}</td>
                      <td className="px-3 py-2">{p.paymentStatus}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => downloadPayslip(p)}
                          className="rounded bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-cyan-400"
                        >
                          Download JSON
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
