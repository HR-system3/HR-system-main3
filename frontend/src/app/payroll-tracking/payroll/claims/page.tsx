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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Payroll – Claims Review</h1>
        <p className="text-sm text-neutral-500">Review and process employee claims</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Claim ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-neutral-500">
                  <p className="text-sm">No claims found</p>
                </td>
              </tr>
            ) : (
              claims.map((claim, index) => (
                <tr 
                  key={claim._id} 
                  className={`border-b border-neutral-200 transition-colors hover:bg-blue-50/40 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/60'
                  }`}
                >
                  <td className="px-4 py-3 text-neutral-900">{claim.claimId}</td>
                  <td className="px-4 py-3 text-neutral-900">{claim.claimType}</td>
                  <td className="px-4 py-3 text-neutral-900">${claim.amount?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                      claim.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <input
                        type="number"
                        placeholder="Approved amount"
                        className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => setApprovedAmount(Number(e.target.value))}
                      />
                      <input
                        type="text"
                        placeholder="Comment"
                        className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => setResolutionComment(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveClaim(claim._id)}
                          className="bg-green-600 text-white hover:bg-green-700 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectClaim(claim._id)}
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
