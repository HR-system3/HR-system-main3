import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { RecruitmentService } from '../recruitment.service';
import { InterviewStatus } from '../enums/interview-status.enum';

@Controller('recruitment/interviews')
export class InterviewsController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get()
  async getInterviews(
    @Query('applicationId') applicationId?: string,
    @Query('status') status?: string,
  ) {
    return this.recruitmentService.getInterviews({ applicationId, status });
  }

  @Get('application/:applicationId')
  async getInterviewsByApplication(@Param('applicationId') applicationId: string) {
    return this.recruitmentService.getInterviewsByApplication(applicationId);
  }

  @Get(':id')
  async getInterview(@Param('id') id: string) {
    return this.recruitmentService.getInterview(id);
  }

  @Post()
  async createInterview(@Body() data: any) {
    return this.recruitmentService.createInterview(data);
  }

  @Put(':id/status')
  async updateInterviewStatus(
    @Param('id') id: string,
    @Body() body: { status: InterviewStatus },
  ) {
    return this.recruitmentService.updateInterviewStatus(id, body.status);
  }
}
