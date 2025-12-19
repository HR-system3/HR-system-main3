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
      <h1 className="text-xl font-bold mb-4">Payroll – Refunds</h1>

      <div className="border p-4 mb-6">
        <h2 className="font-semibold mb-2">Create Refund</h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="number"
          className="border p-2 w-full mb-2"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        <button
          onClick={createRefund}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Refund
        </button>
      </div>

      {refunds.map((r) => (
        <div key={r._id} className="border p-4 mb-3">
          <p>{r.refundDetails.description}</p>
          <p>Amount: {r.refundDetails.amount}</p>
          <p>Status: {r.status}</p>

          {r.status === "pending" && (
            <button
              onClick={() => markPaid(r._id)}
              className="bg-green-600 text-white px-3 py-1 rounded mt-2"
            >
              Mark as Paid
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
