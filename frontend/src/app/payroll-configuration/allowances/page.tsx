"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { Plus, Edit2, Trash2, Check, X, DollarSign, AlertCircle, Info, CheckCircle2, XCircle } from "lucide-react";

type AllowanceStatus = "DRAFT" | "APPROVED" | "REJECTED";

type Allowance = {
  _id: string;
  name: string;
  amount: number;
  status: AllowanceStatus;
  type: "FIXED" | "VARIABLE";
  taxable: boolean;
};

export default function AllowancesPage() {
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<"FIXED" | "VARIABLE">("FIXED");
  const [taxable, setTaxable] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<AllowanceStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchAllowances = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.get("/payroll-configuration/allowance");
      setAllowances(res.data || []);
    } catch (err: any) {
      console.error("Failed to load allowances", err);
      setError(err.response?.data?.message || err.message || "Failed to load allowances");
      setAllowances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllowances();
  }, []);

  const submit = async () => {
    if (!name.trim() || amount < 0) {
      alert("Please fill in all required fields correctly");
      return;
    }

    const payload = { name, amount, type, taxable };
    setIsSubmitting(true);

    try {
      if (editingId) {
        await api.put(`/payroll-configuration/allowance/${editingId}`, payload);
      } else {
        await api.post("/payroll-configuration/allowance", payload);
      }
      resetForm();
      fetchAllowances();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save allowance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setAmount(0);
    setType("FIXED");
    setTaxable(false);
    setEditingId(null);
    setEditingStatus(null);
    setShowForm(false);
  };

  const startEdit = (a: Allowance) => {
    if (a.status === "APPROVED") {
      alert("Approved allowances cannot be edited.");
      return;
    }
    setEditingId(a._id);
    setEditingStatus(a.status);
    setName(a.name);
    setAmount(a.amount);
    setType(a.type);
    setTaxable(a.taxable);
    setShowForm(true);
  };

  const deactivate = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this allowance?")) return;
    try {
      await api.put(`/payroll-configuration/allowance/${id}`, {
        status: "REJECTED",
      });
      fetchAllowances();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to deactivate allowance");
    }
  };

  const getStatusBadge = (status: AllowanceStatus) => {
    const styles = {
      APPROVED: "bg-green-100 text-green-800",
      DRAFT: "bg-yellow-100 text-yellow-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const stats = {
    total: allowances.length,
    approved: allowances.filter(a => a.status === "APPROVED").length,
    rejected: allowances.filter(a => a.status === "REJECTED").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading allowances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
            <DollarSign className="w-8 h-8 text-blue-600" />
            Allowances
          </h1>
          <p className="text-gray-600 mt-2 font-medium">Manage employee allowances and benefits</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Allowance
          </Button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-red-700 text-sm mt-1.5">{error}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchAllowances}>
            Retry
          </Button>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Allowances</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{stats.total}</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-2 tracking-tight">{stats.approved.toFixed(2)}</p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-2 tracking-tight">{stats.rejected}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Form Card */}
      {showForm && (
        <Card 
          title={editingId ? "Edit Allowance" : "Create New Allowance"}
          description={editingId ? "Update allowance details" : "Add a new allowance to the system"}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Allowance Name"
                  placeholder="e.g., Transportation, Housing, Medical"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  helperText="Enter a descriptive name for this allowance (e.g., Transportation Allowance, Housing Allowance)"
                />
              </div>

              <div>
                <Input
                  label="Amount"
                  type="number"
                  placeholder="0.00"
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  min="0"
                  step="0.01"
                  helperText="Enter the allowance amount. Use 0 if this is a variable allowance"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                  Allowance Type
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="FIXED">Fixed - Same amount every period</option>
                  <option value="VARIABLE">Variable - Amount may change</option>
                </select>
                <p className="mt-2 text-sm text-gray-500 flex items-start gap-2 font-medium">
                  <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>Fixed allowances have a constant amount. Variable allowances may differ based on conditions.</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 tracking-tight">
                  Tax Configuration
                </label>
                <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={taxable}
                    onChange={(e) => setTaxable(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-700 block">Taxable</span>
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">
                      Check if this allowance should be subject to tax deductions
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
              <Button 
                onClick={submit} 
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {editingId ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Update Allowance
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Allowance
                  </>
                )}
              </Button>
              <Button variant="secondary" onClick={resetForm}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Allowances Table */}
      <Card title={`All Allowances (${allowances.length})`}>
        {allowances.length === 0 ? (
          <div className="text-center py-16">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold text-lg">No allowances found</p>
            <p className="text-gray-500 text-sm mt-2">Create your first allowance to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-700">Taxable</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-4 px-5 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allowances.map((a) => (
                  <tr key={a._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-medium text-gray-900">{a.name}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-gray-900">{a.amount.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-3 py-1 text-xs font-medium rounded ${
                        a.type === "FIXED" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                      }`}>
                        {a.type}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {a.taxable ? (
                        <span className="text-green-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      {getStatusBadge(a.status)}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => startEdit(a)}
                          disabled={a.status === "APPROVED"}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit allowance"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deactivate(a._id)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Deactivate allowance"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
