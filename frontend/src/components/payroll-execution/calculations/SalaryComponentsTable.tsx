'use client';

import React from 'react';
import { CalculationDetail } from '@/types/payroll-calculation.types';
import Money from '../shared/Money';

interface SalaryComponentsTableProps {
  calculation: CalculationDetail;
}

export default function SalaryComponentsTable({ calculation }: SalaryComponentsTableProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Base Salary</p>
          <p className="text-lg font-semibold text-gray-900">
            <Money amount={calculation.baseSalary} />
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Gross</p>
          <p className="text-lg font-semibold text-gray-900">
            <Money amount={calculation.totalGross} />
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Deductions</p>
          <p className="text-lg font-semibold text-red-600">
            <Money amount={calculation.totalDeductions} />
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Net Pay</p>
          <p className="text-lg font-semibold text-green-600">
            <Money amount={calculation.netPay} />
          </p>
        </div>
      </div>
    </div>
  );
}
