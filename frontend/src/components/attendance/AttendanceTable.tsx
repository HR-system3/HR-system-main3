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
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Clock In</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Clock Out</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Working Hours</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Notes</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className={`border-b border-neutral-200 ${i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/60'}`}>
                <td colSpan={6} className="px-4 py-3">
                  <div className="h-4 bg-neutral-200 rounded animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Clock In</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Clock Out</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Working Hours</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="text-center py-12 text-neutral-500">
                <p className="text-sm">No attendance records found</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
              Clock In
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
              Clock Out
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
              Working Hours
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => {
            // Compute date from punches if not available
            const inPunch = record.punches?.find((p) => p.type === 'IN');
            const computedDate =
              record.date ||
              (inPunch?.time
                ? new Date(inPunch.time).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0]);

            return (
              <tr 
                key={record._id} 
                className={`border-b border-neutral-200 transition-colors hover:bg-blue-50/40 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/60'
                }`}
              >
                <td className="px-4 py-3 text-neutral-900 font-medium">
                  {formatDate(computedDate)}
                </td>
                <td className="px-4 py-3 text-neutral-900">
                  {record.clockIn ? formatTime(record.clockIn) : '--:--'}
                </td>
                <td className="px-4 py-3 text-neutral-900">
                  {record.clockOut ? formatTime(record.clockOut) : '--:--'}
                </td>
                <td className="px-4 py-3 text-neutral-900">
                  {record.clockIn && record.clockOut
                    ? calculateWorkingHours(record.clockIn, record.clockOut)
                    : record.totalWorkMinutes
                      ? `${Math.floor(record.totalWorkMinutes / 60)}h ${record.totalWorkMinutes % 60}m`
                      : '--'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={record.status || (record.hasMissedPunch ? 'absent' : 'present')}
                    isLate={record.isLate}
                  />
                </td>
                <td className="px-4 py-3 text-neutral-900">
                  {record.notes || '--'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;