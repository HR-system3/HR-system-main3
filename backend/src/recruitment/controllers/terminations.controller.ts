import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { RecruitmentService } from '../recruitment.service';

@Controller('recruitment/terminations')
export class TerminationsController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get()
  async getTerminations(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.recruitmentService.getTerminations({ employeeId, status });
  }

  @Get(':id')
  async getTermination(@Param('id') id: string) {
    return this.recruitmentService.getTermination(id);
  }

  @Post()
  async createTermination(@Body() data: any) {
    return this.recruitmentService.createTermination(data);
  }

  @Post(':id/approve')
  async approveTermination(@Param('id') id: string) {
    return this.recruitmentService.approveTermination(id);
  }

  @Post(':id/reject')
  async rejectTermination(@Param('id') id: string) {
    return this.recruitmentService.rejectTermination(id);
  }
}
