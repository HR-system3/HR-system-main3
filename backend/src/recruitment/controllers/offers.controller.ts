import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { RecruitmentService } from '../recruitment.service';

@Controller('recruitment/offers')
export class OffersController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get()
  async getOffers(
    @Query('applicationId') applicationId?: string,
    @Query('candidateId') candidateId?: string,
    @Query('finalStatus') finalStatus?: string,
  ) {
    return this.recruitmentService.getOffers({ applicationId, candidateId, finalStatus });
  }

  @Get(':id')
  async getOffer(@Param('id') id: string) {
    return this.recruitmentService.getOffer(id);
  }

  @Post()
  async createOffer(@Body() data: any) {
    return this.recruitmentService.createOffer(data);
  }

  @Post(':id/send')
  async sendOffer(@Param('id') id: string) {
    return this.recruitmentService.sendOffer(id);
  }

  @Post(':id/accept')
  async acceptOffer(@Param('id') id: string) {
    return this.recruitmentService.acceptOffer(id);
  }

  @Post(':id/reject')
  async rejectOffer(@Param('id') id: string) {
    return this.recruitmentService.rejectOffer(id);
  }
}
