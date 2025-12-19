import { Controller, Get } from '@nestjs/common';
import { RecruitmentService } from '../recruitment.service';

@Controller('recruitment/analytics')
export class AnalyticsController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get('hiring-funnel')
  async getHiringFunnel() {
    return this.recruitmentService.getHiringFunnel();
  }

  @Get('source-effectiveness')
  async getSourceEffectiveness() {
    return this.recruitmentService.getSourceEffectiveness();
  }

  @Get('time-to-fill')
  async getTimeToFill() {
    return this.recruitmentService.getTimeToFill();
  }

  @Get('interviews')
  async getInterviewAnalytics() {
    return this.recruitmentService.getInterviewAnalytics();
  }

  @Get('offers')
  async getOfferAnalytics() {
    return this.recruitmentService.getOfferAnalytics();
  }

  @Get('progress')
  async getProgressAnalytics() {
    return this.recruitmentService.getProgressAnalytics();
  }
}
