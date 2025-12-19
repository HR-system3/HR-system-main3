"use client";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { toast } from "@/components/ui/Toast";
import ErrorModal from "@/components/ui/ErrorModal";

export default function AccrualPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    accrualMethod: "monthly",
    accrualRate: "",
    carryoverEnabled: false,
    carryoverLimit: "",
    expiryDate: "",
    pauseDuringUnpaidLeave: true,
    pauseDuringSuspension: true,
    gracePeriodDays: 7,
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get("/leaves/hr/accrual");
      setConfig(response.data);
      if (response.data) {
        setFormData({
          accrualMethod: response.data.accrualMethod || "monthly",
          accrualRate: response.data.accrualRate || "",
          carryoverEnabled: response.data.carryoverEnabled || false,
          carryoverLimit: response.data.carryoverLimit || "",
          expiryDate: response.data.expiryDate || "",
          pauseDuringUnpaidLeave: response.data.pauseDuringUnpaidLeave !== undefined ? response.data.pauseDuringUnpaidLeave : true,
          pauseDuringSuspension: response.data.pauseDuringSuspension !== undefined ? response.data.pauseDuringSuspension : true,
          gracePeriodDays: response.data.gracePeriodDays || 7,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load accrual config");
      toast.error("Failed to load accrual configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/leaves/hr/accrual", formData);
      toast.success("Accrual configuration updated successfully");
      fetchConfig();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update accrual configuration");
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Leave Accrual & Carryover Setup</h1>

      {error && (
        <ErrorModal
          isOpen={!!error}
          onClose={() => setError(null)}
          message={error}
          onRetry={fetchConfig}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Accrual Method</label>
            <select
              value={formData.accrualMethod}
              onChange={(e) => setFormData({ ...formData, accrualMethod: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Accrual Rate (days per period)</label>
            <input
              type="number"
              value={formData.accrualRate}
              onChange={(e) => setFormData({ ...formData, accrualRate: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.carryoverEnabled}
                onChange={(e) => setFormData({ ...formData, carryoverEnabled: e.target.checked })}
                className="mr-2"
              />
              <span>Enable Carryover</span>
            </label>
          </div>

          {formData.carryoverEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Carryover Limit (days)</label>
                <input
                  type="number"
                  value={formData.carryoverLimit}
                  onChange={(e) => setFormData({ ...formData, carryoverLimit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </>
          )}

          {/* Accrual Pause Conditions (BR-11) */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Accrual Pause Conditions (BR-11)
            </h3>
            <div className="space-y-3 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="pauseUnpaid"
                  checked={formData.pauseDuringUnpaidLeave}
                  onChange={(e) => setFormData({ ...formData, pauseDuringUnpaidLeave: e.target.checked })}
                  className="mt-1 mr-3 h-4 w-4"
                />
                <label htmlFor="pauseUnpaid" className="flex-1">
                  <span className="font-medium">Pause accrual during unpaid leave</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    When enabled, employees on unpaid leave will not accrue leave days during that period.
                  </p>
                </label>
              </div>
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="pauseSuspension"
                  checked={formData.pauseDuringSuspension}
                  onChange={(e) => setFormData({ ...formData, pauseDuringSuspension: e.target.checked })}
                  className="mt-1 mr-3 h-4 w-4"
                />
                <label htmlFor="pauseSuspension" className="flex-1">
                  <span className="font-medium">Pause accrual during suspension</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    When enabled, suspended employees will not accrue leave days during suspension period.
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Post-Leave Submission Grace Period (REQ-031) */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Post-Leave Submission Grace Period (REQ-031)
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <label className="block text-sm font-medium mb-2">
                Grace Period (days after leave ends)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={formData.gracePeriodDays}
                onChange={(e) => setFormData({ ...formData, gracePeriodDays: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Employees can submit leave requests up to <strong>{formData.gracePeriodDays}</strong> days after the leave has ended. Set to 0 to disable post-leave submissions.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Configuration
          </button>
        </form>
      </div>
    </div>
  );
}

