"use client";
import api from "@/lib/axios";
import { useState, useEffect } from "react";

interface ApprovalLevel {
  level: number;
  type: "HR" | "MANAGER" | "DEPARTMENT_HEAD" | "CUSTOM";
  positionId?: string;
  departmentId?: string;
  employeeId?: string;
  isRequired: boolean;
  escalationHours: number;
}

interface ApprovalConfig {
  _id?: string;
  code: string;
  name: string;
  levels: ApprovalLevel[];
  leaveTypeId?: string;
  departmentId?: string;
  allowHrOverride: boolean;
  isActive: boolean;
  supportDelegation: boolean;
}

interface LeaveType {
  _id: string;
  name: string;
  code: string;
}

export default function ApprovalWorkflowConfigurationPage() {
  const [configs, setConfigs] = useState<ApprovalConfig[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ApprovalConfig | null>(null);
  const [formData, setFormData] = useState<ApprovalConfig>({
    code: "",
    name: "",
    levels: [],
    allowHrOverride: true,
    isActive: true,
    supportDelegation: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Try to get leave types
      const typesResponse = await api.get("/leaves/hr/types").catch(async () => {
        try {
          const requestsResponse = await api.get("/leaves/hr/requests");
          const requests = requestsResponse.data || [];
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

      // Try to get approval configs
      const configsResponse = await api.get("/leaves/hr/approval-configs").catch(() => {
        return { data: [] };
      });

      setLeaveTypes(typesResponse.data || []);
      setConfigs(configsResponse.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = editingConfig
        ? { ...formData, id: editingConfig._id }
        : formData;
      await api.post("/leaves/hr/approval-configs", payload);
      setShowForm(false);
      setEditingConfig(null);
      setFormData({
        code: "",
        name: "",
        levels: [],
        allowHrOverride: true,
        isActive: true,
        supportDelegation: true,
      });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save approval workflow");
    }
  };

  const addApprovalLevel = () => {
    const newLevel: ApprovalLevel = {
      level: formData.levels.length + 1,
      type: "MANAGER",
      isRequired: true,
      escalationHours: 48, // Default 48 hours (REQ-009)
    };
    setFormData((prev) => ({
      ...prev,
      levels: [...prev.levels, newLevel],
    }));
  };

  const updateApprovalLevel = (index: number, field: keyof ApprovalLevel, value: any) => {
    setFormData((prev) => ({
      ...prev,
      levels: prev.levels.map((level, i) =>
        i === index ? { ...level, [field]: value } : level
      ),
    }));
  };

  const removeApprovalLevel = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      levels: prev.levels
        .filter((_, i) => i !== index)
        .map((level, i) => ({ ...level, level: i + 1 })),
    }));
  };

  const handleEdit = (config: ApprovalConfig) => {
    setEditingConfig(config);
    setFormData(config);
    setShowForm(true);
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
            <h1 className="text-3xl font-bold text-gray-900">Approval Workflow Configuration</h1>
            <p className="text-gray-600 mt-2">Configure approval levels, roles, and escalation settings</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) {
                setEditingConfig(null);
                setFormData({
                  code: "",
                  name: "",
                  levels: [],
                  allowHrOverride: true,
                  isActive: true,
                  supportDelegation: true,
                });
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Create Workflow"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingConfig ? "Edit Approval Workflow" : "New Approval Workflow"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                    Code * (REQ-009)
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., STANDARD, SENIOR"
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Standard Workflow"
                  />
                </div>

                <div>
                  <label htmlFor="leaveTypeId" className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type (Optional)
                  </label>
                  <select
                    id="leaveTypeId"
                    value={formData.leaveTypeId || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, leaveTypeId: e.target.value || undefined }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Leave Types</option>
                    {leaveTypes.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name} ({type.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Approval Levels */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Approval Levels (REQ-009)
                  </label>
                  <button
                    type="button"
                    onClick={addApprovalLevel}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Level
                  </button>
                </div>

                {formData.levels.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center text-gray-500">
                    No approval levels configured. Click "+ Add Level" to add one.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.levels.map((level, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-900">Level {level.level}</h4>
                          <button
                            type="button"
                            onClick={() => removeApprovalLevel(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Approval Role *
                            </label>
                            <select
                              value={level.type}
                              onChange={(e) =>
                                updateApprovalLevel(
                                  index,
                                  "type",
                                  e.target.value as ApprovalLevel["type"]
                                )
                              }
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="HR">HR</option>
                              <option value="MANAGER">Manager</option>
                              <option value="DEPARTMENT_HEAD">Department Head</option>
                              <option value="CUSTOM">Custom</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Escalation Hours (REQ-009)
                            </label>
                            <input
                              type="number"
                              value={level.escalationHours}
                              onChange={(e) =>
                                updateApprovalLevel(index, "escalationHours", Number(e.target.value))
                              }
                              min="1"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Default: 48 hours (REQ-009)
                            </p>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={level.isRequired}
                              onChange={(e) =>
                                updateApprovalLevel(index, "isRequired", e.target.checked)
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 text-sm text-gray-700">Required</label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Options */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="supportDelegation"
                    checked={formData.supportDelegation}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, supportDelegation: e.target.checked }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="supportDelegation" className="ml-2 text-sm text-gray-700">
                    Support Fallback for Delegation (REQ-009)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowHrOverride"
                    checked={formData.allowHrOverride}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, allowHrOverride: e.target.checked }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allowHrOverride" className="ml-2 text-sm text-gray-700">
                    Allow HR Override
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Escalation will automatically occur after the specified hours
                  if approval is not received. Delegation fallback allows requests to be routed to
                  alternate approvers when the primary approver is unavailable.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {editingConfig ? "Update Workflow" : "Create Workflow"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingConfig(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Workflows */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Approval Workflows</h2>
          </div>
          {configs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No approval workflows found. Create your first workflow.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {configs.map((config) => {
                const leaveType = leaveTypes.find((lt) => lt._id === config.leaveTypeId);
                return (
                  <div key={config._id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            {config.code}
                          </span>
                          {config.isActive ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        {leaveType && (
                          <p className="text-sm text-gray-600 mb-2">
                            Leave Type: {leaveType.name}
                          </p>
                        )}
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Approval Levels ({config.levels.length}):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {config.levels.map((level, index) => (
                              <div
                                key={index}
                                className="px-3 py-1 bg-blue-50 border border-blue-200 rounded text-sm"
                              >
                                <span className="font-medium">Level {level.level}:</span>{" "}
                                {level.type} ({level.escalationHours}h escalation)
                                {!level.isRequired && (
                                  <span className="text-gray-500 ml-1">(Optional)</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-4 text-sm text-gray-600">
                          {config.supportDelegation && (
                            <span className="flex items-center">
                              <span className="text-green-600 mr-1">✓</span> Delegation Support
                            </span>
                          )}
                          {config.allowHrOverride && (
                            <span className="flex items-center">
                              <span className="text-green-600 mr-1">✓</span> HR Override
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleEdit(config)}
                        className="ml-4 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

