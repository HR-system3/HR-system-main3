"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Receipt, Plus, Edit2, Trash2, X, Check, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

type PayTypeStatus = "DRAFT" | "APPROVED" | "REJECTED";

type PayType = {
  _id: string;
  type: string;
  amount: number;
  status?: PayTypeStatus;
};

export default function PayTypesPage() {
  const [payTypes, setPayTypes] = useState<PayType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState("");
  const [amount, setAmount] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPayTypes();
  }, []);

  const fetchPayTypes = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.get("/payroll-configuration/pay-type");
      setPayTypes(res.data || []);
    } catch (err: any) {
      console.error("Failed to load pay types", err);
      setError(err.response?.data?.message || err.message || "Failed to load pay types");
      setPayTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!type.trim()) {
      alert("Please enter a pay type name");
      return;
    }

    if (amount < 6000) {
      alert("Amount must be at least 6000");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/payroll-configuration/pay-type/${editingId}`, { type, amount });
      } else {
        await api.post("/payroll-configuration/pay-type", { type, amount });
      }
      resetForm();
      fetchPayTypes();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to save pay type";
      alert(errorMessage);
      console.error("Error saving pay type:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setType("");
    setAmount(0);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (pt: PayType) => {
    if (pt.status === "APPROVED") {
      alert("Approved pay types cannot be edited.");
      return;
    }
    setEditingId(pt._id);
    setType(pt.type);
    setAmount(pt.amount);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pay type? This action cannot be undone.")) return;
    try {
      await api.delete(`/payroll-configuration/pay-type/${id}`);
      fetchPayTypes();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to delete pay type";
      alert(errorMessage);
      console.error("Error deleting pay type:", err);
    }
  };

  const getStatusBadge = (status?: PayTypeStatus) => {
    if (!status) return null;
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
    total: payTypes.length,
    approved: payTypes.filter(pt => pt.status === "APPROVED").length,
    rejected: payTypes.filter(pt => pt.status === "REJECTED").length,
    draft: payTypes.filter(pt => pt.status === "DRAFT" || !pt.status).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pay types...</p>
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
            <Receipt className="w-8 h-8 text-blue-600" />
            Pay Types
          </h1>
          <p className="text-gray-600 mt-2 font-medium">Manage different types of payments</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Pay Type
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
          <Button variant="ghost" size="sm" onClick={fetchPayTypes}>
            Retry
          </Button>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Pay Types</p>
              <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{stats.total}</p>
            </div>
            <Receipt className="w-10 h-10 text-blue-500" />
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
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Draft</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2 tracking-tight">{stats.draft}</p>
            </div>
            <Receipt className="w-10 h-10 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Form Card */}
      {showForm && (
        <Card 
          title={editingId ? "Edit Pay Type" : "Create New Pay Type"}
          description={editingId ? "Update pay type details" : "Add a new pay type to the system"}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Pay Type"
                placeholder="e.g., Hourly, Monthly, Weekly"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                helperText="Enter a descriptive name for this pay type (e.g., Hourly, Monthly, Weekly, Daily)"
              />

              <Input
                label="Amount"
                type="number"
                placeholder="6000"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                min="6000"
                step="100"
                helperText="Enter the amount (minimum: 6,000)"
              />
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
                    Update Pay Type
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Pay Type
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

      {/* Pay Types Table */}
      <Card title={`All Pay Types (${payTypes.length})`}>
        {payTypes.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold text-lg">No pay types found</p>
            <p className="text-gray-500 text-sm mt-2">Create your first pay type to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-4 px-5 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payTypes.map((pt) => (
                  <tr key={pt._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-medium text-gray-900">{pt.type}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-gray-900">{pt.amount.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-5">
                      {getStatusBadge(pt.status) || (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          DRAFT
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => startEdit(pt)}
                          disabled={pt.status === "APPROVED"}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit pay type"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pt._id)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete pay type"
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
