"use client";
import api from "@/lib/axios";
import { useState, useEffect } from "react";

interface LeaveType {
  _id: string;
  name: string;
  code: string;
}

interface Entitlement {
  _id?: string;
  employeeId?: string;
  leaveTypeId: string;
  entitlementDays: number;
  accrualRatePerMonth?: number;
  carryOverMax?: number;
  expiryMonths?: number;
  // Rule builder fields (REQ-007)
  tenureMonths?: number;
  grade?: string;
  contractType?: string;
  vacationPackageId?: string;
}

interface VacationPackage {
  _id?: string;
  name: string;
  description?: string;
  entitlements: Array<{
    leaveTypeId: string;
    entitlementDays: number;
  }>;
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

export default function LeaveEntitlementRulesPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"rules" | "packages" | "overrides">("rules");
  const [showForm, setShowForm] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [formData, setFormData] = useState<Entitlement>({
    leaveTypeId: "",
    entitlementDays: 0,
    accrualRatePerMonth: undefined,
    carryOverMax: undefined,
    expiryMonths: undefined,
    tenureMonths: undefined,
    grade: "",
    contractType: "",
  });
  const [packageFormData, setPackageFormData] = useState<VacationPackage>({
    name: "",
    description: "",
    entitlements: [],
  });
  const [overrideFormData, setOverrideFormData] = useState<Entitlement & { employeeId: string }>({
    employeeId: "",
    leaveTypeId: "",
    entitlementDays: 0,
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

      // Try to get entitlements
      const entitlementsResponse = await api.get("/leaves/hr/entitlements").catch(() => {
        console.warn("Entitlements GET endpoint not available.");
        return { data: [] };
      });

      // Try to get employees (for overrides)
      const employeesResponse = await api.get("/employee-profile").catch(() => {
        return { data: [] };
      });

      setLeaveTypes(typesResponse.data || []);
      setEntitlements(entitlementsResponse.data || []);
      setEmployees(employeesResponse.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : name.includes("Days") || name.includes("Months") || name.includes("Rate") ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/leaves/hr/entitlements", formData);
      setShowForm(false);
      setFormData({
        leaveTypeId: "",
        entitlementDays: 0,
        accrualRatePerMonth: undefined,
        carryOverMax: undefined,
        expiryMonths: undefined,
        tenureMonths: undefined,
        grade: "",
        contractType: "",
      });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create entitlement rule");
    }
  };

  const handlePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Note: You may need to add a POST /leaves/hr/vacation-packages endpoint
      await api.post("/leaves/hr/vacation-packages", packageFormData).catch(() => {
        alert("Vacation packages endpoint not available. Please add POST /leaves/hr/vacation-packages endpoint.");
        return;
      });
      setShowPackageForm(false);
      setPackageFormData({ name: "", description: "", entitlements: [] });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create vacation package");
    }
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/leaves/hr/entitlements", overrideFormData);
      setShowOverrideForm(false);
      setOverrideFormData({
        employeeId: "",
        leaveTypeId: "",
        entitlementDays: 0,
      });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create employee override");
    }
  };

  const addPackageEntitlement = () => {
    setPackageFormData((prev) => ({
      ...prev,
      entitlements: [...prev.entitlements, { leaveTypeId: "", entitlementDays: 0 }],
    }));
  };

  const updatePackageEntitlement = (index: number, field: string, value: any) => {
    setPackageFormData((prev) => ({
      ...prev,
      entitlements: prev.entitlements.map((ent, i) =>
        i === index ? { ...ent, [field]: value } : ent
      ),
    }));
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
          <h1 className="text-3xl font-bold text-gray-900">Leave Entitlement Rules</h1>
          <p className="text-gray-600 mt-2">Configure entitlement rules, packages, and employee overrides</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("rules")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "rules"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Rule Builder
            </button>
            <button
              onClick={() => setActiveTab("packages")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "packages"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Vacation Packages
            </button>
            <button
              onClick={() => setActiveTab("overrides")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overrides"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Employee Overrides
            </button>
          </nav>
        </div>

        {/* Rule Builder Tab */}
        {activeTab === "rules" && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Entitlement Rules</h2>
                <p className="text-gray-600 text-sm mt-1">Define rules by tenure, grade, or contract type</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {showForm ? "Cancel" : "+ Add Rule"}
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">New Entitlement Rule</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="leaveTypeId" className="block text-sm font-medium text-gray-700 mb-2">
                        Leave Type *
                      </label>
                      <select
                        id="leaveTypeId"
                        name="leaveTypeId"
                        value={formData.leaveTypeId}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, leaveTypeId: e.target.value }))
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select leave type</option>
                        {leaveTypes.map((type) => (
                          <option key={type._id} value={type._id}>
                            {type.name} ({type.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="entitlementDays" className="block text-sm font-medium text-gray-700 mb-2">
                        Entitlement Days *
                      </label>
                      <input
                        type="number"
                        id="entitlementDays"
                        name="entitlementDays"
                        value={formData.entitlementDays}
                        onChange={handleChange}
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Rule Builder Fields (REQ-007) */}
                    <div>
                      <label htmlFor="tenureMonths" className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Tenure (Months)
                      </label>
                      <input
                        type="number"
                        id="tenureMonths"
                        name="tenureMonths"
                        value={formData.tenureMonths || ""}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 12"
                      />
                    </div>

                    <div>
                      <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                        Grade
                      </label>
                      <input
                        type="text"
                        id="grade"
                        name="grade"
                        value={formData.grade || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., A1, B2, C3"
                      />
                    </div>

                    <div>
                      <label htmlFor="contractType" className="block text-sm font-medium text-gray-700 mb-2">
                        Contract Type
                      </label>
                      <select
                        id="contractType"
                        name="contractType"
                        value={formData.contractType || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Contract Types</option>
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Temporary">Temporary</option>
                        <option value="Intern">Intern</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="accrualRatePerMonth" className="block text-sm font-medium text-gray-700 mb-2">
                        Accrual Rate Per Month
                      </label>
                      <input
                        type="number"
                        id="accrualRatePerMonth"
                        name="accrualRatePerMonth"
                        value={formData.accrualRatePerMonth || ""}
                        onChange={handleChange}
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="carryOverMax" className="block text-sm font-medium text-gray-700 mb-2">
                        Max Carry Over Days
                      </label>
                      <input
                        type="number"
                        id="carryOverMax"
                        name="carryOverMax"
                        value={formData.carryOverMax || ""}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="expiryMonths" className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry (Months)
                      </label>
                      <input
                        type="number"
                        id="expiryMonths"
                        name="expiryMonths"
                        value={formData.expiryMonths || ""}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Rule Builder:</strong> Leave fields empty to apply to all employees. Fill specific fields to create targeted rules.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Create Rule
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entitlement Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenure (Months)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contract Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accrual Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entitlements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No entitlement rules found. Create your first rule.
                      </td>
                    </tr>
                  ) : (
                    entitlements.map((entitlement, index) => {
                      const leaveType = leaveTypes.find((lt) => lt._id === entitlement.leaveTypeId);
                      return (
                        <tr key={entitlement._id || index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {leaveType?.name || "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {entitlement.entitlementDays} days
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {entitlement.tenureMonths || "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {entitlement.grade || "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {entitlement.contractType || "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {entitlement.accrualRatePerMonth || "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vacation Packages Tab */}
        {activeTab === "packages" && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Vacation Packages</h2>
                <p className="text-gray-600 text-sm mt-1">Define pre-configured vacation packages</p>
              </div>
              <button
                onClick={() => setShowPackageForm(!showPackageForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {showPackageForm ? "Cancel" : "+ Create Package"}
              </button>
            </div>

            {showPackageForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">New Vacation Package</h3>
                <form onSubmit={handlePackageSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="packageName" className="block text-sm font-medium text-gray-700 mb-2">
                      Package Name *
                    </label>
                    <input
                      type="text"
                      id="packageName"
                      value={packageFormData.name}
                      onChange={(e) =>
                        setPackageFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Standard Package, Executive Package"
                    />
                  </div>

                  <div>
                    <label htmlFor="packageDescription" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="packageDescription"
                      value={packageFormData.description}
                      onChange={(e) =>
                        setPackageFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Package Entitlements
                      </label>
                      <button
                        type="button"
                        onClick={addPackageEntitlement}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        + Add Entitlement
                      </button>
                    </div>
                    {packageFormData.entitlements.map((ent, index) => (
                      <div key={index} className="grid grid-cols-2 gap-4 mb-2">
                        <select
                          value={ent.leaveTypeId}
                          onChange={(e) =>
                            updatePackageEntitlement(index, "leaveTypeId", e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select leave type</option>
                          {leaveTypes.map((type) => (
                            <option key={type._id} value={type._id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={ent.entitlementDays}
                            onChange={(e) =>
                              updatePackageEntitlement(
                                index,
                                "entitlementDays",
                                Number(e.target.value)
                              )
                            }
                            min="0"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Days"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPackageFormData((prev) => ({
                                ...prev,
                                entitlements: prev.entitlements.filter((_, i) => i !== index),
                              }))
                            }
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Create Package
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPackageForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-center">
                Vacation packages will be listed here once the backend endpoint is available.
              </p>
            </div>
          </div>
        )}

        {/* Employee Overrides Tab */}
        {activeTab === "overrides" && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Employee Overrides</h2>
                <p className="text-gray-600 text-sm mt-1">Personalized entitlement overrides per employee</p>
              </div>
              <button
                onClick={() => setShowOverrideForm(!showOverrideForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {showOverrideForm ? "Cancel" : "+ Add Override"}
              </button>
            </div>

            {showOverrideForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">New Employee Override</h3>
                <form onSubmit={handleOverrideSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="overrideEmployeeId" className="block text-sm font-medium text-gray-700 mb-2">
                        Employee *
                      </label>
                      <select
                        id="overrideEmployeeId"
                        value={overrideFormData.employeeId}
                        onChange={(e) =>
                          setOverrideFormData((prev) => ({ ...prev, employeeId: e.target.value }))
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select employee</option>
                        {employees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.firstName} {emp.lastName} ({emp.employeeId})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="overrideLeaveTypeId" className="block text-sm font-medium text-gray-700 mb-2">
                        Leave Type *
                      </label>
                      <select
                        id="overrideLeaveTypeId"
                        value={overrideFormData.leaveTypeId}
                        onChange={(e) =>
                          setOverrideFormData((prev) => ({ ...prev, leaveTypeId: e.target.value }))
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select leave type</option>
                        {leaveTypes.map((type) => (
                          <option key={type._id} value={type._id}>
                            {type.name} ({type.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="overrideEntitlementDays" className="block text-sm font-medium text-gray-700 mb-2">
                        Entitlement Days *
                      </label>
                      <input
                        type="number"
                        id="overrideEntitlementDays"
                        value={overrideFormData.entitlementDays}
                        onChange={(e) =>
                          setOverrideFormData((prev) => ({
                            ...prev,
                            entitlementDays: Number(e.target.value),
                          }))
                        }
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Create Override
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOverrideForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entitlement Days
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entitlements
                    .filter((e) => e.employeeId)
                    .length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                        No employee overrides found. Create your first override.
                      </td>
                    </tr>
                  ) : (
                    entitlements
                      .filter((e) => e.employeeId)
                      .map((entitlement, index) => {
                        const leaveType = leaveTypes.find((lt) => lt._id === entitlement.leaveTypeId);
                        const employee = employees.find((e) => e._id === entitlement.employeeId);
                        return (
                          <tr key={entitlement._id || index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {employee
                                ? `${employee.firstName} ${employee.lastName}`
                                : entitlement.employeeId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {leaveType?.name || "Unknown"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {entitlement.entitlementDays} days
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
