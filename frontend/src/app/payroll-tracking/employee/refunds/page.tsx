"use client";

import { useCallback, useEffect, useState } from "react";
import { PayrollTrackingRefundsService } from "@/services/api/payroll-tracking-refunds.service";
import { Refund } from "@/types/payroll-tracking-refund.types";
import { useAuth } from "@/hooks/useAuth";

export default function EmployeeRefundsPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const [refunds, setRefunds] = useState<Refund[]>([]);

  const loadRefunds = useCallback(async () => {
    if (!userId) return;
    try {
      const res =
        await PayrollTrackingRefundsService.getEmployeeRefunds(userId);
      setRefunds(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRefunds();
  }, [loadRefunds]);

  if (!userId) return null;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-bold mb-4">My Refunds</h1>

      <ul className="space-y-3">
        {refunds.map((r) => (
          <li key={r._id} className="border p-3 rounded">
            <p>{r.refundDetails.description}</p>
            <p>Amount: {r.refundDetails.amount}</p>
            <p className="text-sm text-gray-600">
              Status: {r.status}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}