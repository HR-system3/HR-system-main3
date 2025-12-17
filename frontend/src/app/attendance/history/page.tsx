'use client';

import React, { useEffect, useState } from 'react';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import { AttendanceRecord } from '@/types/attendance';
import Link from 'next/link';

export default function AttendanceHistoryPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data (Member 2 will replace)
  useEffect(() => {
    setTimeout(() => {
      setRecords([
        {
          _id: '1',
          employeeId: 'EMP001',
          date: '2024-12-14',
          clockIn: '2024-12-14T09:00:00Z',
          clockOut: '2024-12-14T17:00:00Z',
          status: 'present',
          isLate: false,
          createdAt: '',
          updatedAt: '',
        },
        {
          _id: '2',
          employeeId: 'EMP001',
          date: '2024-12-13',
          clockIn: '2024-12-13T09:15:00Z',
          clockOut: '2024-12-13T17:00:00Z',
          status: 'late',
          isLate: true,
          notes: 'Traffic delay',
          createdAt: '',
          updatedAt: '',
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/attendance" className="text-blue-600 hover:underline">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold">Attendance History</h1>
      </div>

      <AttendanceTable records={records} isLoading={isLoading} />
    </div>
  );
}
