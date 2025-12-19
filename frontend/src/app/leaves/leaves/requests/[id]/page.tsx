"use client";
import api from "@/lib/axios";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface LeaveRequest {
  _id: string;
  leaveTypeId: {
    name: string;
    code: string;
  };
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  justification?: string;
  approvalFlow: Array<{
    role: string;
    status: string;
    level: number;
    decidedBy?: string;
    decidedAt?: string;
    comment?: string;
  }>;
  requestedBy: string;
  createdAt: string;
}

export default function LeaveRequestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  const [request, setRequest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<any[]>([]);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        // Get request from history (since there's no direct GET endpoint)
        const historyResponse = await api.get("/leaves/employee/history").catch(() => null);
        const timelineResponse = await api.get(`/leaves/employee/requests/${requestId}/timeline`).catch(() => null);

        if (historyResponse) {
          const requests = historyResponse.data || [];
          const foundRequest = requests.find((r: any) => r._id === requestId);
          if (foundRequest) {
            setRequest(foundRequest);
          }
        }
        
        if (timelineResponse) {
          setTimeline(timelineResponse.data || []);
        }
      } catch (error) {
        console.error("Error fetching request details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchRequest();
    }
  }, [requestId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Request not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Leave Request Details</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Request Overview */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Leave Type</label>
              <p className="text-lg font-semibold text-gray-900">
                {request.leaveTypeId?.name || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                  request.status
                )}`}
              >
                {request.status}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Start Date</label>
              <p className="text-lg text-gray-900">
                {new Date(request.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">End Date</label>
              <p className="text-lg text-gray-900">
                {new Date(request.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Total Days</label>
              <p className="text-lg text-gray-900">{request.totalDays} days</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Requested On</label>
              <p className="text-lg text-gray-900">
                {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {request.justification && (
            <div>
              <label className="text-sm font-medium text-gray-500">Justification</label>
              <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-md">
                {request.justification}
              </p>
            </div>
          )}

          {/* Approval Flow */}
          {request.approvalFlow && request.approvalFlow.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Approval Flow</h2>
              <div className="space-y-4">
                {request.approvalFlow.map((approval, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Level {approval.level} - {approval.role}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs mt-1 ${getStatusColor(
                            approval.status
                          )}`}
                        >
                          {approval.status}
                        </span>
                      </div>
                      {approval.decidedAt && (
                        <span className="text-sm text-gray-500">
                          {new Date(approval.decidedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {approval.comment && (
                      <p className="text-sm text-gray-600 mt-2">{approval.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {timeline.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-3">
                {timeline.map((event, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{event.action}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                      {event.comment && (
                        <p className="text-sm text-gray-600 mt-1">{event.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

