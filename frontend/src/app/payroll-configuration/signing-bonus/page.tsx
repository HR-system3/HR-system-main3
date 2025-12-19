"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

type SigningBonusStatus = "DRAFT" | "APPROVED" | "REJECTED";

type SigningBonus = {
  _id: string;
  positionName: string;
  amount: number;
  status: SigningBonusStatus;
};

export default function SigningBonusPage() {
  const [bonuses, setBonuses] = useState<SigningBonus[]>([]);
  const [loading, setLoading] = useState(true);

  const [positionName, setPositionName] = useState("");
  const [amount, setAmount] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchBonuses = async () => {
    try {
      const res = await api.get("/payroll-configuration/signing-bonus");
      setBonuses(res.data);
    } catch (err) {
      console.error("Failed to load signing bonuses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonuses();
  }, []);

  const submit = async () => {
    if (!positionName || amount < 0) {
      alert("Invalid data");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/payroll-configuration/signing-bonus/${editingId}`, {
          positionName,
          amount,
        });
      } else {
        await api.post("/payroll-configuration/signing-bonus", {
          positionName,
          amount,
        });
      }

      resetForm();
      fetchBonuses();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save signing bonus");
    }
  };

  const resetForm = () => {
    setPositionName("");
    setAmount(0);
    setEditingId(null);
  };

  const startEdit = (sb: SigningBonus) => {
    if (sb.status === "APPROVED") {
      alert("Approved signing bonuses cannot be edited.");
      return;
    }
    setEditingId(sb._id);
    setPositionName(sb.positionName);
    setAmount(sb.amount);
  };

  const deactivate = async (id: string) => {
    if (!confirm("Deactivate this signing bonus?")) return;
    try {
      await api.delete(`/payroll-configuration/signing-bonus/${id}`);
      fetchBonuses();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to deactivate");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Signing Bonuses</h1>

      <div className="border p-4 rounded mb-6">
        <h2 className="font-semibold mb-2">
          {editingId ? "Edit Signing Bonus" : "Create Signing Bonus"}
        </h2>

        <input
          className="border p-1 w-full mb-2"
          placeholder="Position Name (e.g., Junior TA, Mid TA, Senior TA)"
          value={positionName}
          onChange={(e) => setPositionName(e.target.value)}
        />

        <input
          type="number"
          className="border p-1 w-full mb-2"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        <button
          onClick={submit}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          {editingId ? "Update" : "Create"}
        </button>

        {editingId && (
          <button
            onClick={resetForm}
            className="ml-2 bg-gray-400 text-white px-4 py-1 rounded"
          >
            Cancel
          </button>
        )}
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Position Name</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bonuses.map((sb) => (
            <tr key={sb._id}>
              <td className="border p-2">{sb.positionName}</td>
              <td className="border p-2">{sb.amount.toLocaleString()}</td>
              <td className="border p-2">{sb.status}</td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => startEdit(sb)}
                  className="text-blue-600 mr-2 underline"
                  disabled={sb.status === "APPROVED"}
                >
                  Edit
                </button>
                <button
                  onClick={() => deactivate(sb._id)}
                  className="text-red-600 underline"
                  disabled={sb.status === "APPROVED"}
                >
                  Deactivate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

