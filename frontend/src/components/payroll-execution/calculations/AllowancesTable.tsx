'use client';

import React from 'react';
import { SalaryComponent } from '@/types/payroll-calculation.types';
import Money from '../shared/Money';

interface AllowancesTableProps {
  allowances: SalaryComponent[];
}

export default function AllowancesTable({ allowances }: AllowancesTableProps) {
  if (allowances.length === 0) {
    return <p className="text-sm text-gray-500">No allowances</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {allowances.map((allowance, index) => (
            <tr key={index}>
              <td className="px-4 py-2 text-sm text-gray-900">{allowance.name}</td>
              <td className="px-4 py-2 text-sm text-gray-900 text-right">
                <Money amount={allowance.amount} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
