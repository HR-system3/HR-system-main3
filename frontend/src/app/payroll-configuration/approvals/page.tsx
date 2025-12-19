"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { FileCheck, Check, X, Eye, AlertCircle, Clock } from "lucide-react";

type ConfigStatus = "DRAFT" | "APPROVED" | "REJECTED" | "PENDING_MANAGER_APPROVAL";

type ApprovalItem = {
  id: string;
  type: string;
  name: string;
  status: ConfigStatus;
  createdAt: string;
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<ApprovalItem | null>(null);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.get("/payroll-configuration/approvals/pending");
      setApprovals(res.data || []);
    } catch (err: any) {
      console.error("Failed to load approvals", err);
      setError(err.response?.data?.message || err.message || "Failed to load approvals");
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item: ApprovalItem) => {
    setProcessingId(item.id);
    try {
      await api.post("/payroll-configuration/approvals/approve", {
        id: item.id,
        type: item.type,
      });
      fetchApprovals();
      setViewingItem(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to approve configuration");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (item: ApprovalItem) => {
    if (!confirm("Are you sure you want to reject this configuration?")) return;
    setProcessingId(item.id);
    try {
      await api.post("/payroll-configuration/approvals/reject", {
        id: item.id,
        type: item.type,
      });
      fetchApprovals();
      setViewingItem(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to reject configuration");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading approvals...</p>
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
            <FileCheck className="w-8 h-8 text-blue-600" />
            Pending Approvals
          </h1>
          <p className="text-gray-600 mt-2 font-medium">Review and approve configuration changes</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-red-700 text-sm mt-1.5">{error}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchApprovals}>
            Retry
          </Button>
        </div>
      )}

      {/* Approvals List */}
      <Card title={`Pending Approvals (${approvals.length})`}>
        {approvals.length === 0 ? (
          <div className="text-center py-16">
            <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold text-lg">No pending approvals</p>
            <p className="text-gray-500 text-sm mt-2">All configurations have been reviewed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-4 px-5 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-medium text-gray-900">{item.name || "-"}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-gray-600">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1.5 w-fit">
                        <Clock className="w-3 h-3" />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setViewingItem(item)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApprove(item)}
                          disabled={processingId === item.id}
                          className="p-2.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(item)}
                          disabled={processingId === item.id}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
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

      {/* View Config Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Configuration Details</h3>
              <button
                onClick={() => setViewingItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">Type</p>
                  <p className="text-lg font-semibold text-gray-900">{viewingItem.type}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">Name</p>
                  <p className="text-lg font-semibold text-gray-900">{viewingItem.name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {viewingItem.status}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">Created</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(viewingItem.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Please review all details carefully before approving or rejecting this configuration.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-4">
              <Button variant="secondary" onClick={() => setViewingItem(null)}>
                Close
              </Button>
              <Button
                variant="danger"
                onClick={() => handleReject(viewingItem)}
                disabled={processingId === viewingItem.id}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button 
                onClick={() => handleApprove(viewingItem)}
                disabled={processingId === viewingItem.id}
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
