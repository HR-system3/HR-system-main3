'use client';

import React from 'react';
import { SigningBonus } from '@/types/bonus.types';
import Money from '../shared/Money';
import ApproveSigningBonusButton from './ApproveSigningBonusButton';

interface SigningBonusTableProps {
  bonuses: SigningBonus[];
  onApprove: (id: string) => Promise<void>;
}

export default function SigningBonusTable({ bonuses, onApprove }: SigningBonusTableProps) {
  if (bonuses.length === 0) {
    return <p className="text-sm text-gray-500">No signing bonuses found</p>;
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
          {bonuses.map((bonus) => (
            <tr key={bonus._id}>
              <td className="px-4 py-2 text-sm text-gray-900">
                {bonus.employeeName || bonus.employeeId}
              </td>
              <td className="px-4 py-2 text-sm text-gray-900 text-right">
                <Money amount={bonus.amount} />
              </td>
              <td className="px-4 py-2 text-sm">
                <span className={`px-2 py-1 text-xs rounded ${
                  bonus.status === 'approved' ? 'bg-green-100 text-green-800' :
                  bonus.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {bonus.status}
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-right">
                {bonus.status === 'pending' && (
                  <ApproveSigningBonusButton bonusId={bonus._id} onApprove={onApprove} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
