"use client";

import { useCallback, useEffect, useState } from "react";
import { PayrollTrackingClaimsService } from "@/services/api/payroll-tracking-claims.service";
import { Claim } from "@/types/payroll-tracking-claim.types";

const FINANCE_STAFF_ID = "mock-finance-id";

export default function PayrollClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [approvedAmount, setApprovedAmount] = useState<number>(0);
  const [resolutionComment, setResolutionComment] = useState("");

  const loadClaims = useCallback(async () => {
    try {
      const res = await PayrollTrackingClaimsService.getAllClaims();
      // Handle both { data: [...] } and direct array responses
      setClaims(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load claims", err);
      setClaims([]); // Set empty array on error
    }
  }, []);

  const approveClaim = async (claimId: string) => {
    try {
      await PayrollTrackingClaimsService.approveClaim(claimId, {
        financeStaffId: FINANCE_STAFF_ID,
        approvedAmount,
        resolutionComment,
      });
      loadClaims();
    } catch (err) {
      console.error("Approve failed", err);
    }
  };

  const rejectClaim = async (claimId: string) => {
    try {
      await PayrollTrackingClaimsService.rejectClaim(claimId, {
        financeStaffId: FINANCE_STAFF_ID,
        rejectionReason: "Rejected by payroll",
        resolutionComment,
      });
      loadClaims();
    } catch (err) {
      console.error("Reject failed", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadClaims();
  }, [loadClaims]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Payroll – Claims Review</h1>

      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th className="p-2">Claim ID</th>
            <th className="p-2">Type</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => (
            <tr key={claim._id} className="border-b">
              <td className="p-2">{claim.claimId}</td>
              <td className="p-2">{claim.claimType}</td>
              <td className="p-2">{claim.amount}</td>
              <td className="p-2">{claim.status}</td>
              <td className="p-2 space-y-2">
                <input
                  type="number"
                  placeholder="Approved amount"
                  className="border p-1 w-full"
                  onChange={(e) =>
                    setApprovedAmount(Number(e.target.value))
                  }
                />
                <input
                  type="text"
                  placeholder="Comment"
                  className="border p-1 w-full"
                  onChange={(e) =>
                    setResolutionComment(e.target.value)
                  }
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => approveClaim(claim._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectClaim(claim._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
