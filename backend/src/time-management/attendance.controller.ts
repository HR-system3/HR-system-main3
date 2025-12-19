import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ClockInOutDto, GetAttendanceQueryDto } from './dto/attendance.dto';
import {
  CreateCorrectionRequestDto,
  ReviewCorrectionRequestDto,
} from './dto/correction.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  clockIn(@Body() dto: ClockInOutDto) {
    return this.attendanceService.clockIn(dto);
  }

  @Post('clock-out')
  clockOut(@Body() dto: ClockInOutDto) {
    return this.attendanceService.clockOut(dto);
  }

  @Get()
  getAttendance(@Query() query: GetAttendanceQueryDto) {
    return this.attendanceService.getAttendance(query);
  }

  // Specific routes must come before parameterized routes
  @Get('corrections/pending')
  getPendingCorrections() {
    return this.attendanceService.getPendingCorrections();
  }

  @Get('corrections')
  getCorrectionsForEmployee(@Query('employeeId') employeeId: string) {
    return this.attendanceService.getCorrectionsForEmployee(employeeId);
  }

  @Get('team')
  getTeamAttendance(
    @Query('departmentId') departmentId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.attendanceService.getTeamAttendance({ departmentId, fromDate, toDate });
  }

  @Post('corrections')
  createCorrection(@Body() dto: CreateCorrectionRequestDto) {
    return this.attendanceService.createCorrection(dto);
  }

  @Patch('corrections/:id')
  reviewCorrection(
    @Param('id') id: string,
    @Body() dto: ReviewCorrectionRequestDto,
  ) {
    return this.attendanceService.reviewCorrection(id, dto);
  }
}
