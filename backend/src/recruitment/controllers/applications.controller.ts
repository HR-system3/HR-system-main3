import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { RecruitmentService } from '../recruitment.service';
import { ApplicationStatus } from '../enums/application-status.enum';
import { ApplicationStage } from '../enums/application-stage.enum';

@Controller('recruitment/applications')
export class ApplicationsController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get()
  async getApplications(
    @Query('requisitionId') requisitionId?: string,
    @Query('status') status?: string,
    @Query('candidateId') candidateId?: string,
  ) {
    return this.recruitmentService.getApplications({ requisitionId, status, candidateId });
  }

  @Get(':id')
  async getApplication(@Param('id') id: string) {
    return this.recruitmentService.getApplication(id);
  }

  @Post()
  async createApplication(@Body() data: any) {
    return this.recruitmentService.createApplication(data);
  }

  @Put(':id/status')
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() body: { status: ApplicationStatus; stage?: ApplicationStage },
  ) {
    return this.recruitmentService.updateApplicationStatus(id, body.status, body.stage);
  }
}
