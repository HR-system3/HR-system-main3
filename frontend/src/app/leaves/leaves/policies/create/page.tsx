"use client";
import api from "@/lib/axios";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateLeavePolicyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    isPaid: true,
    deductsFromBalance: true, // New field for REQ-006
    requiresAttachment: false,
    attachmentType: "",
    minTenureMonths: "",
    maxDurationDays: "",
    allowPostLeaveSubmission: false,
    pauseAccrual: false,
    payrollPayCode: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? value === ""
              ? ""
              : Number(value)
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        minTenureMonths: formData.minTenureMonths ? Number(formData.minTenureMonths) : undefined,
        maxDurationDays: formData.maxDurationDays ? Number(formData.maxDurationDays) : undefined,
      };
      await api.post("/leaves/hr/types", payload);
      router.push("/leaves/types");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create leave policy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Leave Policy</h1>
          <p className="text-gray-600 mt-2">Configure a new leave type policy</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
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
                placeholder="e.g., ANNUAL, SICK"
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
                placeholder="e.g., Annual Leave"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                <option value="Annual">Annual</option>
                <option value="Sick">Sick</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Personal">Personal</option>
                <option value="Maternity">Maternity</option>
                <option value="Paternity">Paternity</option>
                <option value="Bereavement">Bereavement</option>
                <option value="Study">Study</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="payrollPayCode" className="block text-sm font-medium text-gray-700 mb-2">
                Payroll Pay Code
              </label>
              <input
                type="text"
                id="payrollPayCode"
                name="payrollPayCode"
                value={formData.payrollPayCode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="minTenureMonths" className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Tenure (Months)
              </label>
              <input
                type="number"
                id="minTenureMonths"
                name="minTenureMonths"
                value={formData.minTenureMonths}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="maxDurationDays" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Duration (Days)
              </label>
              <input
                type="number"
                id="maxDurationDays"
                name="maxDurationDays"
                value={formData.maxDurationDays}
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
                checked={formData.deductsFromBalance}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="deductsFromBalance" className="ml-2 text-sm text-gray-700">
                Deducts from Balance (REQ-006)
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

            {formData.requiresAttachment && (
              <div>
                <label htmlFor="attachmentType" className="block text-sm font-medium text-gray-700 mb-2">
                  Attachment Type
                </label>
                <input
                  type="text"
                  id="attachmentType"
                  name="attachmentType"
                  value={formData.attachmentType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., medical_certificate"
                />
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowPostLeaveSubmission"
                name="allowPostLeaveSubmission"
                checked={formData.allowPostLeaveSubmission}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowPostLeaveSubmission" className="ml-2 text-sm text-gray-700">
                Allow Post-Leave Submission
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
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Policy"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

