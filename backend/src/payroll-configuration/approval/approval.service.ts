import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { allowance } from '../models/allowance.schema';
import { payGrade } from '../models/payGrades.schema';
import { terminationAndResignationBenefits } from '../models/terminationAndResignationBenefits';
import { ConfigStatus } from '../enums/payroll-configuration-enums';
import { payType } from '../models/payType.schema';
import { insuranceBrackets } from '../models/insuranceBrackets.schema';
import { taxRules } from '../models/taxRules.schema';
import { signingBonus } from '../models/signingBonus.schema';

@Injectable()
export class ApprovalService {
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
  ) {}

  private getModel(type: string) {
    switch (type) {
      case 'allowance':
        return this.allowanceModel;
      case 'payGrade':
        return this.payGradeModel;
      case 'terminationBenefit':
        return this.terminationModel;
      case 'payType':
        return this.payTypeModel;
      case 'insuranceBracket':
        return this.insuranceModel;
      case 'taxRule':
        return this.taxRuleModel;
      case 'signingBonus':
        return this.signingBonusModel;
      default:
        throw new BadRequestException('Unsupported configuration type.');
    }
  }

  async listPending() {
    const pendingStatuses = [ConfigStatus.DRAFT, ConfigStatus.PENDING_MANAGER_APPROVAL];

    const [allowances, payGrades, terminationBenefits, payTypes, insurance, taxes, signingBonuses] = await Promise.all([
      this.allowanceModel.find({ status: { $in: pendingStatuses } }),
      this.payGradeModel.find({ status: { $in: pendingStatuses } }),
      this.terminationModel.find({ status: { $in: pendingStatuses } }),
      this.payTypeModel.find({ status: { $in: pendingStatuses } }),
      this.insuranceModel.find({ status: { $in: pendingStatuses } }),
      this.taxRuleModel.find({ status: { $in: pendingStatuses } }),
      this.signingBonusModel.find({ status: { $in: pendingStatuses } }),
    ]);

    return [
      ...allowances.map((a: any) => ({
        id: a._id,
        type: 'allowance',
        name: a.name,
        status: a.status,
        createdAt: a.createdAt,
      })),
      ...payGrades.map((p: any) => ({
        id: p._id,
        type: 'payGrade',
        name: p.grade,
        status: p.status,
        createdAt: p.createdAt,
      })),
      ...terminationBenefits.map((t: any) => ({
        id: t._id,
        type: 'terminationBenefit',
        name: t.name,
        status: t.status,
        createdAt: t.createdAt,
      })),
      ...payTypes.map((p: any) => ({
        id: p._id,
        type: 'payType',
        name: p.type,
        status: p.status,
        createdAt: p.createdAt,
      })),
      ...insurance.map((i: any) => ({
        id: i._id,
        type: 'insuranceBracket',
        name: i.name,
        status: i.status,
        createdAt: i.createdAt,
      })),
      ...taxes.map((t: any) => ({
        id: t._id,
        type: 'taxRule',
        name: t.name,
        status: t.status,
        createdAt: t.createdAt,
      })),
      ...signingBonuses.map((s: any) => ({
        id: s._id,
        type: 'signingBonus',
        name: s.positionName,
        status: s.status,
        createdAt: s.createdAt,
      })),
    ];
  }

  async approve(dto: { type: string; id: string }) {
    const model = this.getModel(dto.type) as Model<any>;
    const entity = await model.findById(dto.id);
    if (!entity) throw new NotFoundException('Configuration not found.');

    if (entity.status === ConfigStatus.APPROVED) {
      throw new BadRequestException('Configuration already approved.');
    }

    entity.status = ConfigStatus.APPROVED;
    entity.approvedAt = new Date();
    await entity.save();
    return { message: 'Approved', id: dto.id, type: dto.type };
  }

  async reject(dto: { type: string; id: string }) {
    const model = this.getModel(dto.type) as Model<any>;
    const entity = await model.findById(dto.id);
    if (!entity) throw new NotFoundException('Configuration not found.');

    entity.status = ConfigStatus.REJECTED;
    await entity.save();
    return { message: 'Rejected', id: dto.id, type: dto.type };
  }
}