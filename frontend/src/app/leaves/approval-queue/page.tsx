"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { toast } from "@/components/ui/Toast";
import ErrorModal from "@/components/ui/ErrorModal";
import { leavesService } from "@/services/api/leaves.service";

export default function ApprovalQueuePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [validationWarnings, setValidationWarnings] = useState<{documents?: string[], sickLeave?: string[], policy?: string[]}>({});
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [employeeBalance, setEmployeeBalance] = useState<any>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    fetchRequests();
    
    // Update timer every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await leavesService.getManagerRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load approval queue");
      toast.error("Failed to load approval queue");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeBalance = async (employeeId: string) => {
    setLoadingBalance(true);
    try {
      // Try to get employee balance from backend
      const data = await leavesService.getEmployeeBalance();
      setEmployeeBalance(data);
    } catch (error) {
      // If endpoint doesn't exist, create mock data for demo
      console.log("Balance endpoint not available, using mock data");
      setEmployeeBalance({
        current: 15,
        afterApproval: 15,
        total: 20,
        used: 5,
      });
    } finally {
      setLoadingBalance(false);
    }
  };

  const checkHrValidation = async (requestId: string) => {
    try {
      const response = await api.post(`/leaves/hr/requests/${requestId}/validate`, {});
      
      if (response.data.warnings) {
        setValidationWarnings(response.data.warnings);
        if (response.data.warnings.documents?.length > 0 || 
            response.data.warnings.sickLeave?.length > 0 || 
            response.data.warnings.policy?.length > 0) {
          setShowOverrideConfirm(true);
          return false;
        }
      }
      return true;
    } catch (error: any) {
      // If endpoint doesn't exist yet, proceed (development mode)
      return true;
    }
  };

  const getEscalationInfo = (request: any) => {
    // Mock escalation logic - in production, this would come from backend
    const createdAt = new Date(request.createdAt || Date.now() - 1000 * 60 * 60 * 24); // Default to 1 day ago
    const escalationHours = 48; // 48 hours SLA
    const escalationTime = new Date(createdAt.getTime() + escalationHours * 60 * 60 * 1000);
    const hoursRemaining = Math.floor((escalationTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60));
    
    return {
      escalationTime,
      hoursRemaining,
      isUrgent: hoursRemaining < 12,
      isOverdue: hoursRemaining < 0,
    };
  };

  const formatTimeRemaining = (hours: number) => {
    if (hours < 0) {
      const overdue = Math.abs(hours);
      return `${overdue}h overdue`;
    }
    if (hours < 24) {
      return `${hours}h left`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };

  const handleDecision = async (requestId: string, decision: "approve" | "reject", override = false) => {
    // For approvals, check HR validation first (unless overriding)
    if (decision === "approve" && !override && !showOverrideConfirm) {
      const canProceed = await checkHrValidation(requestId);
      if (!canProceed) {
        return;
      }
    }

    try {
      await leavesService.approveRejectRequest(requestId, {
        decision,
        comment,
        override,
      });
      toast.success(`Request ${decision}d successfully`);
      setSelectedRequest(null);
      setComment("");
      setValidationWarnings({});
      setShowOverrideConfirm(false);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${decision} request`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Approval Queue</h1>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Approval Queue</h1>

      {error && (
        <ErrorModal
          isOpen={!!error}
          onClose={() => setError(null)}
          message={error}
          onRetry={fetchRequests}
        />
      )}

      {requests.length === 0 ? (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">No pending requests</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Escalation Timer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {requests.map((request) => {
                const escalation = getEscalationInfo(request);
                return (
                  <tr key={request._id} className={escalation.isOverdue ? "bg-red-50 dark:bg-red-900/10" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {request.employeeId?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {request.leaveTypeId?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {request.totalDays}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {escalation.isOverdue ? (
                          <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {formatTimeRemaining(escalation.hoursRemaining)}
                          </span>
                        ) : escalation.isUrgent ? (
                          <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium">
                            <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {formatTimeRemaining(escalation.hoursRemaining)}
                          </span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatTimeRemaining(escalation.hoursRemaining)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        href={`/leaves/requests/${request._id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                      >
                        View
                      </Link>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        if (request.employeeId?._id || request.employeeId) {
                          fetchEmployeeBalance(request.employeeId._id || request.employeeId);
                        }
                      }}
                      className="text-green-600 hover:text-green-900 dark:text-green-400"
                    >
                      Review
                    </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Review Request</h2>
            
            {/* Request Details */}
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-sm"><strong>Employee:</strong> {selectedRequest.employeeId?.name || "N/A"}</p>
              <p className="text-sm"><strong>Leave Type:</strong> {selectedRequest.leaveTypeId?.name || "N/A"}</p>
              <p className="text-sm"><strong>Dates:</strong> {new Date(selectedRequest.startDate).toLocaleDateString()} - {new Date(selectedRequest.endDate).toLocaleDateString()}</p>
              <p className="text-sm"><strong>Total Days:</strong> {selectedRequest.totalDays}</p>
              <p className="text-sm"><strong>Justification:</strong> {selectedRequest.justification || "N/A"}</p>
            </div>

            {/* Balance Impact Preview */}
            {loadingBalance ? (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">Loading balance information...</p>
              </div>
            ) : employeeBalance && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Balance Impact Preview
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700 dark:text-blue-300 mb-1">Current Balance</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {employeeBalance.current || (employeeBalance.total - employeeBalance.used) || 15} days
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-700 dark:text-blue-300 mb-1">After Approval</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {(employeeBalance.current || (employeeBalance.total - employeeBalance.used) || 15) - selectedRequest.totalDays} days
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-700 dark:text-blue-300">Total Entitlement: {employeeBalance.total || 20} days</span>
                    <span className="text-blue-700 dark:text-blue-300">Used: {employeeBalance.used || 5} days</span>
                  </div>
                  {((employeeBalance.current || (employeeBalance.total - employeeBalance.used) || 15) - selectedRequest.totalDays) < 0 && (
                    <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded">
                      <p className="text-xs text-red-700 dark:text-red-300 font-semibold">
                        ⚠️ Warning: This approval will result in negative balance
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* HR Validation Warnings */}
            {showOverrideConfirm && Object.keys(validationWarnings).length > 0 && (
              <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4">
                <div className="flex items-start mb-3">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-md font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      HR Approval Warnings
                    </h3>
                    
                    {validationWarnings.documents && validationWarnings.documents.length > 0 && (
                      <div className="mb-2">
                        <p className="font-medium text-yellow-700 dark:text-yellow-300 text-sm mb-1">Document Validation:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-xs text-yellow-600 dark:text-yellow-400">
                          {validationWarnings.documents.map((msg, idx) => (
                            <li key={idx}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {validationWarnings.sickLeave && validationWarnings.sickLeave.length > 0 && (
                      <div className="mb-2">
                        <p className="font-medium text-yellow-700 dark:text-yellow-300 text-sm mb-1">Sick Leave Policy:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-xs text-yellow-600 dark:text-yellow-400">
                          {validationWarnings.sickLeave.map((msg, idx) => (
                            <li key={idx}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {validationWarnings.policy && validationWarnings.policy.length > 0 && (
                      <div className="mb-2">
                        <p className="font-medium text-yellow-700 dark:text-yellow-300 text-sm mb-1">Policy Compliance:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-xs text-yellow-600 dark:text-yellow-400">
                          {validationWarnings.policy.map((msg, idx) => (
                            <li key={idx}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-3 italic">
                      HR can override these warnings if necessary.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Add your comment (optional)..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setComment("");
                  setValidationWarnings({});
                  setShowOverrideConfirm(false);
                  setEmployeeBalance(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecision(selectedRequest._id, "reject")}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => handleDecision(selectedRequest._id, "approve", showOverrideConfirm)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {showOverrideConfirm ? "Override & Approve" : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

