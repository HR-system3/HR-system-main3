'use client';

import React, { useState } from 'react';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { TodayAttendance } from '@/types/attendance';

interface ClockInOutCardProps {
  todayAttendance: TodayAttendance | null;
  onClockIn: () => Promise<void>;
  onClockOut: () => Promise<void>;
}

const ClockInOutCard: React.FC<ClockInOutCardProps> = ({
  todayAttendance,
  onClockIn,
  onClockOut,
}) => {
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [isClockingOut, setIsClockingOut] = useState(false);

  const handleClockIn = async () => {
    setIsClockingIn(true);
    try {
      await onClockIn();
    } finally {
      setIsClockingIn(false);
    }
  };

  const handleClockOut = async () => {
    setIsClockingOut(true);
    try {
      await onClockOut();
    } finally {
      setIsClockingOut(false);
    }
  };

  const canClockIn = !todayAttendance?.hasClockedIn;
  const canClockOut = todayAttendance?.hasClockedIn && !todayAttendance?.hasClockedOut;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Attendance Actions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Clock In Button */}
        <button
          onClick={handleClockIn}
          disabled={!canClockIn || isClockingIn}
          className={`
            flex items-center justify-center space-x-2 px-6 py-4 rounded-lg
            font-medium transition-all duration-200
            ${
              canClockIn
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isClockingIn ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Clocking In...</span>
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              <span>Clock In</span>
            </>
          )}
        </button>

        {/* Clock Out Button */}
        <button
          onClick={handleClockOut}
          disabled={!canClockOut || isClockingOut}
          className={`
            flex items-center justify-center space-x-2 px-6 py-4 rounded-lg
            font-medium transition-all duration-200
            ${
              canClockOut
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isClockingOut ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Clocking Out...</span>
            </>
          ) : (
            <>
              <LogOut className="h-5 w-5" />
              <span>Clock Out</span>
            </>
          )}
        </button>
      </div>

      {/* Helper Text */}
      <div className="mt-4 text-sm text-gray-600">
        {!todayAttendance?.hasClockedIn && (
          <p>👋 Start your day by clocking in</p>
        )}
        {todayAttendance?.hasClockedIn && !todayAttendance?.hasClockedOut && (
          <p>✅ You're clocked in. Don't forget to clock out!</p>
        )}
        {todayAttendance?.hasClockedOut && (
          <p>🎉 You've completed your attendance for today</p>
        )}
      </div>
    </div>
  );
};

export default ClockInOutCard;