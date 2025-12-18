"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

type TerminationBenefitStatus = "DRAFT" | "APPROVED" | "REJECTED";

type TerminationBenefit = {
  _id: string;
  name: string;
  amount: number;
  terms?: string;
  status: TerminationBenefitStatus;
};

export default function TerminationBenefitsPage() {
  const [benefits, setBenefits] = useState<TerminationBenefit[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [terms, setTerms] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchBenefits = async () => {
    try {
      const res = await api.get("/payroll-configuration/termination-benefit");
      setBenefits(res.data);
    } catch (err) {
      console.error("Failed to load termination benefits", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenefits();
  }, []);

  const submit = async () => {
    if (!name || amount < 0) {
      alert("Invalid data");
      return;
    }

    const payload: any = { name, amount };
    if (terms) payload.terms = terms;

    try {
      if (editingId) {
        await api.put(`/payroll-configuration/termination-benefit/${editingId}`, payload);
      } else {
        await api.post("/payroll-configuration/termination-benefit", payload);
      }

      resetForm();
      fetchBenefits();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save termination benefit");
    }
  };

  const resetForm = () => {
    setName("");
    setAmount(0);
    setTerms("");
    setEditingId(null);
  };

  const startEdit = (tb: TerminationBenefit) => {
    if (tb.status === "APPROVED") {
      alert("Approved termination benefits cannot be edited.");
      return;
    }
    setEditingId(tb._id);
    setName(tb.name);
    setAmount(tb.amount);
    setTerms(tb.terms || "");
  };

  const deactivate = async (id: string) => {
    if (!confirm("Deactivate this termination benefit?")) return;
    try {
      await api.put(`/payroll-configuration/termination-benefit/${id}`, {
        status: "REJECTED",
      });
      fetchBenefits();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to deactivate");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Termination & Resignation Benefits</h1>

      <div className="border p-4 rounded mb-6">
        <h2 className="font-semibold mb-2">
          {editingId ? "Edit Termination Benefit" : "Create Termination Benefit"}
        </h2>

        <input
          className="border p-1 w-full mb-2"
          placeholder="Name (e.g., End of Service Gratuity, Severance Pay)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          className="border p-1 w-full mb-2"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        <textarea
          className="border p-1 w-full mb-2"
          placeholder="Terms (optional)"
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          rows={3}
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
            <th className="border p-2">Name</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Terms</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {benefits.map((tb) => (
            <tr key={tb._id}>
              <td className="border p-2">{tb.name}</td>
              <td className="border p-2">{tb.amount.toLocaleString()}</td>
              <td className="border p-2">{tb.terms || "-"}</td>
              <td className="border p-2">{tb.status}</td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => startEdit(tb)}
                  className="text-blue-600 mr-2 underline"
                  disabled={tb.status === "APPROVED"}
                >
                  Edit
                </button>
                <button
                  onClick={() => deactivate(tb._id)}
                  className="text-red-600 underline"
                  disabled={tb.status === "APPROVED"}
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

