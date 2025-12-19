'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import PayslipList from '@/components/payroll-execution/payslips/PayslipList';
import { Payslip } from '@/types/payroll-run.types';

export default function PayslipsPage() {
  const router = useRouter();
  // Placeholder data - replace with actual API call
  const payslips: Payslip[] = [];

  const handleDownload = (payslip: Payslip) => {
    const blob = new Blob([JSON.stringify(payslip, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payslip-${payslip._id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payslips</h1>
          <p className="text-sm text-gray-500">View and download employee payslips</p>
        </div>
        <button
          onClick={() => router.push('/payroll-execution')}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Back to Runs
        </button>
      </div>
      <PayslipList payslips={payslips} onDownload={handleDownload} />
    </div>
  );
}
