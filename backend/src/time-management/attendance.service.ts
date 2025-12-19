import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AttendanceRecord,
  AttendanceRecordDocument,
  Punch,
} from './models/attendance-record.schema';
import {
  AttendanceCorrectionRequest,
  AttendanceCorrectionRequestDocument,
} from './models/attendance-correction-request.schema';
import {
  PunchType,
  CorrectionRequestStatus,
} from './models/enums';
import { ClockInOutDto, GetAttendanceQueryDto } from './dto/attendance.dto';
import {
  CreateCorrectionRequestDto,
  ReviewCorrectionRequestDto,
} from './dto/correction.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(AttendanceRecord.name)
    private readonly attendanceModel: Model<AttendanceRecordDocument>,
    @InjectModel(AttendanceCorrectionRequest.name)
    private readonly correctionModel: Model<AttendanceCorrectionRequestDocument>,
  ) {}

  /**
   * Clock-in:
   * - creates a new attendance record
   * - marks it as "open" (hasMissedPunch = true)
   */
  async clockIn(dto: ClockInOutDto) {
    const now = dto.timestamp ? new Date(dto.timestamp) : new Date();

    const punch: Punch = {
      type: PunchType.IN,
      time: now,
    };

    const record = await this.attendanceModel.create({
      employeeId: new Types.ObjectId(dto.employeeId),
      punches: [punch],
      totalWorkMinutes: 0,
      hasMissedPunch: true,
      exceptionIds: [],
      finalisedForPayroll: false,
    });

    return record;
  }

  /**
   * Clock-out:
   * - finds the latest open attendance record for this employee
   * - adds OUT punch
   * - calculates totalWorkMinutes
   * - marks hasMissedPunch false
   */
  async clockOut(dto: ClockInOutDto) {
    const now = dto.timestamp ? new Date(dto.timestamp) : new Date();

    const record = await this.attendanceModel
      .findOne({
        employeeId: new Types.ObjectId(dto.employeeId),
        hasMissedPunch: true,
      })
      .sort({ _id: -1 });

    if (!record) {
      throw new BadRequestException(
        'No open attendance record found to clock-out. Make sure you clocked-in first.',
      );
    }

    const punchOut: Punch = {
      type: PunchType.OUT,
      time: now,
    };

    record.punches.push(punchOut as any);

    // find first IN punch
    const firstIn = record.punches.find((p) => p.type === PunchType.IN);
    if (firstIn) {
      const diffMs = now.getTime() - firstIn.time.getTime();
      const diffMinutes = Math.max(0, Math.round(diffMs / 60000));
      record.totalWorkMinutes = diffMinutes;
    }

    record.hasMissedPunch = record.punches.length % 2 !== 0;
    record.finalisedForPayroll = !record.hasMissedPunch;

    return record.save();
  }

  /**
   * Query attendance records.
   * We support:
   *  - filter by employee
   *  - filter by date range using punches[].time
   */
  async getAttendance(query: GetAttendanceQueryDto) {
    const filter: any = {};

    if (query.employeeId) {
      filter.employeeId = new Types.ObjectId(query.employeeId);
    }

    if (query.fromDate || query.toDate) {
      const dateFilter: any = {};
      if (query.fromDate) dateFilter.$gte = new Date(query.fromDate);
      if (query.toDate) dateFilter.$lte = new Date(query.toDate);
      filter['punches.time'] = dateFilter;
    }

    return this.attendanceModel.find(filter).lean();
  }

  /**
   * Helper to transform correction document to frontend-expected shape
   */
  private toCorrectionResponse(c: any): {
    _id: string;
    employeeId: string;
    attendanceRecordId: string;
    reason?: string;
    status: 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
    createdAt: string;
    updatedAt: string;
  } {
    const doc = c.toObject ? c.toObject() : c;
    const attendanceRecordId = doc.attendanceRecord?._id 
      ? doc.attendanceRecord._id.toString()
      : (doc.attendanceRecord?.toString() || doc.attendanceRecord);
    
    return {
      _id: doc._id.toString(),
      employeeId: doc.employeeId?.toString() || doc.employeeId,
      attendanceRecordId: attendanceRecordId.toString(),
      reason: doc.reason,
      status: doc.status as 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'ESCALATED',
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    };
  }

  /**
   * Get corrections for a specific employee
   */
  async getCorrectionsForEmployee(employeeId: string) {
    if (!employeeId) {
      throw new BadRequestException('employeeId is required');
    }

    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employeeId format');
    }

    // Validate employeeId format (existence check via attendance records)
    const hasRecords = await this.attendanceModel.exists({
      employeeId: new Types.ObjectId(employeeId),
    });
    if (!hasRecords) {
      throw new BadRequestException('Employee not found or has no attendance records');
    }

    const corrections = await this.correctionModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .sort({ _id: -1 }) // newest first
      .lean();

    return corrections.map((c) => this.toCorrectionResponse(c));
  }

  /**
   * Get pending corrections (SUBMITTED or IN_REVIEW)
   */
  async getPendingCorrections() {
    const corrections = await this.correctionModel
      .find({
        status: { $in: [CorrectionRequestStatus.SUBMITTED, CorrectionRequestStatus.IN_REVIEW] },
      })
      .sort({ _id: -1 }) // newest first
      .lean();

    return corrections.map((c) => this.toCorrectionResponse(c));
  }

  /**
   * Get team attendance records
   */
  async getTeamAttendance({ departmentId, fromDate, toDate }: {
    departmentId?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    if (!fromDate || !toDate) {
      throw new BadRequestException('fromDate and toDate are required');
    }

    const filter: any = {};
    
    // Filter by date range using punches.time
    const dateFilter: any = {};
    if (fromDate) dateFilter.$gte = new Date(fromDate);
    if (toDate) dateFilter.$lte = new Date(toDate);
    filter['punches.time'] = dateFilter;

    // Note: departmentId filtering is skipped as requested (to avoid empty results)
    // If departmentId filtering is needed later, it would require joining with EmployeeProfile

    const records = await this.attendanceModel.find(filter).lean();
    return records;
  }

  /**
   * Employee submits attendance correction request
   */
  async createCorrection(dto: CreateCorrectionRequestDto) {
    const record = await this.attendanceModel.findById(dto.attendanceRecordId);
    if (!record) {
      throw new NotFoundException('Attendance record not found');
    }

    // mark record as not finalised until resolved
    record.finalisedForPayroll = false;
    await record.save();

    const created = await this.correctionModel.create({
      employeeId: new Types.ObjectId(dto.employeeId),
      attendanceRecord: record._id,
      reason: dto.reason,
      status: CorrectionRequestStatus.SUBMITTED,
    });

    return this.toCorrectionResponse(created);
  }

  /**
   * Manager/HR reviews correction: approve / reject / escalate ...
   */
  async reviewCorrection(id: string, dto: ReviewCorrectionRequestDto) {
    const correction = await this.correctionModel.findById(id);
    if (!correction) {
      throw new NotFoundException('Correction request not found');
    }

    correction.status = dto.status;
    if (dto.reason) {
      correction.reason = dto.reason;
    }

    await correction.save();

    // If approved, you might manually adjust punches in the record later.
    // For MS2, we only update status and keep it simple.
    return this.toCorrectionResponse(correction);
  }
}
