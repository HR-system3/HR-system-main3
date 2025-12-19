import { 
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  BadRequestException 
} from '@nestjs/common';

import { PayrollConfigurationService } from './payroll-configuration.service';

import { CreateAllowanceDto } from './dto/create-allowance.dto';
import { UpdateAllowanceDto } from './dto/update-allowance.dto';

import { CreatePayGradeDto } from './dto/create-pay-grade.dto';
import { UpdatePayGradeDto } from './dto/update-pay-grade.dto';

import { CreateTerminationBenefitDto } from './dto/create-termination-benefit.dto';
import { UpdateTerminationBenefitDto } from './dto/update-termination-benefit.dto';
import { CreatePayTypeDto } from './dto/create-pay-type.dto';
import { UpdatePayTypeDto } from './dto/update-pay-type.dto';
import { CreateInsuranceBracketDto } from './dto/create-insurance-bracket.dto';
import { UpdateInsuranceBracketDto } from './dto/update-insurance-bracket.dto';
import { CreateTaxRuleDto } from './dto/create-tax-rule.dto';
import { UpdateTaxRuleDto } from './dto/update-tax-rule.dto';
import { CreateSigningBonusDto } from './dto/create-signing-bonus.dto';
import { UpdateSigningBonusDto } from './dto/update-signing-bonus.dto';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';

@Controller('payroll-configuration')
export class PayrollConfigurationController {
  constructor(
    private readonly service: PayrollConfigurationService,
  ) {}

  // ------------------------------
  // ALLOWANCE
  // ------------------------------
  @Post('allowance')
  createAllowance(@Body() dto: CreateAllowanceDto) {
    return this.service.createAllowance(dto);
  }

  @Get('allowance')
  listAllowance() {
    return this.service.findAllAllowances();
  }

  @Get('allowance/:id')
  findAllowance(@Param('id') id: string) {
    return this.service.findAllowanceById(id);
  }

  @Put('allowance/:id')
  updateAllowance(
    @Param('id') id: string,
    @Body() dto: UpdateAllowanceDto,
  ) {
    return this.service.updateAllowance(id, dto);
  }

  // ------------------------------
  // PAY GRADE
  // ------------------------------
  @Post('pay-grade')
  createPayGrade(@Body() dto: CreatePayGradeDto) {
    return this.service.createPayGrade(dto);
  }

  @Get('pay-grade')
  listPayGrades() {
    return this.service.findAllPayGrades();
  }

  @Get('pay-grade/:id')
  findPayGrade(@Param('id') id: string) {
    return this.service.findPayGradeById(id);
  }

  @Put('pay-grade/:id')
  updatePayGrade(
    @Param('id') id: string,
    @Body() dto: UpdatePayGradeDto,
  ) {
    return this.service.updatePayGrade(id, dto);
  }

  @Delete('pay-grade/:id')
  deactivatePayGrade(@Param('id') id: string) {
    return this.service.deactivatePayGrade(id);
  }

  // ------------------------------
  // TERMINATION BENEFITS
  // ------------------------------
  @Post('termination-benefit')
  createTerminationBenefit(@Body() dto: CreateTerminationBenefitDto) {
    return this.service.createTerminationBenefit(dto);
  }

  @Get('termination-benefit')
  listTerminationBenefits() {
    return this.service.findAllTerminationBenefits();
  }

  @Get('termination-benefit/:id')
  findTerminationBenefit(@Param('id') id: string) {
    return this.service.findTerminationBenefitById(id);
  }

  @Put('termination-benefit/:id')
  updateTerminationBenefit(
    @Param('id') id: string,
    @Body() dto: UpdateTerminationBenefitDto,
  ) {
    return this.service.updateTerminationBenefit(id, dto);
  }

  // ------------------------------
  // PAY TYPES
  // ------------------------------
  @Post('pay-type')
  createPayType(@Body() dto: CreatePayTypeDto) {
    return this.service.createPayType(dto);
  }

  @Get('pay-type')
  listPayTypes() {
    return this.service.listPayTypes();
  }

  @Put('pay-type/:id')
  updatePayType(@Param('id') id: string, @Body() dto: UpdatePayTypeDto) {
    return this.service.updatePayType(id, dto);
  }

  @Delete('pay-type/:id')
  deactivatePayType(@Param('id') id: string) {
    return this.service.deactivatePayType(id);
  }

  // ------------------------------
  // INSURANCE BRACKETS
  // ------------------------------
  @Post('insurance-bracket')
  createInsurance(@Body() dto: CreateInsuranceBracketDto) {
    return this.service.createInsuranceBracket(dto);
  }

  @Get('insurance-bracket')
  listInsurance() {
    return this.service.listInsuranceBrackets();
  }

  @Put('insurance-bracket/:id')
  updateInsurance(@Param('id') id: string, @Body() dto: UpdateInsuranceBracketDto) {
    return this.service.updateInsuranceBracket(id, dto);
  }

  @Delete('insurance-bracket/:id')
  deactivateInsurance(@Param('id') id: string) {
    return this.service.deactivateInsuranceBracket(id);
  }

  // ------------------------------
  // TAX RULES
  // ------------------------------
  @Post('tax-rule')
  createTaxRule(@Body() dto: CreateTaxRuleDto) {
    return this.service.createTaxRule(dto);
  }

  @Get('tax-rule')
  listTaxRules() {
    return this.service.listTaxRules();
  }

  @Put('tax-rule/:id')
  updateTaxRule(@Param('id') id: string, @Body() dto: UpdateTaxRuleDto) {
    return this.service.updateTaxRule(id, dto);
  }

  @Delete('tax-rule/:id')
  deactivateTaxRule(@Param('id') id: string) {
    return this.service.deactivateTaxRule(id);
  }

  // ------------------------------
  // SIGNING BONUS
  // ------------------------------
  @Post('signing-bonus')
  createSigningBonus(@Body() dto: CreateSigningBonusDto) {
    return this.service.createSigningBonus(dto);
  }

  @Get('signing-bonus')
  listSigningBonus() {
    return this.service.listSigningBonuses();
  }

  @Put('signing-bonus/:id')
  updateSigningBonus(@Param('id') id: string, @Body() dto: UpdateSigningBonusDto) {
    return this.service.updateSigningBonus(id, dto);
  }

  @Delete('signing-bonus/:id')
  deactivateSigningBonus(@Param('id') id: string) {
    return this.service.deactivateSigningBonus(id);
  }

  // ------------------------------
  // COMPANY SETTINGS
  // ------------------------------
  @Get('company-settings')
  getCompanySettings() {
    return this.service.getCompanySettings();
  }

  @Put('company-settings')
  upsertCompanySettings(@Body() dto: UpdateCompanySettingsDto) {
    return this.service.upsertCompanySettings(dto);
  }

  // ------------------------------
  // STRUCTURE OVERVIEW
  // ------------------------------
  @Get('structure')
  getStructure() {
    return this.service.getFullStructure();
  }
}
