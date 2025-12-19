import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { RecruitmentService } from '../recruitment.service';
import { ApprovalStatus } from '../enums/approval-status.enum';
import { Types } from 'mongoose';

@Controller('recruitment/clearance-checklists')
export class ClearanceChecklistsController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get()
  async getClearanceChecklists(@Query('terminationId') terminationId?: string) {
    return this.recruitmentService.getClearanceChecklists({ terminationId });
  }

  @Get(':id')
  async getClearanceChecklist(@Param('id') id: string) {
    return this.recruitmentService.getClearanceChecklist(id);
  }

  @Post()
  async createClearanceChecklist(@Body() data: any) {
    return this.recruitmentService.createClearanceChecklist(data);
  }

  @Put(':id')
  async updateClearanceChecklist(@Param('id') id: string, @Body() data: any) {
    return this.recruitmentService.updateClearanceChecklist(id, data);
  }

  @Put(':id/department')
  async updateDepartment(
    @Param('id') id: string,
    @Body() body: { department: string; status: ApprovalStatus; comments?: string },
  ) {
    return this.recruitmentService.updateClearanceChecklistDepartment(
      id,
      body.department,
      body.status,
      body.comments,
    );
  }

  @Put(':id/equipment')
  async updateEquipment(
    @Param('id') id: string,
    @Body() body: { equipmentId: string; returned: boolean; condition?: string },
  ) {
    return this.recruitmentService.updateClearanceChecklistEquipment(
      id,
      new Types.ObjectId(body.equipmentId),
      body.returned,
      body.condition,
    );
  }

  @Put(':id/card')
  async updateCard(
    @Param('id') id: string,
    @Body() body: { cardReturned: boolean },
  ) {
    return this.recruitmentService.updateClearanceChecklistCard(id, body.cardReturned);
  }
}
