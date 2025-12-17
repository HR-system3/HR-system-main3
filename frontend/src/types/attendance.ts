    // This file should be created FIRST and shared with all team members

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'on-leave';

export interface AttendanceRecord {
  _id: string;
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: AttendanceStatus;
  isLate: boolean;
  workingHours?: number;
  overtime?: number;
  notes?: string;
  shiftId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodayAttendance {
  hasClockedIn: boolean;
  hasClockedOut: boolean;
  clockInTime?: string;
  clockOutTime?: string;
  status: 'not-started' | 'clocked-in' | 'completed' | 'late';
  isLate: boolean;
  workingHours?: number;
}

export interface ClockResponse {
  success: boolean;
  message: string;
  attendance: AttendanceRecord;
}