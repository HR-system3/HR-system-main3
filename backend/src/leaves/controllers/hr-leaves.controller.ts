import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  Query,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { LeavesService } from '../leaves.service';
import { LeavesSchedulerService } from '../leaves-scheduler.service';

import { ApproveRejectLeaveDto } from '../dto/approve-reject-leave.dto';
import { ConfigureLeaveTypeDto } from '../dto/configure-leave-type.dto';
import { ConfigureEntitlementDto } from '../dto/configure-entitlement.dto';
import { ManualAdjustmentDto } from '../dto/manual-adjustment.dto';

@Controller('leaves/hr')
// @UseGuards(JwtAuthGuard, RolesGuard) // DISABLED FOR DEVELOPMENT
export class HrLeavesController {
  constructor(
    private readonly leavesService: LeavesService,
    private readonly schedulerService: LeavesSchedulerService,
  ) {}

  // Mock user for development - replace with actual auth later
  private getMockUser(req: any) {
    return req.user || {
      userId: new Types.ObjectId('507f1f77bcf86cd799439014'), // Mock HR user ID
    };
  }

  // ======================================================
  // HR DECISIONS
  // ======================================================

  @Post('requests/:id/finalize')
  async finalize(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: ApproveRejectLeaveDto,
  ) {
    const user = this.getMockUser(req);
    return this.leavesService.hrFinalize(user.userId, id, dto);
  }

  @Post('requests/:id/override')
  async overrideDecision(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: ApproveRejectLeaveDto,
  ) {
    const user = this.getMockUser(req);
    return this.leavesService.hrOverrideDecision(user.userId, id, dto);
  }

  // ======================================================
  // ADJUSTMENTS
  // ======================================================

  @Post('adjustments')
  async manualAdjustment(@Req() req, @Body() dto: ManualAdjustmentDto) {
    const user = this.getMockUser(req);
    return this.leavesService.manualAdjustment(user.userId, dto);
  }

  // ======================================================
  // CONFIGURATIONS
  // ======================================================

  @Get('types')
  async getLeaveTypes() {
    return this.leavesService.getLeaveTypes();
  }

  @Post('types')
  async configureLeaveType(@Body() dto: ConfigureLeaveTypeDto) {
    return this.leavesService.configureLeaveType(dto);
  }

  @Delete('types/:id')
  async deleteLeaveType(@Param('id') id: string) {
    return this.leavesService.deleteLeaveType(id);
  }

  @Get('entitlements')
  async getEntitlements() {
    return this.leavesService.getEntitlements();
  }

  @Post('entitlements')
  async configureEntitlement(@Body() dto: ConfigureEntitlementDto) {
    return this.leavesService.configureEntitlement(dto);
  }

  @Get('workflows')
  async getApprovalWorkflows() {
    return this.leavesService.getApprovalWorkflows();
  }

  @Post('approval-configs')
  async configureApprovalFlow(@Body() dto: any) {
    return this.leavesService.configureApprovalFlow(dto);
  }

  @Get('accrual')
  async getAccrualConfig() {
    return this.leavesService.getAccrualConfig();
  }

  @Post('accrual')
  async configureAccrual(@Body() dto: any) {
    return this.leavesService.configureAccrual(dto);
  }

  @Get('holidays')
  async getHolidays() {
    return this.leavesService.getHolidays();
  }

  // ======================================================
  // SCHEDULERS (MANUAL TRIGGERS)
  // ======================================================

  @Post('scheduler/accrual')
  async triggerAccrual(@Body() body?: { employeeId?: string }) {
    return this.schedulerService.triggerAccrual(body?.employeeId);
  }

  @Post('scheduler/carry-over')
  async triggerCarryOver(@Body() body?: { year?: number }) {
    return this.schedulerService.triggerCarryOver(body?.year);
  }

  @Post('scheduler/escalations')
  async triggerEscalations() {
    return this.schedulerService.triggerEscalations();
  }

  // ======================================================
  // AUDIT LOGS
  // ======================================================

  @Get('audit-logs')
  async getAuditLogs(
    @Query('leaveRequestId') leaveRequestId?: string,
    @Query('action') action?: string,
    @Query('performedBy') performedBy?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.leavesService.getAuditLogs({
      leaveRequestId,
      action: action as any,
      performedBy,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('requests/:id/timeline')
  async getRequestTimeline(@Param('id') id: string) {
    return this.leavesService.getRequestTimeline(id as any);
  }

  // ======================================================
  // 📌 NEW — HR OVERVIEW (REQUIRED IN PDF)
  // ======================================================

  @Get('requests')
  async getAllRequests(
    @Query('employeeId') employeeId?: string,
    @Query('leaveTypeId') leaveTypeId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.leavesService.getHrOverview({
      employeeId,
      leaveTypeId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  // ======================================================
  // 📌 NEW — IRREGULAR LEAVE PATTERN REPORT
  // ======================================================

  @Get('reports/patterns')
  async getIrregularPatterns(
    @Query('employeeId') employeeId?: string,
  ) {
    return this.leavesService.getIrregularLeavePatterns(employeeId);
  }

  @Get('overview')
  async getOverview() {
    const requests = await this.leavesService.getHrOverview({});
    const patterns = await this.leavesService.getIrregularLeavePatterns();
    
    return {
      totalRequests: requests.length,
      pendingApprovals: requests.filter((r: any) => r.status === 'PENDING').length,
      approvedThisMonth: requests.filter((r: any) => {
        if (r.status !== 'APPROVED') return false;
        const approvedDate = new Date(r.updatedAt || r.createdAt);
        const now = new Date();
        return approvedDate.getMonth() === now.getMonth() && 
               approvedDate.getFullYear() === now.getFullYear();
      }).length,
      irregularPatterns: patterns,
    };
  }

  // ======================================================
  // CALENDAR & HOLIDAY MANAGEMENT
  // ======================================================

  @Post('calendars')
  async createCalendar(@Body() dto: any) {
    return this.leavesService.createCalendar(dto);
  }

  @Get('calendars')
  async getCalendars(
    @Query('country') country?: string,
    @Query('year') year?: number,
  ) {
    return this.leavesService.getCalendars({
      country,
      year: year ? Number(year) : undefined,
    });
  }

  @Get('calendars/:id')
  async getCalendar(@Param('id') id: string) {
    return this.leavesService.getCalendar(id);
  }

  @Post('calendars/:id')
  async updateCalendar(@Param('id') id: string, @Body() dto: any) {
    return this.leavesService.updateCalendar(id, dto);
  }

  @Post('calendars/:id/delete')
  async deleteCalendar(@Param('id') id: string) {
    return this.leavesService.deleteCalendar(id);
  }

  @Post('calendars/:id/holidays')
  async addHoliday(@Param('id') id: string, @Body() holiday: any) {
    return this.leavesService.addHoliday(id, {
      name: holiday.name,
      date: new Date(holiday.date),
      recurring: holiday.recurring,
    });
  }

  @Post('calendars/:id/holidays/remove')
  async removeHoliday(@Param('id') id: string, @Body() body: { date: string }) {
    return this.leavesService.removeHoliday(id, new Date(body.date));
  }

  @Post('calendars/:id/blocked-periods')
  async addBlockedPeriod(@Param('id') id: string, @Body() blockedPeriod: any) {
    return this.leavesService.addBlockedPeriod(id, {
      start: new Date(blockedPeriod.start),
      end: new Date(blockedPeriod.end),
      reason: blockedPeriod.reason,
    });
  }

  @Post('calendars/:id/blocked-periods/remove')
  async removeBlockedPeriod(
    @Param('id') id: string,
    @Body() body: { start: string; end: string },
  ) {
    return this.leavesService.removeBlockedPeriod(
      id,
      new Date(body.start),
      new Date(body.end),
    );
  }
}
