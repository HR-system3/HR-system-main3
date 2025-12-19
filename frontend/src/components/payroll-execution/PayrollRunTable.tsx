import React from 'react';
import { PayrollRun } from '@/types/payroll-run.types';
import PayrollRunRow from './PayrollRunRow';

interface Props {
  runs: PayrollRun[];
}

const PayrollRunTable: React.FC<Props> = ({ runs }) => {
  return (
    <table className="min-w-full border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="px-4 py-2 border">Run ID</th>
          <th className="px-4 py-2 border">Period</th>
          <th className="px-4 py-2 border">Entity</th>
          <th className="px-4 py-2 border">Status</th>
          <th className="px-4 py-2 border">Employees</th>
        </tr>
      </thead>
      <tbody>
        {runs.map((run) => (
          <PayrollRunRow key={run._id} run={run} />
        ))}
      </tbody>
    </table>
  );
};

export default PayrollRunTable;