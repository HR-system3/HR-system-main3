'use client';

import React, { useState } from 'react';
import SalaryComponentsTable from '@/components/payroll-execution/calculations/SalaryComponentsTable';
import AllowancesTable from '@/components/payroll-execution/calculations/AllowancesTable';
import DeductionsTable from '@/components/payroll-execution/calculations/DeductionsTable';
import StatutoryContributions from '@/components/payroll-execution/calculations/StatutoryContributions';
import ProrationDetails from '@/components/payroll-execution/calculations/ProrationDetails';
import { CalculationDetail } from '@/types/payroll-calculation.types';

export default function CalculationsPage() {
  const [runId, setRunId] = useState('');
  // Placeholder calculation - replace with actual API call
  const calculation: CalculationDetail | null = null;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Calculations</h1>
        <p className="text-sm text-gray-500">View detailed calculation breakdowns</p>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
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
        {calculation ? (
          <div className="space-y-6">
            <SalaryComponentsTable calculation={calculation} />
            <AllowancesTable allowances={calculation.allowances} />
            <DeductionsTable deductions={calculation.deductions} />
            <StatutoryContributions taxes={calculation.taxes} insurances={calculation.insurances} />
            <ProrationDetails factor={calculation.prorationFactor} reason={calculation.prorationReason} />
          </div>
        ) : (
          <p className="text-gray-500">Enter a run ID to view calculations</p>
        )}
      </div>
    </div>
  );
}
