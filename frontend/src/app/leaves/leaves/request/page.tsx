"use client";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/Toast";
import ValidationAlert from "@/components/ui/ValidationAlert";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { leavesService } from "@/services/api/leaves.service";

export default function RequestLeavePage() {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    leaveTypeId: "",
    justification: "",
  });
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<{overlap?: string[], blockedPeriods?: string[], teamConflicts?: string[]}>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWarningConfirm, setShowWarningConfirm] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState<number>(0);
  const [balance, setBalance] = useState<any>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [excessConversion, setExcessConversion] = useState<{show: boolean, paidDays: number, unpaidDays: number}>({
    show: false,
    paidDays: 0,
    unpaidDays: 0,
  });
  const [allowUnpaidConversion, setAllowUnpaidConversion] = useState(false);

  useEffect(() => {
    fetchLeaveTypes();
    fetchBalance();
  }, []);

  // Auto-calculate days when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      calculateLeaveDays(formData.startDate, formData.endDate);
    } else {
      setCalculatedDays(0);
      setExcessConversion({ show: false, paidDays: 0, unpaidDays: 0 });
    }
  }, [formData.startDate, formData.endDate]);

  // Check for excess leave conversion when days or balance changes
  useEffect(() => {
    if (calculatedDays > 0 && balance) {
      const remainingBalance = balance.remaining || 0;
      if (calculatedDays > remainingBalance) {
        // Excess detected - show conversion option
        setExcessConversion({
          show: true,
          paidDays: remainingBalance,
          unpaidDays: calculatedDays - remainingBalance,
        });
      } else {
        setExcessConversion({ show: false, paidDays: 0, unpaidDays: 0 });
        setAllowUnpaidConversion(false);
      }
    }
  }, [calculatedDays, balance]);

  const fetchLeaveTypes = async () => {
    try {
      const data = await leavesService.getHrTypes();
      setLeaveTypes(data);
    } catch (err: any) {
      toast.error("Failed to load leave types");
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    setBalanceLoading(true);
    try {
      const data = await leavesService.getEmployeeBalance();
      setBalance(data);
    } catch (err: any) {
      console.error("Failed to load balance:", err);
    } finally {
      setBalanceLoading(false);
    }
  };

  const calculateLeaveDays = async (startDate: string, endDate: string) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Calculate business days (excluding weekends)
      let days = 0;
      const current = new Date(start);
      
      while (current <= end) {
        const dayOfWeek = current.getDay();
        // Exclude Saturday (6) and Sunday (0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          days++;
        }
        current.setDate(current.getDate() + 1);
      }
      
      // Try to get holidays from backend to exclude them
      try {
        const holidaysData = await leavesService.getHolidays();
        
        if (holidaysData && Array.isArray(holidaysData)) {
          // Count holidays that fall within the date range and aren't weekends
          const holidaysInRange = holidaysData.filter((holiday: any) => {
            const holidayDate = new Date(holiday.date);
            const dayOfWeek = holidayDate.getDay();
            return holidayDate >= start && holidayDate <= end && dayOfWeek !== 0 && dayOfWeek !== 6;
          });
          days -= holidaysInRange.length;
        }
      } catch (err) {
        // If holidays endpoint fails, just use business days
        console.log("Holidays not available, using business days only");
      }
      
      setCalculatedDays(Math.max(0, days));
    } catch (error) {
      console.error("Error calculating days:", error);
      setCalculatedDays(0);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.startDate || !formData.endDate) {
      errors.push("Please select both start and end dates");
    } else {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        errors.push("Start date cannot be in the past");
      }
      if (end < start) {
        errors.push("End date must be after start date");
      }
    }

    if (!formData.leaveTypeId) {
      errors.push("Please select a leave type");
    }

    if (!formData.justification || formData.justification.trim().length < 10) {
      errors.push("Justification must be at least 10 characters");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const checkBackendValidation = async () => {
    try {
      const response = await leavesService.validateLeaveRequest({
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        leaveTypeId: formData.leaveTypeId,
      });
      
      // If backend returns warnings, show them
      if (response && response.warnings) {
        setValidationWarnings(response.warnings);
        if (response.warnings.overlap?.length > 0 || 
            response.warnings.blockedPeriods?.length > 0 || 
            response.warnings.teamConflicts?.length > 0) {
          setShowWarningConfirm(true);
          return false;
        }
      }
      
      return true;
    } catch (error: any) {
      // If validation fails, show errors
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
        return false;
      }
      // If endpoint doesn't exist yet, proceed (development mode)
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.warning("Please fix validation errors");
      return;
    }

    // Check backend validation for warnings
    if (!showWarningConfirm) {
      const canProceed = await checkBackendValidation();
      if (!canProceed) {
        return;
      }
    }

    // Check if excess conversion is needed but not acknowledged
    if (excessConversion.show && !allowUnpaidConversion) {
      toast.error("Please adjust your request or allow unpaid conversion");
      return;
    }

    setSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        // Include conversion data if applicable
        ...(excessConversion.show && allowUnpaidConversion ? {
          splitLeave: true,
          paidDays: excessConversion.paidDays,
          unpaidDays: excessConversion.unpaidDays,
        } : {}),
      };

      await leavesService.createLeaveRequest(submitData);
      
      // Handle file uploads if any
      if (attachments.length > 0) {
        // TODO: Implement file upload endpoint
        toast.info("File upload feature coming soon");
      }

      toast.success("Leave request submitted successfully");
      setFormData({ startDate: "", endDate: "", leaveTypeId: "", justification: "" });
      setAttachments([]);
      setValidationErrors([]);
      setValidationWarnings({});
      setShowWarningConfirm(false);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to submit leave request";
      toast.error(errorMsg);
      
      // Handle specific validation errors from backend
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Request Leave</h1>
      
      {validationErrors.length > 0 && (
        <div className="mb-6 space-y-2">
          {validationErrors.map((error, index) => (
            <ValidationAlert key={index} type="error" message={error} />
          ))}
        </div>
      )}

      {/* Backend Validation Warnings */}
      {showWarningConfirm && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-6">
          <div className="flex items-start mb-4">
            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Validation Warnings
              </h3>
              
              {validationWarnings.overlap && validationWarnings.overlap.length > 0 && (
                <div className="mb-3">
                  <p className="font-medium text-yellow-700 dark:text-yellow-300 mb-1">Overlapping Leave Requests:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-600 dark:text-yellow-400">
                    {validationWarnings.overlap.map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validationWarnings.blockedPeriods && validationWarnings.blockedPeriods.length > 0 && (
                <div className="mb-3">
                  <p className="font-medium text-yellow-700 dark:text-yellow-300 mb-1">Blocked Periods:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-600 dark:text-yellow-400">
                    {validationWarnings.blockedPeriods.map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validationWarnings.teamConflicts && validationWarnings.teamConflicts.length > 0 && (
                <div className="mb-3">
                  <p className="font-medium text-yellow-700 dark:text-yellow-300 mb-1">Team Conflicts:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-600 dark:text-yellow-400">
                    {validationWarnings.teamConflicts.map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-4">
                Do you want to proceed with this leave request despite these warnings?
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setShowWarningConfirm(false);
                setValidationWarnings({});
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md"
            >
              Proceed Anyway
            </button>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      {/* Balance Display */}
      {balance && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">Your Leave Balance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-blue-700 dark:text-blue-300">Accrued</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{balance.accrued || 0} days</p>
            </div>
            <div>
              <p className="text-blue-700 dark:text-blue-300">Taken</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{balance.taken || 0} days</p>
            </div>
            <div>
              <p className="text-blue-700 dark:text-blue-300">Remaining</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">{balance.remaining || 0} days</p>
            </div>
            <div>
              <p className="text-blue-700 dark:text-blue-300">Carryover</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{balance.carryover || 0} days</p>
            </div>
          </div>
          {calculatedDays > 0 && !excessConversion.show && (
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Requesting: <span className="font-bold text-blue-900 dark:text-blue-100">{calculatedDays} days</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Excess Leave Conversion (BR-29) */}
      {excessConversion.show && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-400 dark:border-orange-600 rounded-lg p-6">
          <div className="flex items-start mb-4">
            <svg className="w-6 h-6 text-orange-600 dark:text-orange-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-200 mb-2">
                Excess Leave Detected (BR-29)
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-300 mb-4">
                Your request exceeds your available balance. You have two options:
              </p>
              
              {/* Option 1: Convert to Partial Unpaid */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3">
                <div className="flex items-start mb-3">
                  <input
                    type="radio"
                    id="convertOption"
                    name="excessOption"
                    checked={allowUnpaidConversion}
                    onChange={() => setAllowUnpaidConversion(true)}
                    className="mt-1 mr-3"
                  />
                  <label htmlFor="convertOption" className="flex-1">
                    <span className="font-semibold text-gray-900 dark:text-white">Convert excess to unpaid leave</span>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Paid Leave</p>
                          <p className="text-xl font-bold text-green-600">{excessConversion.paidDays} days</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Unpaid Leave</p>
                          <p className="text-xl font-bold text-red-600">{excessConversion.unpaidDays} days</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        ⚠️ Unpaid leave will not be paid in your salary for those days.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Option 2: Adjust Request */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-start">
                  <input
                    type="radio"
                    id="adjustOption"
                    name="excessOption"
                    checked={!allowUnpaidConversion}
                    onChange={() => setAllowUnpaidConversion(false)}
                    className="mt-1 mr-3"
                  />
                  <label htmlFor="adjustOption" className="flex-1">
                    <span className="font-semibold text-gray-900 dark:text-white">Adjust your request to match available balance</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Modify your dates to request only <strong>{excessConversion.paidDays} days</strong> of paid leave.
                    </p>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        <div>
          <label htmlFor="leaveTypeId" className="block text-sm font-medium mb-2">
            Leave Type
          </label>
          <select
            id="leaveTypeId"
            value={formData.leaveTypeId}
            onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select leave type</option>
            {leaveTypes.map((type) => (
              <option key={type._id} value={type._id}>
                {type.name} ({type.maxDays || type.maxDurationDays || "N/A"} days max)
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-2">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Calculated Days Display */}
        {calculatedDays > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Leave Days</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{calculatedDays} days</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  (Excluding weekends and public holidays)
                </p>
              </div>
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="justification" className="block text-sm font-medium mb-2">
            Justification
          </label>
          <textarea
            id="justification"
            value={formData.justification}
            onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
            required
            rows={4}
            placeholder="Please provide a detailed reason for your leave request..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Minimum 10 characters required
          </p>
        </div>

        <div>
          <label htmlFor="attachments" className="block text-sm font-medium mb-2">
            Attachments (Optional)
          </label>
          <input
            type="file"
            id="attachments"
            multiple
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {attachments.map((file, index) => (
                <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
                  {file.name}
                </p>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
