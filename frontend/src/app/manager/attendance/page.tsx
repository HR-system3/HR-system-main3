'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { attendanceService } from '@/services/attendance.service';
import { AttendanceRecord } from '@/types/attendance';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import { isManager } from '@/lib/utils/auth';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ManagerAttendancePage() {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [departmentId, setDepartmentId] = useState<string>('');

  useEffect(() => {
    // Check if user is a manager
    if (!isManager()) {
      toast.error('Access denied. Manager role required.');
      router.push('/attendance');
      return;
    }

    const fetchTeamAttendance = async () => {
      try {
        // Get last 7 days of team attendance
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 7);

        const data = await attendanceService.getTeamAttendance(
          departmentId || undefined,
          fromDate.toISOString(),
          toDate.toISOString(),
        );

        // Sort by date descending
        const sorted = data.sort((a, b) => {
          const aDate = a.date || '';
          const bDate = b.date || '';
          return bDate.localeCompare(aDate);
        });

        setRecords(sorted);
      } catch (error: any) {
        console.error('Error fetching team attendance:', error);
        toast.error(error?.response?.data?.message || 'Failed to load team attendance');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamAttendance();
  }, [departmentId, router]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/attendance" className="text-blue-600 hover:underline">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Team Attendance</h1>
        </div>
        <div className="flex gap-4">
          <Link
            href="/manager/approvals"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Approvals
          </Link>
        </div>
      </div>

      {/* Filter by Department */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Department (Optional)
        </label>
        <input
          type="text"
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          placeholder="Enter department ID"
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <AttendanceTable records={records} isLoading={isLoading} />
    </div>
  );
}

