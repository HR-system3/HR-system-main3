import React from 'react';
import { AttendanceStatus } from '@/types/attendance';

interface StatusBadgeProps {
  status: AttendanceStatus | 'clocked-in' | 'not-started' | 'completed';
  isLate?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isLate }) => {
  const getStatusStyles = () => {
    if (isLate) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }

    switch (status) {
      case 'present':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'clocked-in':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'late':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'on-leave':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'not-started':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    if (isLate && status === 'present') return 'Late';
    
    switch (status) {
      case 'present': return 'Present';
      case 'completed': return 'Completed';
      case 'clocked-in': return 'Clocked In';
      case 'late': return 'Late';
      case 'absent': return 'Absent';
      case 'on-leave': return 'On Leave';
      case 'not-started': return 'Not Started';
      default: return status;
    }
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        border ${getStatusStyles()}
      `}
    >
      {getStatusText()}
    </span>
  );
};

export default StatusBadge;