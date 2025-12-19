import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { allowance } from './models/allowance.schema';
import { payGrade } from './models/payGrades.schema';
import { terminationAndResignationBenefits } from './models/terminationAndResignationBenefits';
import { ConfigStatus } from './enums/payroll-configuration-enums';
import { payType } from './models/payType.schema';
import { insuranceBrackets } from './models/insuranceBrackets.schema';
import { taxRules } from './models/taxRules.schema';
import { signingBonus } from './models/signingBonus.schema';
import { CompanyWideSettings } from './models/CompanyWideSettings.schema';

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

@Injectable()
export class PayrollConfigurationService {
  constructor(
    @InjectModel(allowance.name)
    private readonly allowanceModel: Model<allowance>,

    @InjectModel(payGrade.name)
    private readonly payGradeModel: Model<payGrade>,

    @InjectModel(terminationAndResignationBenefits.name)
    private readonly terminationModel: Model<terminationAndResignationBenefits>,

    @InjectModel(payType.name)
    private readonly payTypeModel: Model<payType>,

    @InjectModel(insuranceBrackets.name)
    private readonly insuranceModel: Model<insuranceBrackets>,

    @InjectModel(taxRules.name)
    private readonly taxRuleModel: Model<taxRules>,

    @InjectModel(signingBonus.name)
    private readonly signingBonusModel: Model<signingBonus>,

    @InjectModel(CompanyWideSettings.name)
    private readonly companySettingsModel: Model<CompanyWideSettings>,
  ) {}

  // =========================================================
  //  ALLOWANCES
  // =========================================================
  async createAllowance(dto: CreateAllowanceDto) {
    // check duplicate
    const exists = await this.allowanceModel.findOne({ name: dto.name });
    if (exists) {
      throw new BadRequestException('Allowance name already exists.');
    }

    const created = new this.allowanceModel({
      ...dto,
      status: ConfigStatus.DRAFT,  // always draft
    });

    return created.save();
  }

  async findAllAllowances() {
    return this.allowanceModel.find();
  }

  async findAllowanceById(id: string) {
    const found = await this.allowanceModel.findById(id);
    if (!found) throw new NotFoundException('Allowance not found');
    return found;
  }

  async updateAllowance(id: string, dto: UpdateAllowanceDto) {
    const exist = await this.allowanceModel.findById(id);
    if (!exist) throw new NotFoundException('Allowance not found');

    if (exist.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only draft allowances can be edited.');
    }

    // unique name validation
    if (dto.name) {
      const duplicate = await this.allowanceModel.findOne({ name: dto.name, _id: { $ne: id } });
      if (duplicate) throw new BadRequestException('Another allowance already uses this name.');
    }

    Object.assign(exist, dto);
    return exist.save();
  }

  // =========================================================
  //  PAY GRADES
  // =========================================================
  async createPayGrade(dto: CreatePayGradeDto) {
    // validate unique grade
    const exist = await this.payGradeModel.findOne({ grade: dto.grade });
    if (exist) {
      throw new BadRequestException('Pay Grade already exists.');
    }

    // business rule: grossSalary >= baseSalary
    if (dto.grossSalary < dto.baseSalary) {
      throw new BadRequestException('Gross salary cannot be less than base salary.');
    }

    const created = new this.payGradeModel({
      ...dto,
      status: ConfigStatus.DRAFT, // always draft
    });

    return created.save();
  }

  async findAllPayGrades() {
    return this.payGradeModel.find();
  }

  async findPayGradeById(id: string) {
    const found = await this.payGradeModel.findById(id);
    if (!found) throw new NotFoundException('Pay Grade not found');
    return found;
  }

  async updatePayGrade(id: string, dto: UpdatePayGradeDto) {
    const exist = await this.payGradeModel.findById(id);
    if (!exist) throw new NotFoundException('Pay Grade not found');

    if (exist.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only draft pay grades can be edited.');
    }

    // unique grade validation
    if (dto.grade) {
      const duplicate = await this.payGradeModel.findOne({ grade: dto.grade, _id: { $ne: id } });
      if (duplicate) throw new BadRequestException('Another Pay Grade already uses this grade.');
    }

    // validate salary rule
    if (dto.baseSalary && dto.grossSalary) {
      if (dto.grossSalary < dto.baseSalary) {
        throw new BadRequestException('Gross salary cannot be less than base salary.');
      }
    }

    Object.assign(exist, dto);
    return exist.save();
  }

  async deactivatePayGrade(id: string) {
    const exist = await this.payGradeModel.findById(id);
    if (!exist) throw new NotFoundException('Pay Grade not found');

    if (exist.status === ConfigStatus.APPROVED) {
      throw new BadRequestException('Approved pay grades cannot be deactivated.');
    }

    exist.status = ConfigStatus.REJECTED;
    return exist.save();
  }

  // =========================================================
  //  TERMINATION / RESIGNATION BENEFITS
  // =========================================================
  async createTerminationBenefit(dto: CreateTerminationBenefitDto) {
    const exist = await this.terminationModel.findOne({ name: dto.name });
    if (exist) throw new BadRequestException('Termination Benefit already exists.');

    const created = new this.terminationModel({
      ...dto,
      status: ConfigStatus.DRAFT,
    });

    return created.save();
  }

  async findAllTerminationBenefits() {
    return this.terminationModel.find();
  }

  async findTerminationBenefitById(id: string) {
    const found = await this.terminationModel.findById(id);
    if (!found) throw new NotFoundException('Termination benefit not found');
    return found;
  }

  async updateTerminationBenefit(id: string, dto: UpdateTerminationBenefitDto) {
    const exist = await this.terminationModel.findById(id);
    if (!exist) throw new NotFoundException('Termination benefit not found');

    if (exist.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only draft termination benefits can be edited.');
    }

    // unique name validation
    if (dto.name) {
      const duplicate = await this.terminationModel.findOne({
        name: dto.name,
        _id: { $ne: id },
      });
      if (duplicate) throw new BadRequestException('Another benefit already uses this name.');
    }

    Object.assign(exist, dto);
    return exist.save();
  }

  // =========================================================
  //  FULL STRUCTURE OVERVIEW
  // =========================================================
  async getFullStructure() {
    const payGrades = await this.payGradeModel.find();
    const allowances = await this.allowanceModel.find();
    const terminationBenefits = await this.terminationModel.find();
    const payTypes = await this.payTypeModel.find();
    const insurance = await this.insuranceModel.find();
    const taxes = await this.taxRuleModel.find();
    const signingBonuses = await this.signingBonusModel.find();
    const companySettings = await this.companySettingsModel.findOne();

    return {
      payGrades,
      allowances,
      terminationBenefits,
      payTypes,
      insurance,
      taxes,
      signingBonuses,
      companySettings,
    };
  }

  // =========================================================
  //  PAY TYPES
  // =========================================================
  async createPayType(dto: CreatePayTypeDto) {
    const exists = await this.payTypeModel.findOne({ type: dto.type });
    if (exists) throw new BadRequestException('Pay type already exists.');

    if (dto.amount < 6000) {
      throw new BadRequestException('Amount must be at least 6000');
    }

    const created = new this.payTypeModel({
      ...dto,
      status: ConfigStatus.DRAFT,
    });
    return created.save();
  }

  async listPayTypes() {
    return this.payTypeModel.find();
  }

  async updatePayType(id: string, dto: UpdatePayTypeDto) {
    const exist = await this.payTypeModel.findById(id);
    if (!exist) throw new NotFoundException('Pay type not found.');
    if (exist.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only draft pay types can be edited.');
    }

    if (dto.type) {
      const duplicate = await this.payTypeModel.findOne({ type: dto.type, _id: { $ne: id } });
      if (duplicate) throw new BadRequestException('Another pay type already uses this name.');
    }

    Object.assign(exist, dto);
    return exist.save();
  }

  async deactivatePayType(id: string) {
    const exist = await this.payTypeModel.findById(id);
    if (!exist) throw new NotFoundException('Pay type not found');
    if (exist.status === ConfigStatus.APPROVED) {
      throw new BadRequestException('Approved pay types cannot be deleted.');
    }
    return this.payTypeModel.findByIdAndDelete(id);
  }

  // =========================================================
  //  INSURANCE BRACKETS
  // =========================================================
  async createInsuranceBracket(dto: CreateInsuranceBracketDto) {
    const exists = await this.insuranceModel.findOne({ name: dto.name });
    if (exists) throw new BadRequestException('Insurance bracket already exists.');
    if (dto.maxSalary < dto.minSalary) {
      throw new BadRequestException('maxSalary cannot be less than minSalary.');
    }

    const created = new this.insuranceModel({
      ...dto,
      status: ConfigStatus.DRAFT,
    });
    return created.save();
  }

  async listInsuranceBrackets() {
    return this.insuranceModel.find();
  }

  async updateInsuranceBracket(id: string, dto: UpdateInsuranceBracketDto) {
    const exist = await this.insuranceModel.findById(id);
    if (!exist) throw new NotFoundException('Insurance bracket not found.');
    if (exist.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only draft insurance brackets can be edited.');
    }

    if (dto.name) {
      const duplicate = await this.insuranceModel.findOne({ name: dto.name, _id: { $ne: id } });
      if (duplicate) throw new BadRequestException('Another insurance bracket already uses this name.');
    }

    if (dto.minSalary && dto.maxSalary && dto.maxSalary < dto.minSalary) {
      throw new BadRequestException('maxSalary cannot be less than minSalary.');
    }

    Object.assign(exist, dto);
    return exist.save();
  }

  async deactivateInsuranceBracket(id: string) {
    const exist = await this.insuranceModel.findById(id);
    if (!exist) throw new NotFoundException('Insurance bracket not found');
    if (exist.status === ConfigStatus.APPROVED) {
      throw new BadRequestException('Approved insurance brackets cannot be deactivated.');
    }
    exist.status = ConfigStatus.REJECTED;
    return exist.save();
  }

  // =========================================================
  //  TAX RULES
  // =========================================================
  async createTaxRule(dto: CreateTaxRuleDto) {
    const exists = await this.taxRuleModel.findOne({ name: dto.name });
    if (exists) throw new BadRequestException('Tax rule already exists.');

    const created = new this.taxRuleModel({
      ...dto,
      status: ConfigStatus.DRAFT,
    });
    return created.save();
  }

  async listTaxRules() {
    return this.taxRuleModel.find();
  }

  async updateTaxRule(id: string, dto: UpdateTaxRuleDto) {
    const exist = await this.taxRuleModel.findById(id);
    if (!exist) throw new NotFoundException('Tax rule not found.');
    if (exist.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only draft tax rules can be edited.');
    }

    if (dto.name) {
      const duplicate = await this.taxRuleModel.findOne({ name: dto.name, _id: { $ne: id } });
      if (duplicate) throw new BadRequestException('Another tax rule already uses this name.');
    }

    Object.assign(exist, dto);
    return exist.save();
  }

  async deactivateTaxRule(id: string) {
    const exist = await this.taxRuleModel.findById(id);
    if (!exist) throw new NotFoundException('Tax rule not found');
    if (exist.status === ConfigStatus.APPROVED) {
      throw new BadRequestException('Approved tax rules cannot be deactivated.');
    }
    exist.status = ConfigStatus.REJECTED;
    return exist.save();
  }

  // =========================================================
  //  SIGNING BONUS
  // =========================================================
  async createSigningBonus(dto: CreateSigningBonusDto) {
    const exists = await this.signingBonusModel.findOne({ positionName: dto.positionName });
    if (exists) throw new BadRequestException('Signing bonus already exists for this position.');

    const created = new this.signingBonusModel({
      ...dto,
      status: ConfigStatus.DRAFT,
    });
    return created.save();
  }

  async listSigningBonuses() {
    return this.signingBonusModel.find();
  }

  async updateSigningBonus(id: string, dto: UpdateSigningBonusDto) {
    const exist = await this.signingBonusModel.findById(id);
    if (!exist) throw new NotFoundException('Signing bonus not found.');
    if (exist.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException('Only draft signing bonuses can be edited.');
    }

    if (dto.positionName) {
      const duplicate = await this.signingBonusModel.findOne({ positionName: dto.positionName, _id: { $ne: id } });
      if (duplicate) throw new BadRequestException('Another signing bonus already uses this position.');
    }

    Object.assign(exist, dto);
    return exist.save();
  }

  async deactivateSigningBonus(id: string) {
    const exist = await this.signingBonusModel.findById(id);
    if (!exist) throw new NotFoundException('Signing bonus not found');
    if (exist.status === ConfigStatus.APPROVED) {
      throw new BadRequestException('Approved signing bonuses cannot be deactivated.');
    }
    exist.status = ConfigStatus.REJECTED;
    return exist.save();
  }

  // =========================================================
  //  COMPANY SETTINGS (single)
  // =========================================================
  async upsertCompanySettings(dto: UpdateCompanySettingsDto) {
    const existing = await this.companySettingsModel.findOne();
    
    // Convert payDate number (1-31) to Date if provided
    const updateData: any = { ...dto };
    if (dto.payDate !== undefined && typeof dto.payDate === 'number') {
      // Create a date with the payDate as the day of month (using current month/year)
      const now = new Date();
      updateData.payDate = new Date(now.getFullYear(), now.getMonth(), dto.payDate);
    }
    
    if (!existing) {
      const created = new this.companySettingsModel(updateData);
      return created.save();
    }

    Object.assign(existing, updateData);
    return existing.save();
  }

  async getCompanySettings() {
    const settings = await this.companySettingsModel.findOne();
    // Return default settings if none exist (to prevent null response)
    if (!settings) {
      return {
        payDate: 1, // Return as number (day of month) for frontend compatibility
        timeZone: 'UTC',
        currency: 'USD',
      };
    }
    
    // Convert Date payDate to number (day of month) for frontend
    const result: any = settings.toObject();
    if (result.payDate instanceof Date) {
      result.payDate = result.payDate.getDate(); // Extract day of month (1-31)
    }
    
    return result;
  }
}
