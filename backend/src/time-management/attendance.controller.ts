import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ClockInOutDto, GetAttendanceQueryDto } from './dto/attendance.dto';
import {
  CreateCorrectionRequestDto,
  ReviewCorrectionRequestDto,
} from './dto/correction.dto';
import { AuthGuard } from '../auth/guards/authentication.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('attendance')
@UseGuards(AuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  clockIn(@Req() req: any, @Body() dto: ClockInOutDto) {
    // Use employeeId from body or try to get from user
    const employeeId = dto.employeeId || (req.user?.employeeId as string);
    if (!employeeId) {
      throw new Error('Employee ID is required. Please provide employeeId in request body.');
    }
    return this.attendanceService.clockIn({ ...dto, employeeId });
  }

  @Post('clock-out')
  clockOut(@Req() req: any, @Body() dto: ClockInOutDto) {
    // Use employeeId from body or try to get from user
    const employeeId = dto.employeeId || (req.user?.employeeId as string);
    if (!employeeId) {
      throw new Error('Employee ID is required. Please provide employeeId in request body.');
    }
    return this.attendanceService.clockOut({ ...dto, employeeId });
  }

  @Get()
  getAttendance(@Req() req: any, @Query() query: GetAttendanceQueryDto) {
    // If no employeeId in query, use the current user's employeeId
    if (!query.employeeId && req.user?.employeeId) {
      query.employeeId = req.user.employeeId as string;
    }
    return this.attendanceService.getAttendance(query);
  }

  @Post('corrections')
  createCorrection(@Req() req: any, @Body() dto: CreateCorrectionRequestDto) {
    // Use employeeId from body or try to get from user
    const employeeId = dto.employeeId || (req.user?.employeeId as string);
    if (!employeeId) {
      throw new Error('Employee ID is required');
    }
    return this.attendanceService.createCorrection({ ...dto, employeeId });
  }

  @Get('corrections')
  getMyCorrections(@Req() req: any, @Query('employeeId') employeeId?: string) {
    const empId = employeeId || (req.user?.employeeId as string);
    if (!empId) {
      throw new Error('Employee ID is required');
    }
    return this.attendanceService.getMyCorrections(empId);
  }

  @Get('corrections/pending')
  @UseGuards(RolesGuard)
  @Roles(Role.MANAGER, Role.HR)
  getPendingCorrections() {
    return this.attendanceService.getPendingCorrections();
  }

  @Patch('corrections/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.MANAGER, Role.HR)
  reviewCorrection(
    @Param('id') id: string,
    @Body() dto: ReviewCorrectionRequestDto,
  ) {
    return this.attendanceService.reviewCorrection(id, dto);
  }

  @Get('team')
  @UseGuards(RolesGuard)
  @Roles(Role.MANAGER, Role.HR)
  getTeamAttendance(
    @Query('departmentId') departmentId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.attendanceService.getTeamAttendance({
      departmentId,
      fromDate,
      toDate,
    });
  }
}
