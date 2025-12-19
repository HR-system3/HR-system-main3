"use client";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { toast } from "@/components/ui/Toast";
import ErrorModal from "@/components/ui/ErrorModal";

export default function ApprovalWorkflowPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    levels: [{ role: "manager", isRequired: true, escalationHours: 24, delegateEnabled: true, delegateUserId: "" }],
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await api.get("/leaves/hr/workflows");
      setWorkflows(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load workflows");
      toast.error("Failed to load approval workflows");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/leaves/hr/workflows", formData);
      toast.success("Approval workflow created successfully");
      setShowForm(false);
      fetchWorkflows();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create workflow");
    }
  };

  const addLevel = () => {
    setFormData({
      ...formData,
      levels: [...formData.levels, { role: "hr", isRequired: true, escalationHours: 24, delegateEnabled: true, delegateUserId: "" }],
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Approval Workflow Configuration</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "Create Workflow"}
        </button>
      </div>

      {error && (
        <ErrorModal
          isOpen={!!error}
          onClose={() => setError(null)}
          message={error}
          onRetry={fetchWorkflows}
        />
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Approval Workflow</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Leave Type ID</label>
              <input
                type="text"
                value={formData.leaveTypeId}
                onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Approval Levels</label>
              {formData.levels.map((level, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Role</label>
                      <select
                        value={level.role}
                        onChange={(e) => {
                          const newLevels = [...formData.levels];
                          newLevels[index].role = e.target.value;
                          setFormData({ ...formData, levels: newLevels });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="manager">Manager</option>
                        <option value="hr">HR</option>
                        <option value="director">Director</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Escalation Hours</label>
                      <input
                        type="number"
                        value={level.escalationHours}
                        onChange={(e) => {
                          const newLevels = [...formData.levels];
                          newLevels[index].escalationHours = parseInt(e.target.value);
                          setFormData({ ...formData, levels: newLevels });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={level.isRequired}
                      onChange={(e) => {
                        const newLevels = [...formData.levels];
                        newLevels[index].isRequired = e.target.checked;
                        setFormData({ ...formData, levels: newLevels });
                      }}
                      className="mr-2"
                    />
                    <span>Required</span>
                  </label>

                  {/* Delegation Configuration (REQ-023) */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <label className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={level.delegateEnabled !== undefined ? level.delegateEnabled : true}
                        onChange={(e) => {
                          const newLevels = [...formData.levels];
                          newLevels[index].delegateEnabled = e.target.checked;
                          setFormData({ ...formData, levels: newLevels });
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">Enable Delegation (REQ-023)</span>
                    </label>
                    
                    {(level.delegateEnabled !== false) && (
                      <div className="ml-6 mt-2">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Delegate User ID (optional)
                        </label>
                        <input
                          type="text"
                          placeholder="User ID or leave empty for auto-assignment"
                          value={level.delegateUserId || ""}
                          onChange={(e) => {
                            const newLevels = [...formData.levels];
                            newLevels[index].delegateUserId = e.target.value;
                            setFormData({ ...formData, levels: newLevels });
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          When the primary approver is absent, requests will be delegated to this user.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addLevel}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                + Add Level
              </button>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Create Workflow
            </button>
          </form>
        </div>
      )}

      {workflows.length === 0 ? (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">No approval workflows configured</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <div key={workflow._id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="font-semibold mb-2">Leave Type: {workflow.leaveTypeId}</h3>
              <div className="space-y-2">
                {workflow.levels?.map((level: any, index: number) => (
                  <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                    Level {index + 1}: {level.role} (Escalation: {level.escalationHours}h)
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

