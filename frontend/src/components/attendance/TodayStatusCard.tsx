'use client';

import React from 'react';
import { Clock, Calendar, Timer } from 'lucide-react';
import { formatTime, getCurrentTime } from '@/lib/time';
import StatusBadge from './StatusBadge';
import { TodayAttendance } from '@/types/attendance';

interface TodayStatusCardProps {
  todayAttendance: TodayAttendance | null;
  isLoading: boolean;
}

const TodayStatusCard: React.FC<TodayStatusCardProps> = ({
  todayAttendance,
  isLoading,
}) => {
  const [currentTime, setCurrentTime] = React.useState(getCurrentTime());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Today's Status</h2>
        <StatusBadge
          status={todayAttendance?.status || 'not-started'}
          isLate={todayAttendance?.isLate}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Time */}
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Time</p>
            <p className="text-lg font-semibold text-gray-900">{currentTime}</p>
          </div>
        </div>

        {/* Clock In Time */}
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-3 rounded-lg">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Clock In</p>
            <p className="text-lg font-semibold text-gray-900">
              {todayAttendance?.clockInTime
                ? formatTime(todayAttendance.clockInTime)
                : '--:--'}
            </p>
          </div>
        </div>

        {/* Clock Out Time */}
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 p-3 rounded-lg">
            <Timer className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Clock Out</p>
            <p className="text-lg font-semibold text-gray-900">
              {todayAttendance?.clockOutTime
                ? formatTime(todayAttendance.clockOutTime)
                : '--:--'}
            </p>
          </div>
        </div>
      </div>

      {/* Working Hours */}
      {todayAttendance?.workingHours && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Working Hours Today:</span>
            <span className="text-lg font-semibold text-blue-600">
              {todayAttendance.workingHours} hours
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayStatusCard;