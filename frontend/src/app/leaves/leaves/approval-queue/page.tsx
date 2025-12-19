"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { leavesService } from "@/services/api/leaves.service";

interface LeaveRequest {
  _id: string;
  employeeId: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
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
    isRequired: boolean;
  }>;
  createdAt: string;
}

export default function ApprovalQueuePage() {
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [filter, setFilter] = useState<string>("pending");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const { jwtDecode } = await import("jwt-decode");
          const decoded: any = jwtDecode(token);
          setUserRole(decoded.role || "");
        }

        let data: any[] = [];
        if (userRole === "manager") {
          data = await leavesService.getManagerRequests();
        } else if (userRole === "hr" || userRole === "admin") {
          data = await leavesService.getHrRequests({ status: filter === "all" ? undefined : filter });
        }
        setRequests(data || []);
      } catch (error) {
        console.error("Error fetching approval queue:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userRole, filter]);

  const handleApproveReject = async (
    requestId: string,
    action: "approved" | "rejected",
    comment?: string
  ) => {
    const commentText = comment || prompt(`Enter comment for ${action}:`);
    if (commentText === null) return;

    try {
      const dto = {
        approved: action === "approved",
        comment: commentText,
      };

      if (userRole === "manager") {
        await leavesService.approveRejectRequest(requestId, dto);
      } else {
        await leavesService.finalizeRequest(requestId, dto);
      }

      // Refresh the list
      let data: any[] = [];
      if (userRole === "manager") {
        data = await leavesService.getManagerRequests();
      } else {
        data = await leavesService.getHrRequests({ status: filter === "all" ? undefined : filter });
      }
      setRequests(data || []);
    } catch (error: any) {
      alert(error.response?.data?.message || `Failed to ${action} request`);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Approval Queue</h1>
          <p className="text-gray-600 mt-2">
            Review and approve/reject leave requests
            {userRole === "manager" && " for your team"}
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-md ${
              filter === "pending"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-md ${
              filter === "approved"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-4 py-2 rounded-md ${
              filter === "rejected"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            All
          </button>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No requests found matching the selected filter.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {requests.map((request) => (
                <div key={request._id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.employeeId?.firstName} {request.employeeId?.lastName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Leave Type:</span>{" "}
                          {request.leaveTypeId?.name}
                        </div>
                        <div>
                          <span className="font-medium">Start:</span>{" "}
                          {new Date(request.startDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">End:</span>{" "}
                          {new Date(request.endDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Days:</span> {request.totalDays}
                        </div>
                      </div>
                      {request.justification && (
                        <p className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Reason:</span> {request.justification}
                        </p>
                      )}
                      <div className="text-xs text-gray-500">
                        Requested on: {new Date(request.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => router.push(`/leaves/requests/${request._id}`)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        View Details
                      </button>
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApproveReject(request._id, "approved")}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveReject(request._id, "rejected")}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

