"use client";

import { useCallback, useEffect, useState } from "react";
import { PayrollTrackingClaimsService } from "@/services/api/payroll-tracking-claims.service";
import { Claim } from "@/types/payroll-tracking-claim.types";
import { useAuth } from "@/hooks/useAuth";

export default function EmployeeClaimsPage() {
  const { user } = useAuth();
  const userId = user?.id;

  const [claims, setClaims] = useState<Claim[]>([]);
  const [claimType, setClaimType] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);

  const loadClaims = useCallback(async () => {
    if (!userId) return;
    try {
      const res =
        await PayrollTrackingClaimsService.getEmployeeClaims(userId);
      setClaims(res.data);
    } catch (err) {
      console.error("Failed to load claims", err);
    }
  }, [userId]);

  const submitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      await PayrollTrackingClaimsService.createClaim({
        employeeId: userId as string,
        claimType,
        description,
        amount,
      });

      setClaimType("");
      setDescription("");
      setAmount(0);
      setMessage("✅ Claim submitted successfully");

      loadClaims();
    } catch (err) {
      console.error("Failed to submit claim", err);
      setMessage("❌ Failed to submit claim");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadClaims();
  }, [loadClaims]);

  if (!userId) return null;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-bold mb-4">My Claims</h1>

      {/* Feedback message */}
      {message && (
        <p className="mb-4 text-sm font-medium">
          {message}
        </p>
      )}

      {/* Submit Claim */}
      <form onSubmit={submitClaim} className="space-y-3 mb-6">
        <input
          className="border p-2 w-full"
          placeholder="Claim Type"
          value={claimType}
          onChange={(e) =>
            setClaimType((e.target as HTMLInputElement).value)
          }
          required
        />

        <input
          className="border p-2 w-full"
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription((e.target as HTMLInputElement).value)
          }
          required
        />

        <input
          type="number"
          className="border p-2 w-full"
          placeholder="Amount"
          value={amount}
          onChange={(e) =>
            setAmount(Number((e.target as HTMLInputElement).value))
          }
          required
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit Claim
        </button>
      </form>

      {/* Claims List */}
      <ul className="space-y-3">
        {claims.map((claim) => (
          <li key={claim._id} className="border p-3 rounded">
            <p className="font-semibold">{claim.claimType}</p>
            <p>{claim.description}</p>
            <p className="text-sm text-gray-600">
              Amount: {claim.amount}
            </p>
            <p className="text-sm text-gray-500">
              Status: {claim.status}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
