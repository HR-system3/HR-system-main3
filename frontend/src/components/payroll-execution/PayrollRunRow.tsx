import React from 'react';
import { PayrollRun } from '@/types/payroll-run.types';
import Link from 'next/link';

interface Props {
  run: PayrollRun;
}

const PayrollRunRow: React.FC<Props> = ({ run }) => {
  return (
    <tr>
      <td className="px-4 py-2 border">
  <Link
   href={`/payroll-execution/preview/${encodeURIComponent(run.runId || run._id)}`}
    className="text-cyan-400 hover:underline font-medium"
  >
    {run.runId}
  </Link>
</td>
      <td className="px-4 py-2 border">
        {run.payrollPeriod ? new Date(run.payrollPeriod).toLocaleDateString() : '-'}
      </td>
      <td className="px-4 py-2 border">{run.entity}</td>
      <td className="px-4 py-2 border">{run.status}</td>
      <td className="px-4 py-2 border">{run.employees}</td>
    </tr>
  );
};

export default PayrollRunRow;