"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

type InsuranceStatus = "DRAFT" | "APPROVED" | "REJECTED";

type InsuranceBracket = {
  _id: string;
  name: string;
  amount: number;
  minSalary: number;
  maxSalary: number;
  employeeRate: number;
  employerRate: number;
  status: InsuranceStatus;
};

export default function InsurancePage() {
  const [brackets, setBrackets] = useState<InsuranceBracket[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [minSalary, setMinSalary] = useState(0);
  const [maxSalary, setMaxSalary] = useState(0);
  const [employeeRate, setEmployeeRate] = useState(0);
  const [employerRate, setEmployerRate] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchBrackets = async () => {
    try {
      const res = await api.get("/payroll-configuration/insurance-bracket");
      setBrackets(res.data);
    } catch (err) {
      console.error("Failed to load insurance brackets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrackets();
  }, []);

  const submit = async () => {
    if (!name || amount < 0 || minSalary < 0 || maxSalary < 0 || maxSalary < minSalary) {
      alert("Invalid data. Max salary must be >= min salary.");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/payroll-configuration/insurance-bracket/${editingId}`, {
          name,
          amount,
          minSalary,
          maxSalary,
          employeeRate,
          employerRate,
        });
      } else {
        await api.post("/payroll-configuration/insurance-bracket", {
          name,
          amount,
          minSalary,
          maxSalary,
          employeeRate,
          employerRate,
        });
      }

      resetForm();
      fetchBrackets();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save insurance bracket");
    }
  };

  const resetForm = () => {
    setName("");
    setAmount(0);
    setMinSalary(0);
    setMaxSalary(0);
    setEmployeeRate(0);
    setEmployerRate(0);
    setEditingId(null);
  };

  const startEdit = (b: InsuranceBracket) => {
    if (b.status === "APPROVED") {
      alert("Approved insurance brackets cannot be edited.");
      return;
    }
    setEditingId(b._id);
    setName(b.name);
    setAmount(b.amount);
    setMinSalary(b.minSalary);
    setMaxSalary(b.maxSalary);
    setEmployeeRate(b.employeeRate);
    setEmployerRate(b.employerRate);
  };

  const deactivate = async (id: string) => {
    if (!confirm("Deactivate this insurance bracket?")) return;
    try {
      await api.delete(`/payroll-configuration/insurance-bracket/${id}`);
      fetchBrackets();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to deactivate");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Insurance Brackets</h1>

      <div className="border p-4 rounded mb-6">
        <h2 className="font-semibold mb-2">
          {editingId ? "Edit Insurance Bracket" : "Create Insurance Bracket"}
        </h2>

        <input
          className="border p-1 w-full mb-2"
          placeholder="Name (e.g., Social Insurance, Health Insurance)"
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

        <input
          type="number"
          className="border p-1 w-full mb-2"
          placeholder="Min Salary"
          value={minSalary}
          onChange={(e) => setMinSalary(Number(e.target.value))}
        />

        <input
          type="number"
          className="border p-1 w-full mb-2"
          placeholder="Max Salary"
          value={maxSalary}
          onChange={(e) => setMaxSalary(Number(e.target.value))}
        />

        <input
          type="number"
          className="border p-1 w-full mb-2"
          placeholder="Employee Rate (%)"
          min="0"
          max="100"
          value={employeeRate}
          onChange={(e) => setEmployeeRate(Number(e.target.value))}
        />

        <input
          type="number"
          className="border p-1 w-full mb-2"
          placeholder="Employer Rate (%)"
          min="0"
          max="100"
          value={employerRate}
          onChange={(e) => setEmployerRate(Number(e.target.value))}
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
            <th className="border p-2">Salary Range</th>
            <th className="border p-2">Employee Rate</th>
            <th className="border p-2">Employer Rate</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {brackets.map((b) => (
            <tr key={b._id}>
              <td className="border p-2">{b.name}</td>
              <td className="border p-2">{b.amount.toLocaleString()}</td>
              <td className="border p-2">
                {b.minSalary.toLocaleString()} - {b.maxSalary.toLocaleString()}
              </td>
              <td className="border p-2">{b.employeeRate}%</td>
              <td className="border p-2">{b.employerRate}%</td>
              <td className="border p-2">{b.status}</td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => startEdit(b)}
                  className="text-blue-600 mr-2 underline"
                  disabled={b.status === "APPROVED"}
                >
                  Edit
                </button>
                <button
                  onClick={() => deactivate(b._id)}
                  className="text-red-600 underline"
                  disabled={b.status === "APPROVED"}
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

