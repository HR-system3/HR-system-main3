"use client";

import { useCallback, useEffect, useState } from "react";
import { PayrollTrackingDisputesService } from "@/services/api/payroll-tracking-disputes.service";
import { Dispute } from "@/types/payroll-tracking-dispute.types";
import { useAuth } from "@/hooks/useAuth";

export default function EmployeeDisputesPage() {
  const { user } = useAuth();
  const userId = user?.id;

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [description, setDescription] = useState("");
  const [payslipId, setPayslipId] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const loadDisputes = useCallback(async () => {
    if (!userId) return;
    try {
      const res =
        await PayrollTrackingDisputesService.getEmployeeDisputes(userId);
      setDisputes(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  const submitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      await PayrollTrackingDisputesService.createDispute({
        employeeId: userId as string,
        payslipId,
        description,
      });

      setDescription("");
      setPayslipId("");
      setMessage("✅ Dispute submitted");
      loadDisputes();
    } catch {
      setMessage("❌ Failed to submit dispute");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDisputes();
  }, [loadDisputes]);

  if (!userId) return null;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-bold mb-4">My Payroll Disputes</h1>

      {message && <p className="mb-3">{message}</p>}

      <form onSubmit={submitDispute} className="space-y-3 mb-6">
        <input
          className="border p-2 w-full"
          placeholder="Payslip ID"
          value={payslipId}
          onChange={(e) => setPayslipId(e.target.value)}
          required
        />

        <input
          className="border p-2 w-full"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit Dispute
        </button>
      </form>

      <ul className="space-y-3">
        {disputes.map((d) => (
          <li key={d._id} className="border p-3 rounded">
            <p>{d.description}</p>
            <p className="text-sm text-gray-600">Status: {d.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
