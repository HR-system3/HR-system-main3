'use client';

import React from 'react';
import { Payslip } from '@/types/payroll-run.types';
import Money from '../shared/Money';

interface PayslipCardProps {
  payslip: Payslip;
  onDownload?: (payslip: Payslip) => void;
}

export default function PayslipCard({ payslip, onDownload }: PayslipCardProps) {
  const employeeName = typeof payslip.employeeId === 'object' 
    ? `${payslip.employeeId.firstName || ''} ${payslip.employeeId.lastName || ''}`.trim() || payslip.employeeId.employeeNumber || payslip.employeeId._id
    : payslip.employeeId;

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{employeeName}</h3>
          <p className="text-sm text-gray-500">Run: {payslip.payrollRunId}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded ${
          payslip.paymentStatus === 'paid' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {payslip.paymentStatus || 'pending'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-500">Gross Salary</p>
          <p className="font-semibold text-gray-900">
            <Money amount={payslip.totalGrossSalary} />
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Net Pay</p>
          <p className="font-semibold text-gray-900">
            <Money amount={payslip.netPay} />
          </p>
        </div>
      </div>
      {onDownload && (
        <button
          onClick={() => onDownload(payslip)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Download
        </button>
      )}
    </div>
  );
}
