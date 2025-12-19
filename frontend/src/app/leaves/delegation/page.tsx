"use client";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { toast } from "@/components/ui/Toast";
import ErrorModal from "@/components/ui/ErrorModal";

export default function DelegationPage() {
  const [delegations, setDelegations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    delegateUserId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    fetchDelegations();
  }, []);

  const fetchDelegations = async () => {
    try {
      const response = await api.get("/leaves/manager/delegations");
      setDelegations(response.data || []);
    } catch (err: any) {
      console.error("Failed to load delegations:", err);
      // Use mock data for demo
      setDelegations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/leaves/manager/delegations", formData);
      toast.success("Delegation created successfully");
      setShowForm(false);
      setFormData({ delegateUserId: "", startDate: "", endDate: "", reason: "" });
      fetchDelegations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create delegation");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this delegation?")) return;
    
    try {
      await api.delete(`/leaves/manager/delegations/${id}`);
      toast.success("Delegation removed successfully");
      fetchDelegations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove delegation");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Approval Delegation (REQ-023)
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Assign approvers to handle your approval requests when you're absent
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "Add Delegation"}
        </button>
      </div>

      {error && (
        <ErrorModal
          isOpen={!!error}
          onClose={() => setError(null)}
          message={error}
          onRetry={fetchDelegations}
        />
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1 text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">How Delegation Works</p>
            <ul className="mt-2 space-y-1 text-blue-800 dark:text-blue-200">
              <li>• Set a delegate to handle approvals during your absence (vacation, sick leave, etc.)</li>
              <li>• Delegations can be time-bound or permanent</li>
              <li>• Multiple delegations can be active for different periods</li>
              <li>• Delegates will receive approval notifications in your place</li>
            </ul>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Delegation</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Delegate User ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.delegateUserId}
                onChange={(e) => setFormData({ ...formData, delegateUserId: e.target.value })}
                placeholder="Enter the user ID of your delegate"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This person will approve requests on your behalf during the specified period.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                placeholder="E.g., Annual vacation, Medical leave, Business trip..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Create Delegation
            </button>
          </form>
        </div>
      )}

      {delegations.length === 0 ? (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">No delegations configured</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Create a delegation to assign approvers when you're absent
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {delegations.map((delegation: any) => (
            <div key={delegation._id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
                      Active
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(delegation.startDate).toLocaleDateString()} - {new Date(delegation.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-lg font-semibold mb-2">
                    Delegate: <span className="text-blue-600 dark:text-blue-400">{delegation.delegateUserId?.name || delegation.delegateUserId}</span>
                  </p>
                  {delegation.reason && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Reason: {delegation.reason}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(delegation._id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 ml-4"
                  title="Remove delegation"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

