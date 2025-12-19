"use client";

import { useCallback, useEffect, useState } from "react";
import { PayrollTrackingRefundsService } from "@/services/api/payroll-tracking-refunds.service";
import { Refund } from "@/types/payroll-tracking-refund.types";

const FINANCE_STAFF_ID = "mock-finance-id";

export default function PayrollRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState("");

  const loadRefunds = useCallback(async () => {
    try {
      const res = await PayrollTrackingRefundsService.getAllRefunds();
      // Handle both { data: [...] } and direct array responses
      setRefunds(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load refunds", err);
      setRefunds([]); // Set empty array on error
    }
  }, []);

  const createRefund = async () => {
    try {
      await PayrollTrackingRefundsService.createRefund({
        employeeId: "mock-employee-id",
        financeStaffId: FINANCE_STAFF_ID,
        refundDetails: {
          description,
          amount,
        },
      });

      alert("Refund request submitted");
      setDescription("");
      setAmount(0);
      loadRefunds();
    } catch (err) {
      alert("Failed to create refund");
      console.error(err);
    }
  };

  const markPaid = async (id: string) => {
    await PayrollTrackingRefundsService.markRefundPaid(id, {
      financeStaffId: FINANCE_STAFF_ID,
      paidInPayrollRunId: "mock-run-id",
    });
    loadRefunds();
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRefunds();
  }, [loadRefunds]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Payroll – Refunds</h1>
        <p className="text-sm text-neutral-500">Manage employee refunds</p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Create Refund</h2>
        <div className="space-y-4">
          <input
            className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="number"
            className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <button
            onClick={createRefund}
            className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2 font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Create Refund
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Description</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {refunds.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-neutral-500">
                  <p className="text-sm">No refunds found</p>
                </td>
              </tr>
            ) : (
              refunds.map((r, index) => (
                <tr 
                  key={r._id} 
                  className={`border-b border-neutral-200 transition-colors hover:bg-blue-50/40 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/60'
                  }`}
                >
                  <td className="px-4 py-3 text-neutral-900">{r.refundDetails.description}</td>
                  <td className="px-4 py-3 text-neutral-900">${r.refundDetails.amount?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      r.status === 'paid' ? 'bg-green-100 text-green-800' :
                      r.status === 'pending' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "pending" && (
                      <button
                        onClick={() => markPaid(r._id)}
                        className="bg-green-600 text-white hover:bg-green-700 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
