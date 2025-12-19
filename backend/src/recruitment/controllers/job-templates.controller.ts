import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { RecruitmentService } from '../recruitment.service';

@Controller('recruitment/job-templates')
export class JobTemplatesController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get()
  async getJobTemplates() {
    return this.recruitmentService.getJobTemplates();
  }

  @Get(':id')
  async getJobTemplate(@Param('id') id: string) {
    return this.recruitmentService.getJobTemplate(id);
  }

  @Post()
  async createJobTemplate(@Body() data: any) {
    return this.recruitmentService.createJobTemplate(data);
  }

  @Put(':id')
  async updateJobTemplate(@Param('id') id: string, @Body() data: any) {
    return this.recruitmentService.updateJobTemplate(id, data);
  }

  @Delete(':id')
  async deleteJobTemplate(@Param('id') id: string) {
    return this.recruitmentService.deleteJobTemplate(id);
  }
}
