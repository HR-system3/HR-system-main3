import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApprovalController } from './approval.controller';
import { ApprovalService } from './approval.service';
import { allowance, allowanceSchema } from '../models/allowance.schema';
import { payGrade, payGradeSchema } from '../models/payGrades.schema';
import { terminationAndResignationBenefits, terminationAndResignationBenefitsSchema } from '../models/terminationAndResignationBenefits';
import { payType, payTypeSchema } from '../models/payType.schema';
import { insuranceBrackets, insuranceBracketsSchema } from '../models/insuranceBrackets.schema';
import { taxRules, taxRulesSchema } from '../models/taxRules.schema';
import { signingBonus, signingBonusSchema } from '../models/signingBonus.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: allowance.name, schema: allowanceSchema },
      { name: payGrade.name, schema: payGradeSchema },
      { name: terminationAndResignationBenefits.name, schema: terminationAndResignationBenefitsSchema },
      { name: payType.name, schema: payTypeSchema },
      { name: insuranceBrackets.name, schema: insuranceBracketsSchema },
      { name: taxRules.name, schema: taxRulesSchema },
      { name: signingBonus.name, schema: signingBonusSchema },
    ]),
  ],
  controllers: [ApprovalController],
  providers: [ApprovalService],
})
export class ApprovalModule {}