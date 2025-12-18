"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

type TaxRuleStatus = "DRAFT" | "APPROVED" | "REJECTED";

type TaxRule = {
  _id: string;
  name: string;
  description?: string;
  rate: number;
  status: TaxRuleStatus;
};

export default function TaxesPage() {
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<TaxRuleStatus | null>(null);

  const fetchTaxRules = async () => {
    try {
      const res = await api.get("/payroll-configuration/tax-rule");
      setTaxRules(res.data);
    } catch (err) {
      console.error("Failed to load tax rules", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxRules();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setRate(0);
    setEditingId(null);
    setEditingStatus(null);
  };

  const submit = async () => {
    if (!name || rate < 0 || rate > 100) {
      alert("Invalid data. Rate must be between 0 and 100.");
      return;
    }

    const payload: any = { name, rate };
    if (description) payload.description = description;

    try {
      if (editingId) {
        await api.put(`/payroll-configuration/tax-rule/${editingId}`, payload);
      } else {
        await api.post("/payroll-configuration/tax-rule", payload);
      }

      resetForm();
      fetchTaxRules();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save tax rule");
    }
  };

  const startEdit = (tr: TaxRule) => {
    if (tr.status === "APPROVED") {
      alert("Approved tax rules cannot be edited.");
      return;
    }

    setEditingId(tr._id);
    setEditingStatus(tr.status);
    setName(tr.name);
    setDescription(tr.description || "");
    setRate(tr.rate);
  };

  const deactivate = async (id: string) => {
    if (!confirm("Deactivate this tax rule?")) return;

    try {
      await api.delete(`/payroll-configuration/tax-rule/${id}`);
      fetchTaxRules();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to deactivate");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tax Rules</h1>

      {/* Form */}
      <div className="border p-4 rounded mb-6">
        <h2 className="font-semibold mb-2">
          {editingId ? "Edit Tax Rule" : "Create Tax Rule"}
        </h2>

        <input
          className="border p-1 w-full mb-2"
          placeholder="Tax Rule Name (e.g., Income Tax)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="border p-1 w-full mb-2"
          placeholder="Description (optional)"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="number"
          className="border p-1 w-full mb-2"
          placeholder="Tax Rate (%)"
          min={0}
          max={100}
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
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

      {/* Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Rate (%)</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {taxRules.map((tr) => (
            <tr key={tr._id}>
              <td className="border p-2">{tr.name}</td>
              <td className="border p-2">{tr.description || "-"}</td>
              <td className="border p-2">{tr.rate}%</td>
              <td className="border p-2">{tr.status}</td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => startEdit(tr)}
                  className="text-blue-600 mr-2 underline"
                  disabled={tr.status === "APPROVED"}
                >
                  Edit
                </button>
                <button
                  onClick={() => deactivate(tr._id)}
                  className="text-red-600 underline"
                  disabled={tr.status === "APPROVED"}
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
