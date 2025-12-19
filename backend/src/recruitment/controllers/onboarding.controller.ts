import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { RecruitmentService } from '../recruitment.service';

@Controller('recruitment/onboarding')
export class OnboardingController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get(':employeeId')
  async getOnboarding(@Param('employeeId') employeeId: string) {
    return this.recruitmentService.getOnboarding(employeeId);
  }

  @Patch(':employeeId/tasks/:taskId')
  async updateTask(
    @Param('employeeId') employeeId: string,
    @Param('taskId') taskId: string,
    @Body() body: { completed: boolean },
  ) {
    return this.recruitmentService.updateOnboardingTask(employeeId, taskId, body.completed);
  }
}
