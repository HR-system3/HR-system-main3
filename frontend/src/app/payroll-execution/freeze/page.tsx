'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FreezePayrollButton from '@/components/payroll-execution/freeze/FreezePayrollButton';
import { payrollRunService } from '@/services/api/payroll-run.service';

export default function FreezePage() {
  const router = useRouter();
  const [runId, setRunId] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleFreeze = async (id: string) => {
    try {
      await payrollRunService.lockRun(id, 'current-user-id');
      setMessage('Payroll run frozen successfully');
      setTimeout(() => router.push('/payroll-execution'), 2000);
    } catch (error) {
      console.error('Failed to freeze payroll:', error);
      setMessage('Failed to freeze payroll run');
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Freeze Payroll</h1>
        <p className="text-sm text-gray-500">Lock a payroll run to prevent further changes</p>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Run ID
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={runId}
            onChange={(e) => setRunId(e.target.value)}
            placeholder="Enter payroll run ID..."
          />
        </div>
        {message && (
          <div className={`p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}
        {runId && (
          <FreezePayrollButton runId={runId} onFreeze={handleFreeze} />
        )}
      </div>
    </div>
  );
}
