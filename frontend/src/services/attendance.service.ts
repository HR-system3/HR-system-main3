import api from '@/lib/axios';
import { AttendanceRecord, TodayAttendance, ClockResponse } from '@/types/attendance';

export interface CorrectionRequest {
  _id: string;
  employeeId: string;
  attendanceRecordId: string;
  reason?: string;
  status: 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCorrectionRequestDto {
  attendanceRecordId: string;
  reason?: string;
}

export interface ReviewCorrectionDto {
  status: 'APPROVED' | 'REJECTED' | 'IN_REVIEW' | 'ESCALATED';
  reason?: string;
}

class AttendanceService {
  /**
   * Clock in - creates a new attendance record
   */
  async clockIn(employeeId: string, timestamp?: string): Promise<any> {
    const response = await api.post<any>('/attendance/clock-in', {
      employeeId,
      timestamp,
    });
    return response.data;
  }

  /**
   * Clock out - closes the current attendance record
   */
  async clockOut(employeeId: string, timestamp?: string): Promise<any> {
    const response = await api.post<any>('/attendance/clock-out', {
      employeeId,
      timestamp,
    });
    return response.data;
  }

  /**
   * Get today's attendance status
   */
  async getTodayAttendance(employeeId: string): Promise<TodayAttendance> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.toISOString();
    today.setHours(23, 59, 59, 999);
    const endOfDay = today.toISOString();

    const records = await this.getAttendance({
      employeeId,
      fromDate: startOfDay,
      toDate: endOfDay,
    });

    if (!records || records.length === 0) {
      return {
        hasClockedIn: false,
        hasClockedOut: false,
        status: 'not-started',
        isLate: false,
      };
    }

    // Get the most recent record for today (sort by creation time)
    const sortedRecords = records.sort((a, b) => {
      const aTime = a.punches?.[0]?.time ? new Date(a.punches[0].time).getTime() : 0;
      const bTime = b.punches?.[0]?.time ? new Date(b.punches[0].time).getTime() : 0;
      return bTime - aTime;
    });
    const todayRecord = sortedRecords[0];
    const punches = todayRecord.punches || [];
    const inPunch = punches.find((p) => p.type === 'IN');
    const outPunch = punches.find((p) => p.type === 'OUT');

    const hasClockedIn = !!inPunch;
    const hasClockedOut = !!outPunch;
    const clockInTime = inPunch?.time;
    const clockOutTime = outPunch?.time;

    // Calculate working hours if both punches exist
    let workingHours: number | undefined;
    if (clockInTime && clockOutTime) {
      const start = new Date(clockInTime);
      const end = new Date(clockOutTime);
      workingHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Convert to hours
    }

    // Determine status
    let status: 'not-started' | 'clocked-in' | 'completed' | 'late' = 'not-started';
    if (hasClockedOut) {
      status = 'completed';
    } else if (hasClockedIn) {
      status = 'clocked-in';
    }

    return {
      hasClockedIn,
      hasClockedOut,
      clockInTime: clockInTime ? new Date(clockInTime).toISOString() : undefined,
      clockOutTime: clockOutTime ? new Date(clockOutTime).toISOString() : undefined,
      status,
      isLate: false, // TODO: Calculate based on shift rules
      workingHours,
    };
  }

  /**
   * Get attendance history
   */
  async getAttendance(params: {
    employeeId?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<AttendanceRecord[]> {
    const response = await api.get<any[]>('/attendance', { params });
    // Transform backend response to frontend format
    return response.data.map((record) => {
      const punches = record.punches || [];
      const inPunch = punches.find((p: any) => p.type === 'IN');
      const outPunch = punches.find((p: any) => p.type === 'OUT');
      
      const clockInTime = inPunch?.time ? new Date(inPunch.time).toISOString() : undefined;
      const clockOutTime = outPunch?.time ? new Date(outPunch.time).toISOString() : undefined;
      
      // Calculate working hours
      let workingHours: number | undefined;
      if (clockInTime && clockOutTime) {
        const start = new Date(clockInTime);
        const end = new Date(clockOutTime);
        workingHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }

      // Get date from first punch
      const date = inPunch?.time 
        ? new Date(inPunch.time).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      return {
        ...record,
        employeeId: record.employeeId?.toString() || record.employeeId,
        punches: punches.map((p: any) => ({
          type: p.type,
          time: typeof p.time === 'string' ? p.time : new Date(p.time).toISOString(),
        })),
        clockIn: clockInTime,
        clockOut: clockOutTime,
        date,
        workingHours,
        status: record.hasMissedPunch ? 'absent' : (outPunch ? 'present' : 'present'),
        isLate: false, // TODO: Calculate based on shift
      } as AttendanceRecord;
    });
  }

  /**
   * Submit a correction request
   */
  async submitCorrection(
    employeeId: string,
    data: CreateCorrectionRequestDto,
  ): Promise<CorrectionRequest> {
    const response = await api.post<CorrectionRequest>('/attendance/corrections', {
      employeeId,
      ...data,
    });
    return response.data;
  }

  /**
   * Get correction requests for an employee
   */
  async getMyCorrections(employeeId: string): Promise<CorrectionRequest[]> {
    const response = await api.get<CorrectionRequest[]>(`/attendance/corrections`, {
      params: { employeeId },
    });
    return response.data;
  }

  /**
   * Get team attendance (for managers)
   */
  async getTeamAttendance(departmentId?: string, fromDate?: string, toDate?: string): Promise<AttendanceRecord[]> {
    const response = await api.get<AttendanceRecord[]>('/attendance/team', {
      params: { departmentId, fromDate, toDate },
    });
    return response.data;
  }

  /**
   * Get pending correction requests (for managers)
   */
  async getPendingCorrections(): Promise<CorrectionRequest[]> {
    const response = await api.get<CorrectionRequest[]>('/attendance/corrections/pending');
    return response.data;
  }

  /**
   * Review a correction request (approve/reject)
   */
  async reviewCorrection(
    correctionId: string,
    data: ReviewCorrectionDto,
  ): Promise<CorrectionRequest> {
    const response = await api.patch<CorrectionRequest>(
      `/attendance/corrections/${correctionId}`,
      data,
    );
    return response.data;
  }
}

export const attendanceService = new AttendanceService();

