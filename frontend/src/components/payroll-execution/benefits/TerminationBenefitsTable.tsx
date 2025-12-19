'use client';

import React from 'react';
import { Benefit } from '@/types/benefit.types';
import Money from '../shared/Money';
import ApproveBenefitButton from './ApproveBenefitButton';

interface TerminationBenefitsTableProps {
  benefits: Benefit[];
  onApprove: (id: string) => Promise<void>;
}

export default function TerminationBenefitsTable({ benefits, onApprove }: TerminationBenefitsTableProps) {
  if (benefits.length === 0) {
    return <p className="text-sm text-gray-500">No termination benefits found</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {benefits.map((benefit) => (
            <tr key={benefit._id}>
              <td className="px-4 py-2 text-sm text-gray-900">
                {benefit.employeeName || benefit.employeeId}
              </td>
              <td className="px-4 py-2 text-sm text-gray-900 text-right">
                <Money amount={benefit.amount} />
              </td>
              <td className="px-4 py-2 text-sm">
                <span className={`px-2 py-1 text-xs rounded ${
                  benefit.status === 'approved' ? 'bg-green-100 text-green-800' :
                  benefit.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {benefit.status}
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-right">
                {benefit.status === 'pending' && (
                  <ApproveBenefitButton benefitId={benefit._id} onApprove={onApprove} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
