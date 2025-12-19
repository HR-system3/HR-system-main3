'use client';

import React, { useState } from 'react';

interface UnfreezePayrollFormProps {
  runId: string;
  onUnfreeze: (runId: string, reason: string) => Promise<void>;
}

export default function UnfreezePayrollForm({ runId, onUnfreeze }: UnfreezePayrollFormProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    try {
      await onUnfreeze(runId, reason);
      setReason('');
    } catch (error) {
      console.error('Failed to unfreeze payroll:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Unfreeze
        </label>
        <textarea
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for unfreezing..."
          required
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        disabled={loading || !reason.trim()}
      >
        {loading ? 'Unfreezing...' : 'Unfreeze Payroll'}
      </button>
    </form>
  );
}
