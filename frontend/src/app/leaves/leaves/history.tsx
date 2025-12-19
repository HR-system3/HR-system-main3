"use client";
import api from "@/lib/axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  createdAt: string;
}

export default function LeaveHistoryPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("employee");
  const [viewMode, setViewMode] = useState<"my" | "team">("my");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const { jwtDecode } = await import("jwt-decode");
          const decoded: any = jwtDecode(token);
          setUserRole(decoded.role || "employee");
        }

        let endpoint = "/leaves/employee/history";
        if (userRole === "manager" && viewMode === "team") {
          endpoint = "/leaves/manager/requests";
        }

        const response = await api.get(endpoint);
        const requestsData = response.data || [];
        // Ensure leaveTypeId is properly handled (might be populated or just an ID)
        setRequests(requestsData.map((req: any) => ({
          ...req,
          leaveTypeId: req.leaveTypeId?._id 
            ? { name: req.leaveTypeId.name || "Unknown", code: req.leaveTypeId.code || "" }
            : { name: "Unknown", code: "" },
        })));
      } catch (error) {
        console.error("Error fetching leave history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userRole, viewMode]);

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
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave History</h1>
            <p className="text-gray-600 mt-2">
              {userRole === "manager" && viewMode === "team"
                ? "View leave history for your team"
                : "View your leave history"}
            </p>
          </div>
          {userRole === "manager" && (
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("my")}
                className={`px-4 py-2 rounded-md ${
                  viewMode === "my"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                My Leaves
              </button>
              <button
                onClick={() => setViewMode("team")}
                className={`px-4 py-2 rounded-md ${
                  viewMode === "team"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Team Leaves
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No leave requests found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.leaveTypeId?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(request.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(request.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.totalDays}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/leaves/requests/${request._id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

