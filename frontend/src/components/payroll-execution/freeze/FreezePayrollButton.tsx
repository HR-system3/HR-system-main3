'use client';

import React, { useState } from 'react';

interface FreezePayrollButtonProps {
  runId: string;
  onFreeze: (runId: string) => Promise<void>;
}

export default function FreezePayrollButton({ runId, onFreeze }: FreezePayrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleFreeze = async () => {
    setLoading(true);
    try {
      await onFreeze(runId);
      setShowConfirm(false);
    } catch (error) {
      console.error('Failed to freeze payroll:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Confirm Freeze</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to freeze this payroll run? No further changes will be allowed.
            </p>
          </div>
          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleFreeze}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              disabled={loading}
            >
              {loading ? 'Freezing...' : 'Freeze'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
    >
      Freeze Payroll
    </button>
  );
}
