import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { LeavesService } from '../leaves.service';

import { ApproveRejectLeaveDto } from '../dto/approve-reject-leave.dto';

@Controller('leaves/manager')
// @UseGuards(JwtAuthGuard, RolesGuard) // DISABLED FOR DEVELOPMENT
export class ManagerLeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  // Mock user for development - replace with actual auth later
  private getMockUser(req: any) {
    return req.user || {
      userId: new Types.ObjectId('507f1f77bcf86cd799439013'), // Mock manager user ID
    };
  }

  @Get('requests')
  async getTeamRequests(@Req() req) {
    const user = this.getMockUser(req);
    const managerId = user.userId;
    return this.leavesService.getTeamRequests(managerId);
  }

  @Post('requests/:id/decision')
  async approveReject(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: ApproveRejectLeaveDto,
  ) {
    const user = this.getMockUser(req);
    const managerId = user.userId;
    return this.leavesService.managerApproveReject(managerId, id, dto);
  }

  @Post('delegations')
  async createDelegation(@Req() req, @Body() dto: any) {
    const user = this.getMockUser(req);
    const managerId = user.userId;
    return this.leavesService.createDelegation(managerId, dto);
  }

  @Get('delegations')
  async getDelegations(@Req() req) {
    const user = this.getMockUser(req);
    const managerId = user.userId;
    return this.leavesService.getActiveDelegations(managerId);
  }

  @Get('requests/:id/timeline')
  async getRequestTimeline(@Param('id') id: string) {
    return this.leavesService.getRequestTimeline(id as any);
  }
}
