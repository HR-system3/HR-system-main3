"use client";

import { useCallback, useEffect, useState } from "react";
import { PayrollTrackingDisputesService } from "@/services/api/payroll-tracking-disputes.service";
import { Dispute } from "@/types/payroll-tracking-dispute.types";

const FINANCE_STAFF_ID = "mock-finance-id";

export default function PayrollDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [comment, setComment] = useState("");

  const loadDisputes = useCallback(async () => {
    try {
      const res = await PayrollTrackingDisputesService.getAllDisputes();
      // Handle both { data: [...] } and direct array responses
      setDisputes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load disputes", err);
      setDisputes([]); // Set empty array on error
    }
  }, []);

  const approve = async (id: string) => {
    await PayrollTrackingDisputesService.approveDispute(id, {
      financeStaffId: FINANCE_STAFF_ID,
      resolutionComment: comment,
    });
    loadDisputes();
  };

  const reject = async (id: string) => {
    await PayrollTrackingDisputesService.rejectDispute(id, {
      financeStaffId: FINANCE_STAFF_ID,
      rejectionReason: "Rejected",
      resolutionComment: comment,
    });
    loadDisputes();
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDisputes();
  }, [loadDisputes]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Payroll – Disputes</h1>
        <p className="text-sm text-neutral-500">Review and resolve payroll disputes</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Description</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {disputes.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-12 text-neutral-500">
                  <p className="text-sm">No disputes found</p>
                </td>
              </tr>
            ) : (
              disputes.map((d, index) => (
                <tr 
                  key={d._id} 
                  className={`border-b border-neutral-200 transition-colors hover:bg-blue-50/40 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/60'
                  }`}
                >
                  <td className="px-4 py-3 text-neutral-900">{d.description}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      d.status === 'approved' ? 'bg-green-100 text-green-800' :
                      d.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <input
                        className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Comment"
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => approve(d._id)}
                          className="bg-green-600 text-white hover:bg-green-700 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => reject(d._id)}
                          className="bg-red-600 text-white hover:bg-red-700 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
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
