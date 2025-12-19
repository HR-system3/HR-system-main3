'use client';

import React, { useEffect, useState } from 'react';
import ClockInOutCard from '@/components/attendance/ClockInOutCard';
import TodayStatusCard from '@/components/attendance/TodayStatusCard';
import { TodayAttendance } from '@/types/attendance';
import Link from 'next/link';
import { attendanceService } from '@/services/api/attendance.service';
import { getEmployeeId, getUserId } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const [todayAttendance, setTodayAttendance] =
    useState<TodayAttendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    // Get employeeId - try from /auth/me endpoint first, fallback to userId
    const fetchEmployeeId = async () => {
      const empId = await getEmployeeId() || getUserId();
      if (!empId) {
        toast.error('Please login to continue. Employee ID not found.');
        setIsLoading(false);
        return;
      }
      setEmployeeId(empId);

      // Fetch today's attendance
      const fetchTodayAttendance = async () => {
        try {
          const attendance = await attendanceService.getTodayAttendance(empId);
          setTodayAttendance(attendance);
        } catch (error: any) {
          console.error('Error fetching attendance:', error);
          toast.error(error?.response?.data?.message || 'Failed to load attendance');
          // Set default state on error
          setTodayAttendance({
            hasClockedIn: false,
            hasClockedOut: false,
            status: 'not-started',
            isLate: false,
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchTodayAttendance();
    };

    fetchEmployeeId();
  }, []);

  const handleClockIn = async () => {
    if (!employeeId) {
      toast.error('Employee ID not found');
      return;
    }

    try {
      await attendanceService.clockIn(employeeId);
      toast.success('Clocked in successfully');
      
      // Refresh today's attendance
      const attendance = await attendanceService.getTodayAttendance(employeeId);
      setTodayAttendance(attendance);
    } catch (error: any) {
      console.error('Error clocking in:', error);
      toast.error(error?.response?.data?.message || 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    if (!employeeId) {
      toast.error('Employee ID not found');
      return;
    }

    try {
      await attendanceService.clockOut(employeeId);
      toast.success('Clocked out successfully');
      
      // Refresh today's attendance
      const attendance = await attendanceService.getTodayAttendance(employeeId);
      setTodayAttendance(attendance);
    } catch (error: any) {
      console.error('Error clocking out:', error);
      toast.error(error?.response?.data?.message || 'Failed to clock out');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <div className="flex gap-4">
          <Link 
            href="/time-management/attendance/correction" 
            className="text-blue-600 hover:underline"
          >
            Request Correction
          </Link>
          <Link 
            href="/time-management/attendance/history" 
            className="text-blue-600 hover:underline"
          >
            View History
          </Link>
        </div>
      </div>

      <TodayStatusCard
        todayAttendance={todayAttendance}
        isLoading={isLoading}
      />

      {!isLoading && todayAttendance && (
        <ClockInOutCard
          todayAttendance={todayAttendance}
          onClockIn={handleClockIn}
          onClockOut={handleClockOut}
        />
      )}
    </div>
  );
}
