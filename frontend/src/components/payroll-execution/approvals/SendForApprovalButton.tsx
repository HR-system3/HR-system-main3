'use client';

import React, { useState } from 'react';

interface SendForApprovalButtonProps {
  runId: string;
  onSend: (runId: string, managerId: string, financeStaffId: string) => Promise<void>;
}

export default function SendForApprovalButton({ runId, onSend }: SendForApprovalButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [managerId, setManagerId] = useState('');
  const [financeStaffId, setFinanceStaffId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!managerId.trim() || !financeStaffId.trim()) return;
    setLoading(true);
    try {
      await onSend(runId, managerId, financeStaffId);
      setShowModal(false);
      setManagerId('');
      setFinanceStaffId('');
    } catch (error) {
      console.error('Failed to send for approval:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Send for Approval</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manager ID
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                placeholder="Enter manager ID..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finance Staff ID
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={financeStaffId}
                onChange={(e) => setFinanceStaffId(e.target.value)}
                placeholder="Enter finance staff ID..."
                required
              />
            </div>
          </div>
          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={loading || !managerId.trim() || !financeStaffId.trim()}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowModal(true)}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Send for Approval
    </button>
  );
}
