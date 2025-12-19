import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { RecruitmentService } from '../recruitment.service';

@Controller('recruitment/jobs')
export class JobsController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get()
  async getJobs(@Query('status') status?: string) {
    return this.recruitmentService.getJobs(status);
  }

  @Get(':id')
  async getJob(@Param('id') id: string) {
    return this.recruitmentService.getJob(id);
  }

  @Post()
  async createJob(@Body() data: any) {
    return this.recruitmentService.createJob(data);
  }

  @Put(':id')
  async updateJob(@Param('id') id: string, @Body() data: any) {
    return this.recruitmentService.updateJob(id, data);
  }
}
