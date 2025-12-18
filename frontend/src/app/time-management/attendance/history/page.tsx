'use client';

import React, { useEffect, useState } from 'react';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import { AttendanceRecord } from '@/types/attendance';
import Link from 'next/link';
import { attendanceService } from '@/services/api/attendance.service';
import { getEmployeeId, getUserId } from '@/lib/utils/auth';
import toast from 'react-hot-toast';

export default function AttendanceHistoryPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const empId = await getEmployeeId() || getUserId();
      if (!empId) {
        toast.error('Please login to continue');
        setIsLoading(false);
        return;
      }

      try {
        // Get last 30 days of attendance
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 30);

        const data = await attendanceService.getAttendance({
          employeeId: empId,
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
        });
        
        // Sort by date descending
        const sorted = data.sort((a, b) => {
          const aDate = a.date || '';
          const bDate = b.date || '';
          return bDate.localeCompare(aDate);
        });
        
        setRecords(sorted);
      } catch (error: any) {
        console.error('Error fetching attendance history:', error);
        toast.error(error?.response?.data?.message || 'Failed to load attendance history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
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
