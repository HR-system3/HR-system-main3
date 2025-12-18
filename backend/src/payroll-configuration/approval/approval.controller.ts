import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { ApproveConfigDto } from './dto/approve-config.dto';

@Controller('payroll-configuration/approvals')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Get('pending')
  pending() {
    return this.approvalService.listPending();
  }

  @Post('approve')
  approveConfig(@Body() dto: ApproveConfigDto) {
    return this.approvalService.approve(dto);
  }

  @Post('reject')
  rejectConfig(@Body() dto: ApproveConfigDto) {
    return this.approvalService.reject(dto);
  }
}