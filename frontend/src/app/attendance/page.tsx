'use client';

import React, { useEffect, useState } from 'react';
import ClockInOutCard from '@/components/attendance/ClockInOutCard';
import TodayStatusCard from '@/components/attendance/TodayStatusCard';
import { TodayAttendance } from '@/types/attendance';
import Link from 'next/link';

export default function AttendancePage() {
  const [todayAttendance, setTodayAttendance] =
    useState<TodayAttendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTodayAttendance({
        hasClockedIn: false,
        hasClockedOut: false,
        status: 'not-started',
        isLate: false,
      });
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleClockIn = async () => {
    setTodayAttendance((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        hasClockedIn: true,
        clockInTime: new Date().toISOString(),
        status: 'clocked-in',
      };
    });
  };

  const handleClockOut = async () => {
    setTodayAttendance((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        hasClockedOut: true,
        clockOutTime: new Date().toISOString(),
        status: 'completed',
      };
    });
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Attendance</h1>
        <Link href="/attendance/history">View History</Link>
      </div>

      <div style={{ marginTop: 24 }}>
        <TodayStatusCard
          todayAttendance={todayAttendance}
          isLoading={isLoading}
        />
      </div>

      {!isLoading && todayAttendance && (
        <div style={{ marginTop: 24 }}>
          <ClockInOutCard
            todayAttendance={todayAttendance}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
          />
        </div>
      )}
    </div>
  );
}
