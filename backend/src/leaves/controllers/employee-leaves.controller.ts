import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { LeavesService } from '../leaves.service';

import { CreateLeaveRequestDto } from '../dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from '../dto/update-leave-request.dto';

@Controller('leaves/employee')
// @UseGuards(JwtAuthGuard, RolesGuard) // DISABLED FOR DEVELOPMENT
export class EmployeeLeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  // Mock user for development - replace with actual auth later
  private getMockUser(req: any) {
    return req.user || {
      employeeId: new Types.ObjectId('507f1f77bcf86cd799439011'), // Mock employee ID
      userId: new Types.ObjectId('507f1f77bcf86cd799439012'), // Mock user ID
    };
  }

  @Post()
  async create(@Req() req, @Body() dto: CreateLeaveRequestDto) {
    const user = this.getMockUser(req);
    const employeeId = user.employeeId;
    const userId = user.userId;
    return this.leavesService.createLeaveRequest(employeeId, userId, dto);
  }

  @Patch(':id')
  async updatePending(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateLeaveRequestDto,
  ) {
    const user = this.getMockUser(req);
    const employeeId = user.employeeId;
    return this.leavesService.updatePendingRequest(employeeId, id, dto);
  }

  @Delete(':id')
  async cancel(@Req() req, @Param('id') id: string) {
    const user = this.getMockUser(req);
    const employeeId = user.employeeId;
    return this.leavesService.cancelPendingRequest(employeeId, id);
  }

  // Specific routes must come before parameterized routes
  @Get('balance')
  async getBalance(@Req() req) {
    const user = this.getMockUser(req);
    const employeeId = user.employeeId;
    return this.leavesService.getEmployeeBalance(employeeId);
  }

  @Get('history')
  async getHistory(@Req() req) {
    const user = this.getMockUser(req);
    const employeeId = user.employeeId;
    return this.leavesService.getEmployeeHistory(employeeId);
  }

  @Get('requests/:id/timeline')
  async getRequestTimeline(@Req() req, @Param('id') id: string) {
    return this.leavesService.getRequestTimeline(id as any);
  }

  // Parameterized routes come after specific routes
  @Get(':employeeId/balance')
  async getEmployeeBalanceById(@Param('employeeId') employeeId: string) {
    return this.leavesService.getEmployeeBalance(new Types.ObjectId(employeeId));
  }

  @Post('validate')
  async validateLeaveRequest(@Req() req, @Body() dto: any) {
    const user = this.getMockUser(req);
    const employeeId = user.employeeId;
    return this.leavesService.validateLeaveRequest(employeeId, dto);
  }
}
