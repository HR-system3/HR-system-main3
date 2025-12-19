'use client';

import React, { useState } from 'react';

interface DistributePayslipsButtonProps {
  runId: string;
  onDistribute: (runId: string) => Promise<void>;
}

export default function DistributePayslipsButton({ runId, onDistribute }: DistributePayslipsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDistribute = async () => {
    setLoading(true);
    try {
      await onDistribute(runId);
      setShowConfirm(false);
    } catch (error) {
      console.error('Failed to distribute payslips:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Confirm Distribution</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to distribute payslips for this run? This action cannot be undone.
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
              onClick={handleDistribute}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Distributing...' : 'Distribute'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      Distribute Payslips
    </button>
  );
}
