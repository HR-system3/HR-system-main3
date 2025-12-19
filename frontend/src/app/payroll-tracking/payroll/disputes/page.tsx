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
      <h1 className="text-xl font-bold mb-4">Payroll – Disputes</h1>

      {disputes.map((d) => (
        <div key={d._id} className="border p-4 mb-3">
          <p>{d.description}</p>
          <p>Status: {d.status}</p>

          <input
            className="border p-1 w-full my-2"
            placeholder="Comment"
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              onClick={() => approve(d._id)}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Approve
            </button>
            <button
              onClick={() => reject(d._id)}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
