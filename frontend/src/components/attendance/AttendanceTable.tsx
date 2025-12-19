'use client';

import React from 'react';
import { AttendanceRecord } from '@/types/attendance';
import { formatDate, formatTime, calculateWorkingHours } from '@/lib/time';
import StatusBadge from './StatusBadge';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  isLoading: boolean;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="animate-pulse p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No attendance records found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clock In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clock Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Working Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => {
              // Compute date from punches if not available
              const inPunch = record.punches?.find((p) => p.type === 'IN');
              const computedDate =
                record.date ||
                (inPunch?.time
                  ? new Date(inPunch.time).toISOString().split('T')[0]
                  : new Date().toISOString().split('T')[0]);

              return (
                <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatDate(computedDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.clockIn ? formatTime(record.clockIn) : '--:--'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.clockOut ? formatTime(record.clockOut) : '--:--'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.clockIn && record.clockOut
                      ? calculateWorkingHours(record.clockIn, record.clockOut)
                      : record.totalWorkMinutes
                        ? `${Math.floor(record.totalWorkMinutes / 60)}h ${record.totalWorkMinutes % 60}m`
                        : '--'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge
                      status={record.status || (record.hasMissedPunch ? 'absent' : 'present')}
                      isLate={record.isLate}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {record.notes || '--'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;