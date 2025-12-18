    // This file should be created FIRST and shared with all team members

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'on-leave';

export interface Punch {
  type: 'IN' | 'OUT';
  time: string | Date;
}

export interface AttendanceRecord {
  _id: string;
  employeeId: string;
  punches: Punch[];
  totalWorkMinutes: number;
  hasMissedPunch: boolean;
  exceptionIds?: string[];
  finalisedForPayroll: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Computed fields for frontend
  date?: string;
  clockIn?: string;
  clockOut?: string;
  status?: AttendanceStatus;
  isLate?: boolean;
  workingHours?: number;
  notes?: string;
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