"use client";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { LoadingSkeleton, CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { toast } from "@/components/ui/Toast";
import ErrorModal from "@/components/ui/ErrorModal";
import Link from "next/link";

export default function LeavesPage() {
  const [balance, setBalance] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("all");

  useEffect(() => {
    fetchBalance();
    fetchPendingRequests();

    // Auto-refresh every 60 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefreshEnabled) {
      interval = setInterval(() => {
        fetchBalance(true);
        fetchPendingRequests();
      }, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefreshEnabled]);

  const fetchBalance = async (isAutoRefresh = false) => {
    if (isAutoRefresh) {
      setIsRefreshing(true);
    }
    
    try {
      const response = await api.get("/leaves/employee/balance");
      setBalance(response.data);
      setLastRefresh(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load leave balance");
      if (!isAutoRefresh) {
        toast.error("Failed to load leave balance");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get("/leaves/employee/history");
      const allRequests = response.data || [];
      const pending = allRequests.filter((req: any) => req.status === "pending" || req.status === "PENDING");
      setPendingRequests(pending);
    } catch (err: any) {
      console.error("Failed to load pending requests:", err);
    }
  };

  const getLeaveTypes = () => {
    if (!balance || !Array.isArray(balance)) return [];
    return balance.map((item: any) => ({
      id: item.leaveTypeId,
      name: item.leaveTypeName || "Leave Type",
    }));
  };

  const getFilteredBalance = () => {
    if (!balance || !Array.isArray(balance)) return [];
    if (selectedLeaveType === "all") return balance;
    return balance.filter((item: any) => item.leaveTypeId === selectedLeaveType);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Leaves Dashboard</h1>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h1 className="text-3xl font-bold">Leaves Dashboard</h1>
        <div className="flex items-center gap-3">
          {/* Auto-refresh indicator */}
          <div className="flex items-center gap-2 text-sm">
            {isRefreshing && (
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Refreshing...</span>
              </div>
            )}
            <button
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                autoRefreshEnabled
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
              title={autoRefreshEnabled ? "Auto-refresh enabled (every 60s)" : "Auto-refresh disabled"}
            >
              {autoRefreshEnabled ? "🔄 Auto" : "⏸ Manual"}
            </button>
            <button
              onClick={() => fetchBalance(true)}
              className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Refresh now"
            >
              ↻ Refresh
            </button>
          </div>
          <Link
            href="/leaves/request"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
          >
            Request Leave
          </Link>
        </div>
      </div>

      {error && (
        <ErrorModal
          isOpen={!!error}
          onClose={() => setError(null)}
          message={error}
          onRetry={fetchBalance}
        />
      )}

      {/* Pending Requests Widget */}
      {pendingRequests.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  {pendingRequests.length} Pending Request{pendingRequests.length > 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  You have leave requests awaiting approval
                </p>
              </div>
            </div>
            <Link
              href="/leaves/history"
              className="text-sm text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {pendingRequests.slice(0, 3).map((request: any) => (
              <div key={request._id} className="flex items-center justify-between text-sm bg-white dark:bg-gray-800 rounded p-2">
                <div>
                  <span className="font-medium">{request.leaveTypeId?.name || "Leave"}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">{request.totalDays} days</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave Type Filter */}
      {balance && Array.isArray(balance) && balance.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <label htmlFor="leaveTypeFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Leave Type:
          </label>
          <select
            id="leaveTypeFilter"
            value={selectedLeaveType}
            onChange={(e) => setSelectedLeaveType(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
          >
            <option value="all">All Leave Types</option>
            {getLeaveTypes().map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {balance && Array.isArray(balance) && balance.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {getFilteredBalance().map((item: any) => (
            <div
              key={item.leaveTypeId}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow"
            >
              <h3 className="text-lg font-semibold mb-4">{item.leaveTypeName || "Leave Type"}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Accrued:</span>
                  <span className="font-medium text-green-600">{item.accrued || item.entitlementDays || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Taken:</span>
                  <span className="font-medium text-red-600">{item.taken || item.usedDays || 0}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                  <span className="text-gray-900 dark:text-white font-semibold">Remaining:</span>
                  <span className="font-bold text-blue-600">{item.remaining || 0}</span>
                </div>
                {item.carryover && item.carryover > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Carryover:</span>
                    <span className="font-medium text-purple-600">{item.carryover}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center mb-8">
          <p className="text-gray-600 dark:text-gray-400">No leave balance information available.</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/leaves/request"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <h3 className="font-semibold mb-2">Request Leave</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Submit a new leave request
            </p>
          </Link>
          <Link
            href="/leaves/history"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <h3 className="font-semibold mb-2">View History</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Check your leave history and status
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
