"use client";
import { useEffect, useState } from "react";
import { LoadingSkeleton, CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { toast } from "@/components/ui/Toast";
import ErrorModal from "@/components/ui/ErrorModal";
import { leavesService } from "@/services/api/leaves.service";

export default function HRMonitoringPage() {
  const [stats, setStats] = useState<any>(null);
  const [irregularPatterns, setIrregularPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState({
    employeeId: "",
    leaveTypeId: "",
    days: "",
    reason: "",
    type: "add" as "add" | "subtract",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, patternsData] = await Promise.all([
        leavesService.getHrOverview(),
        leavesService.getHrPatternsReport(),
      ]);
      setStats(statsData);
      setIrregularPatterns(patternsData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load monitoring data");
      toast.error("Failed to load monitoring data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adjustmentData.employeeId || !adjustmentData.leaveTypeId || !adjustmentData.days || !adjustmentData.reason) {
      toast.warning("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    
    try {
      await leavesService.manualAdjustment({
        employeeId: adjustmentData.employeeId,
        leaveTypeId: adjustmentData.leaveTypeId,
        days: adjustmentData.type === "subtract" ? -parseInt(adjustmentData.days) : parseInt(adjustmentData.days),
        reason: adjustmentData.reason,
      });
      
      toast.success("Leave balance adjusted successfully");
      setShowAdjustmentForm(false);
      setAdjustmentData({ employeeId: "", leaveTypeId: "", days: "", reason: "", type: "add" });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to adjust leave balance");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">HR Monitoring</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">HR Monitoring Dashboard</h1>
        <button
          onClick={() => setShowAdjustmentForm(!showAdjustmentForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          {showAdjustmentForm ? "Cancel" : "Manual Adjustment"}
        </button>
      </div>

      {error && (
        <ErrorModal
          isOpen={!!error}
          onClose={() => setError(null)}
          message={error}
          onRetry={fetchData}
        />
      )}

      {/* Manual Adjustment Form */}
      {showAdjustmentForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Manual Leave Balance Adjustment</h2>
          <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={adjustmentData.employeeId}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, employeeId: e.target.value })}
                  placeholder="Enter employee ID"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Leave Type ID
                </label>
                <input
                  type="text"
                  value={adjustmentData.leaveTypeId}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, leaveTypeId: e.target.value })}
                  placeholder="Enter leave type ID"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Adjustment Type
                </label>
                <select
                  value={adjustmentData.type}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, type: e.target.value as "add" | "subtract" })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                >
                  <option value="add">Add Days (+)</option>
                  <option value="subtract">Subtract Days (−)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Days
                </label>
                <input
                  type="number"
                  value={adjustmentData.days}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, days: e.target.value })}
                  placeholder="Enter number of days"
                  min="0"
                  step="0.5"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Reason for Adjustment
              </label>
              <textarea
                value={adjustmentData.reason}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                placeholder="Provide a detailed reason for this adjustment..."
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Apply Adjustment"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdjustmentForm(false);
                  setAdjustmentData({ employeeId: "", leaveTypeId: "", days: "", reason: "", type: "add" });
                }}
                className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 px-6 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-2">Total Requests</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalRequests || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-2">Pending Approvals</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingApprovals || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-2">Approved This Month</h3>
            <p className="text-3xl font-bold text-green-600">{stats.approvedThisMonth || 0}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Irregular Leave Patterns</h2>
        {irregularPatterns.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No irregular patterns detected</p>
        ) : (
          <div className="space-y-4">
            {irregularPatterns.map((pattern: any) => (
              <div key={pattern.employeeId} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <p className="font-medium">{pattern.employeeName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{pattern.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

