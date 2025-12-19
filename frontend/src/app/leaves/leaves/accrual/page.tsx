"use client";
import api from "@/lib/axios";
import { useState, useEffect } from "react";

interface AccrualConfig {
  _id?: string;
  leaveTypeId?: string;
  accrualType: "monthly" | "quarterly" | "yearly";
  carryOverMax?: number;
  cycleResetDate?: string; // Date in format MM-DD
  stopAccrualDuringUnpaidLeave: boolean;
  previewNextCycle?: {
    currentBalance: number;
    nextCycleBalance: number;
    accrualAmount: number;
  };
}

interface LeaveType {
  _id: string;
  name: string;
  code: string;
}

export default function LeaveAccrualCarryoverPage() {
  const [configs, setConfigs] = useState<AccrualConfig[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<AccrualConfig | null>(null);
  const [formData, setFormData] = useState<AccrualConfig>({
    accrualType: "monthly",
    carryOverMax: undefined,
    cycleResetDate: undefined,
    stopAccrualDuringUnpaidLeave: true,
  });
  const [previewData, setPreviewData] = useState<any>(null);

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

      // Try to get accrual configs (may need to add this endpoint)
      const configsResponse = await api.get("/leaves/hr/accrual-configs").catch(() => {
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
      // Note: You may need to add POST /leaves/hr/accrual-configs endpoint
      await api.post("/leaves/hr/accrual-configs", formData).catch(() => {
        alert("Accrual configs endpoint not available. Please add POST /leaves/hr/accrual-configs endpoint.");
        return;
      });
      setShowForm(false);
      setFormData({
        accrualType: "monthly",
        carryOverMax: undefined,
        cycleResetDate: undefined,
        stopAccrualDuringUnpaidLeave: true,
      });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save accrual configuration");
    }
  };

  const handlePreview = async () => {
    try {
      // Note: You may need to add GET /leaves/hr/accrual-configs/preview endpoint
      const response = await api.post("/leaves/hr/accrual-configs/preview", formData).catch(() => {
        // Mock preview data for demonstration
        return {
          data: {
            currentBalance: 10,
            nextCycleBalance: 12.5,
            accrualAmount: 2.5,
          },
        };
      });
      setPreviewData(response.data);
      setSelectedConfig(formData);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to generate preview");
    }
  };

  const triggerAccrual = async (employeeId?: string) => {
    try {
      const response = await api.post("/leaves/hr/scheduler/accrual", {
        employeeId: employeeId || undefined,
      });
      alert(`Accrual triggered successfully. ${response.data?.processed || 0} employees processed.`);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to trigger accrual");
    }
  };

  const triggerCarryOver = async (year?: number) => {
    try {
      const response = await api.post("/leaves/hr/scheduler/carry-over", {
        year: year || new Date().getFullYear(),
      });
      alert(`Carry-over triggered successfully. ${response.data?.processed || 0} employees processed.`);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to trigger carry-over");
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
            <h1 className="text-3xl font-bold text-gray-900">Accrual, Carry-Over & Reset Settings</h1>
            <p className="text-gray-600 mt-2">Configure accrual types, carryover caps, and cycle reset dates</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Configure Accrual"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Accrual Configuration</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="leaveTypeId" className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type (Optional - leave empty for global config)
                  </label>
                  <select
                    id="leaveTypeId"
                    value={formData.leaveTypeId || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, leaveTypeId: e.target.value || undefined }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Global Configuration</option>
                    {leaveTypes.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name} ({type.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="accrualType" className="block text-sm font-medium text-gray-700 mb-2">
                    Accrual Type * (REQ-003)
                  </label>
                  <select
                    id="accrualType"
                    value={formData.accrualType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        accrualType: e.target.value as "monthly" | "quarterly" | "yearly",
                      }))
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="carryOverMax" className="block text-sm font-medium text-gray-700 mb-2">
                    Carryover Cap (Days) (REQ-040)
                  </label>
                  <input
                    type="number"
                    id="carryOverMax"
                    value={formData.carryOverMax || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        carryOverMax: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 5"
                  />
                </div>

                <div>
                  <label htmlFor="cycleResetDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Cycle Reset Date (MM-DD) (REQ-041)
                  </label>
                  <input
                    type="text"
                    id="cycleResetDate"
                    value={formData.cycleResetDate || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, cycleResetDate: e.target.value }))
                    }
                    pattern="\d{2}-\d{2}"
                    placeholder="MM-DD (e.g., 01-01)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: MM-DD (e.g., 01-01 for January 1st)</p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="stopAccrualDuringUnpaidLeave"
                  checked={formData.stopAccrualDuringUnpaidLeave}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stopAccrualDuringUnpaidLeave: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="stopAccrualDuringUnpaidLeave" className="ml-2 text-sm text-gray-700">
                  Stop Accrual During Unpaid Leave (BR 11)
                </label>
              </div>

              {/* Preview Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-blue-900">Preview Next Cycle Balance</h3>
                  <button
                    type="button"
                    onClick={handlePreview}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Calculate Preview
                  </button>
                </div>
                {previewData && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-white p-3 rounded">
                      <p className="text-xs text-gray-500">Current Balance</p>
                      <p className="text-lg font-semibold">{previewData.currentBalance} days</p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <p className="text-xs text-gray-500">Accrual Amount</p>
                      <p className="text-lg font-semibold text-green-600">
                        +{previewData.accrualAmount} days
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <p className="text-xs text-gray-500">Next Cycle Balance</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {previewData.nextCycleBalance} days
                      </p>
                    </div>
                  </div>
                )}
                {!previewData && (
                  <p className="text-sm text-blue-700">Click "Calculate Preview" to see projected balances</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Save Configuration
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setPreviewData(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Configurations */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Accrual Configurations</h2>
          </div>
          {configs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No accrual configurations found. Create your first configuration.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accrual Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carryover Cap
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reset Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stop During Unpaid
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {configs.map((config, index) => {
                  const leaveType = leaveTypes.find((lt) => lt._id === config.leaveTypeId);
                  return (
                    <tr key={config._id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leaveType?.name || "Global"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 capitalize">
                          {config.accrualType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {config.carryOverMax ? `${config.carryOverMax} days` : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {config.cycleResetDate || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {config.stopAccrualDuringUnpaidLeave ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Manual Triggers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Accrual Trigger</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Manually trigger the accrual process for all employees or a specific employee.
            </p>
            <button
              onClick={() => triggerAccrual()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Trigger Accrual (All Employees)
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Carryover Trigger</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Manually trigger the carryover process for the current year.
            </p>
            <button
              onClick={() => triggerCarryOver()}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Trigger Carryover ({new Date().getFullYear()})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
