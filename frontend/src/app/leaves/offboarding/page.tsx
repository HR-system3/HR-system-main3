"use client";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { toast } from "@/components/ui/Toast";
import ErrorModal from "@/components/ui/ErrorModal";

export default function OffboardingPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [settlement, setSettlement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPayrollConfirm, setShowPayrollConfirm] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      // TODO: Replace with actual endpoint
      // const response = await api.get("/leaves/hr/offboarding/employees");
      setEmployees([]);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load employees");
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const calculateSettlement = async (employee: any) => {
    try {
      setSelectedEmployee(employee);
      
      // Mock settlement calculation with encashment formula
      // In production, this would call: const response = await api.get(`/leaves/hr/offboarding/settlement/${employee._id}`);
      const remainingDays = (employee.accruedDays || 15) + (employee.carriedDays || 5) - (employee.takenDays || 8);
      const dailyRate = employee.dailyRate || 200;
      const encashmentPercentage = 100; // 100% encashment on termination
      const encashableDays = remainingDays;
      const amount = encashableDays * dailyRate * (encashmentPercentage / 100);
      
      const mockSettlement = {
        employeeId: employee._id,
        employeeName: employee.name,
        accruedDays: employee.accruedDays || 15,
        carriedDays: employee.carriedDays || 5,
        takenDays: employee.takenDays || 8,
        remainingDays,
        dailyRate,
        encashmentPercentage,
        encashableDays,
        amount,
        formula: "Encashment = (Accrued + Carried - Taken) × Daily Rate × Encashment %",
        calculationBreakdown: [
          { label: "Accrued Days", value: employee.accruedDays || 15 },
          { label: "Carried Over Days", value: employee.carriedDays || 5 },
          { label: "Taken Days", value: -(employee.takenDays || 8) },
          { label: "Remaining Days", value: remainingDays },
          { label: "Daily Rate ($)", value: dailyRate },
          { label: "Encashment %", value: encashmentPercentage },
        ],
      };
      
      setSettlement(mockSettlement);
      toast.success("Settlement calculated successfully");
    } catch (err: any) {
      toast.error("Failed to calculate settlement");
    }
  };

  const syncWithPayroll = async () => {
    if (!settlement) return;
    
    setSyncing(true);
    try {
      // In production: await api.post('/leaves/hr/offboarding/sync-payroll', settlement);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      toast.success("Settlement synced with payroll successfully");
      setShowPayrollConfirm(false);
      setSettlement(null);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (err: any) {
      toast.error("Failed to sync with payroll");
    } finally {
      setSyncing(false);
    }
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
      <h1 className="text-3xl font-bold mb-6">Offboarding Leave Settlement</h1>

      {error && (
        <ErrorModal
          isOpen={!!error}
          onClose={() => setError(null)}
          message={error}
          onRetry={fetchEmployees}
        />
      )}

      {/* Employee Search & List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Employee Leave Settlement</h2>
        
        {/* Mock employee for demonstration */}
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Demo Mode:</strong> Click "Calculate Settlement" below to see the encashment formula and payroll sync features.
          </p>
        </div>

        {/* Mock employee entry */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-700 pb-4 gap-3">
            <div>
              <p className="font-medium text-lg">John Doe (Demo Employee)</p>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                <p>Accrued Days: 15 | Carried Over: 5 | Taken: 8</p>
                <p>Daily Rate: $200</p>
              </div>
            </div>
            <button
              onClick={() => calculateSettlement({ 
                _id: "demo123", 
                name: "John Doe", 
                accruedDays: 15, 
                carriedDays: 5, 
                takenDays: 8,
                dailyRate: 200 
              })}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
            >
              Calculate Settlement
            </button>
          </div>
        </div>

        {employees.length === 0 && !settlement && (
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            No other employees pending offboarding
          </p>
        )}
      </div>

      {/* Settlement Details with Encashment Formula */}
      {settlement && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">Settlement Details - {settlement.employeeName}</h3>
            <button
              onClick={() => {
                setSettlement(null);
                setSelectedEmployee(null);
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Encashment Formula */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Encashment Formula</h4>
            <p className="text-sm text-blue-800 dark:text-blue-300 font-mono bg-white dark:bg-gray-800 p-2 rounded">
              {settlement.formula}
            </p>
          </div>

          {/* Calculation Breakdown */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Calculation Breakdown</h4>
            <div className="space-y-2">
              {settlement.calculationBreakdown.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                  <span className={`font-semibold ${item.value < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Final Encashment Amount */}
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-1">Total Encashable Days</p>
                <p className="text-3xl font-bold text-green-800 dark:text-green-200">{settlement.encashableDays} days</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-700 dark:text-green-300 mb-1">Encashment Amount</p>
                <p className="text-3xl font-bold text-green-800 dark:text-green-200">${settlement.amount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Payroll Sync Button */}
          <div className="flex justify-end">
            <button 
              onClick={() => setShowPayrollConfirm(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
            >
              Sync with Payroll System
            </button>
          </div>
        </div>
      )}

      {/* Payroll Sync Confirmation Modal */}
      {showPayrollConfirm && settlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-xl font-semibold mb-4">Confirm Payroll Sync</h3>
            
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                <strong>You are about to sync the following settlement to the payroll system:</strong>
              </p>
              <div className="text-sm space-y-1 text-yellow-700 dark:text-yellow-300">
                <p>Employee: <strong>{settlement.employeeName}</strong></p>
                <p>Encashable Days: <strong>{settlement.encashableDays} days</strong></p>
                <p>Amount: <strong>${settlement.amount.toFixed(2)}</strong></p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This action will create a payroll entry for the leave encashment. The employee will receive this amount in their final paycheck. This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPayrollConfirm(false)}
                disabled={syncing}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={syncWithPayroll}
                disabled={syncing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? "Syncing..." : "Confirm & Sync"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

