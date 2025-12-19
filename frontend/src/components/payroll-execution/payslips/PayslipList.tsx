'use client';

import React from 'react';
import { Payslip } from '@/types/payroll-run.types';
import PayslipCard from './PayslipCard';

interface PayslipListProps {
  payslips: Payslip[];
  onDownload?: (payslip: Payslip) => void;
}

export default function PayslipList({ payslips, onDownload }: PayslipListProps) {
  if (payslips.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No payslips available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {payslips.map((payslip) => (
        <PayslipCard
          key={payslip._id}
          payslip={payslip}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}
