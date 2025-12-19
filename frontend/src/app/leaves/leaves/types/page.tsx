"use client";
import api from "@/lib/axios";
import { useState, useEffect } from "react";
import Link from "next/link";

interface LeaveType {
  _id: string;
  code: string;
  name: string;
  category?: string;
  isPaid: boolean;
  requiresAttachment?: boolean;
  minTenureMonths?: number;
  maxDurationDays?: number;
  allowPostLeaveSubmission?: boolean;
  pauseAccrual?: boolean;
  deductsFromBalance?: boolean; // New field for REQ-006
  isActive?: boolean; // For deactivate functionality
  payrollPayCode?: string;
}

export default function LeaveTypeManagementPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      // Note: This endpoint may not exist. You may need to add a GET endpoint for /leaves/hr/types
      // For now, we'll try to get leave types from HR requests and extract unique types
      const response = await api.get("/leaves/hr/types").catch(async () => {
        // Fallback: try to get from requests
        try {
          const requestsResponse = await api.get("/leaves/hr/requests");
          const requests = requestsResponse.data || [];
          // Extract unique leave types from requests
          const uniqueTypes = new Map();
          requests.forEach((req: any) => {
            if (req.leaveTypeId && !uniqueTypes.has(req.leaveTypeId._id || req.leaveTypeId)) {
              uniqueTypes.set(req.leaveTypeId._id || req.leaveTypeId, {
                _id: req.leaveTypeId._id || req.leaveTypeId,
                name: req.leaveTypeId.name || "Unknown",
                code: req.leaveTypeId.code || "",
              });
            }
          });
          return { data: Array.from(uniqueTypes.values()) };
        } catch {
          return { data: [] };
        }
      });
      setLeaveTypes(response.data || []);
    } catch (error) {
      console.error("Error fetching leave types:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this leave type?")) return;

    try {
      // Note: DELETE endpoint may not exist. You may need to add it to the backend
      await api.delete(`/leaves/hr/types/${id}`).catch(() => {
        throw new Error("Delete endpoint not available. Please add DELETE /leaves/hr/types/:id endpoint.");
      });
      fetchLeaveTypes();
    } catch (error: any) {
      alert(error.message || error.response?.data?.message || "Failed to delete leave type");
    }
  };

  const handleDeactivate = async (type: LeaveType) => {
    if (!confirm(`Are you sure you want to ${type.isActive === false ? "activate" : "deactivate"} this leave type?`)) return;

    try {
      // Update the leave type with isActive flag
      await api.post("/leaves/hr/types", {
        id: type._id,
        ...type,
        isActive: type.isActive === false ? true : false,
      });
      fetchLeaveTypes();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update leave type");
    }
  };

  const handleEdit = (type: LeaveType) => {
    setEditingType(type);
  };

  const handleSaveEdit = async (updatedType: LeaveType) => {
    try {
      await api.post("/leaves/hr/types", {
        id: updatedType._id,
        ...updatedType,
      });
      setEditingType(null);
      fetchLeaveTypes();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update leave type");
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
            <h1 className="text-3xl font-bold text-gray-900">Leave Type Management</h1>
            <p className="text-gray-600 mt-2">Manage all leave types and policies</p>
          </div>
          <Link
            href="/leaves/policies/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Create New Policy
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deducts from Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Options
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaveTypes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    No leave types found. Create your first leave policy.
                  </td>
                </tr>
              ) : (
                leaveTypes.map((type) => (
                  <tr key={type._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {type.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {type.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {type.category || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          type.isPaid
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {type.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {type.maxDurationDays ? `${type.maxDurationDays} days` : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          type.deductsFromBalance !== false
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {type.deductsFromBalance !== false ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          type.isActive !== false
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {type.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col gap-1">
                        {type.requiresAttachment && (
                          <span className="text-xs text-blue-600">Requires Attachment</span>
                        )}
                        {type.allowPostLeaveSubmission && (
                          <span className="text-xs text-green-600">Post-Leave Allowed</span>
                        )}
                        {type.pauseAccrual && (
                          <span className="text-xs text-yellow-600">Pauses Accrual</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(type)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeactivate(type)}
                          className={`${
                            type.isActive === false ? "text-green-600 hover:text-green-900" : "text-yellow-600 hover:text-yellow-900"
                          }`}
                        >
                          {type.isActive === false ? "Activate" : "Deactivate"}
                        </button>
                        <button
                          onClick={() => handleDelete(type._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editingType && (
          <EditLeaveTypeModal
            type={editingType}
            onClose={() => setEditingType(null)}
            onSave={handleSaveEdit}
          />
        )}
      </div>
    </div>
  );
}

// Edit Leave Type Modal Component
function EditLeaveTypeModal({
  type,
  onClose,
  onSave,
}: {
  type: LeaveType;
  onClose: () => void;
  onSave: (updatedType: LeaveType) => void;
}) {
  const [formData, setFormData] = useState<LeaveType>({ ...type });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type: inputType } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        inputType === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : inputType === "number"
            ? value === ""
              ? undefined
              : Number(value)
            : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const categories = [
    "Annual",
    "Sick",
    "Unpaid",
    "Personal",
    "Maternity",
    "Paternity",
    "Bereavement",
    "Study",
    "Other",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Edit Leave Type</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Code *
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="maxDurationDays" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Duration (Days)
                </label>
                <input
                  type="number"
                  id="maxDurationDays"
                  name="maxDurationDays"
                  value={formData.maxDurationDays || ""}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPaid"
                  name="isPaid"
                  checked={formData.isPaid}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPaid" className="ml-2 text-sm text-gray-700">
                  Paid Leave
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="deductsFromBalance"
                  name="deductsFromBalance"
                  checked={formData.deductsFromBalance !== false}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, deductsFromBalance: e.target.checked }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="deductsFromBalance" className="ml-2 text-sm text-gray-700">
                  Deducts from Balance
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requiresAttachment"
                  name="requiresAttachment"
                  checked={formData.requiresAttachment}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requiresAttachment" className="ml-2 text-sm text-gray-700">
                  Requires Attachment
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pauseAccrual"
                  name="pauseAccrual"
                  checked={formData.pauseAccrual}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="pauseAccrual" className="ml-2 text-sm text-gray-700">
                  Pause Accrual During Leave
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

