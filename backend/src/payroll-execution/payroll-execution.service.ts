import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { employeePayrollDetails, employeePayrollDetailsDocument } from './models/employeePayrollDetails.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { allowance, allowanceDocument } from '../payroll-configuration/models/allowance.schema';
import { payGrade, payGradeDocument } from '../payroll-configuration/models/payGrades.schema';
import { payrollRuns, payrollRunsDocument } from './models/payrollRuns.schema';
import { PayRollStatus, PayRollPaymentStatus, BankStatus ,PaySlipPaymentStatus } from './enums/payroll-execution-enum';
import { taxRules, taxRulesDocument } from '../payroll-configuration/models/taxRules.schema';
import { insuranceBrackets, insuranceBracketsDocument } from '../payroll-configuration/models/insuranceBrackets.schema';
import { ConfigStatus } from '../payroll-configuration/enums/payroll-configuration-enums';
import { paySlip, PayslipDocument } from './models/payslip.schema';
import { employeeSigningBonus, employeeSigningBonusDocument } from './models/EmployeeSigningBonus.schema';
import { BonusStatus } from './enums/payroll-execution-enum';
import { terminationAndResignationBenefits, terminationAndResignationBenefitsDocument } from '../payroll-configuration/models/terminationAndResignationBenefits';
import { EmployeeStatus } from '../employee-profile/enums/employee-profile.enums';



@Injectable()
export class PayrollExecutionService {
  constructor(
    @InjectModel(employeePayrollDetails.name) private payrollDetailsModel: Model<employeePayrollDetailsDocument>,
    @InjectModel(EmployeeProfile.name) private employeeModel: Model<EmployeeProfileDocument>,
    @InjectModel(allowance.name) private allowanceModel: Model<allowanceDocument>,
    @InjectModel(payGrade.name) private payGradeModel: Model<payGradeDocument>,
    @InjectModel(payrollRuns.name) private payrollRunsModel: Model<payrollRunsDocument>,
    @InjectModel(taxRules.name) private taxRulesModel: Model<taxRulesDocument>,
    @InjectModel(insuranceBrackets.name) private insuranceBracketsModel: Model<insuranceBracketsDocument>,
    @InjectModel(paySlip.name) private paySlipModel: Model<PayslipDocument>,
    @InjectModel(employeeSigningBonus.name)
    private signingBonusModel: Model<employeeSigningBonusDocument>,
    @InjectModel(employeeSigningBonus.name)
    private employeeSigningBonusModel: Model<employeeSigningBonusDocument>,
    @InjectModel(terminationAndResignationBenefits.name)
    private terminationBenefitsModel: Model<terminationAndResignationBenefitsDocument>,
    @InjectModel(terminationAndResignationBenefits.name)
    private readonly benefitsModel: Model<terminationAndResignationBenefitsDocument>,
  ) {}

  private toObjectId(id: Types.ObjectId | string, label = 'id'): Types.ObjectId {
    if (id instanceof Types.ObjectId) return id;
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    throw new BadRequestException(`Invalid ${label}`);
  }

  private async findPayrollRunByIdentifier(runId: Types.ObjectId | string): Promise<payrollRunsDocument> {
    const candidate =
      typeof runId === 'string' ? runId.trim() : runId;

    // Try _id when valid
    if (candidate instanceof Types.ObjectId || (typeof candidate === 'string' && Types.ObjectId.isValid(candidate))) {
      const payrollRunById = await this.payrollRunsModel.findById(candidate);
      if (payrollRunById) return payrollRunById;
    }

    // Fallback to business runId
    const payrollRunByBusinessId = await this.payrollRunsModel.findOne({ runId: candidate });
    if (payrollRunByBusinessId) return payrollRunByBusinessId;

    // Last resort: search both fields explicitly
    const payrollRun = await this.payrollRunsModel.findOne({
      $or: [{ runId: candidate }, { _id: candidate }],
    } as any);
    if (payrollRun) return payrollRun;

    throw new NotFoundException('Payroll run not found');
  }

  private resolvePayrollPeriod(period?: string | Date): Date {
    if (period) {
      return new Date(period);
    }

    const today = new Date();
    const endOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));
    return endOfMonth;
  }

  private getPeriodBounds(payrollPeriod: Date): { start: Date; end: Date } {
    const end = new Date(payrollPeriod);
    end.setUTCHours(0, 0, 0, 0);

    const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
    return { start, end };
  }

  private async updatePayrollRunAggregates(payrollRunId: Types.ObjectId | string): Promise<void> {
    const payrollRun = await this.findPayrollRunByIdentifier(payrollRunId);
    const payrollDetails = await this.payrollDetailsModel.find({ payrollRunId: payrollRun._id });

    const exceptions = payrollDetails.filter((detail) => (detail.exceptions ?? '').trim().length > 0).length;
    const totalNetPay = payrollDetails.reduce((sum, detail) => sum + (detail.netPay ?? 0), 0);

    payrollRun.employees = payrollDetails.length;
    payrollRun.exceptions = exceptions;
    payrollRun.totalnetpay = totalNetPay;

    await payrollRun.save();
  }

  private toNumberOrZero(value: unknown): number {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  // Main payroll calculation for a payroll run
  async calculatePayrollForRun(payrollRunId: Types.ObjectId | string): Promise<employeePayrollDetails[]> {
    const payrollRun = await this.findPayrollRunByIdentifier(payrollRunId);
    const { start: payPeriodStart, end: payPeriodEnd } = this.getPeriodBounds(payrollRun.payrollPeriod);

    // Include new hires (probation) and exits so proration/benefits apply
    const employees = await this.employeeModel.find({
      status: { $in: [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION, EmployeeStatus.RETIRED, EmployeeStatus.TERMINATED] },
    });

    const approvedAllowances = await this.allowanceModel.find({ status: ConfigStatus.APPROVED }) as unknown as allowance[];
    const approvedBenefits = await this.terminationBenefitsModel.find({ status: ConfigStatus.APPROVED });

    const payrollDetailsList: employeePayrollDetails[] = [];

    for (const employee of employees) {
      const grade = await this.payGradeModel.findById(employee.payGradeId);
      if (!grade) continue;

      const baseSalary = await this.calculateProratedSalary(employee._id, payPeriodStart, payPeriodEnd);
      const totalAllowances = approvedAllowances.reduce((sum, a) => sum + this.toNumberOrZero(a.amount), 0);
      const deductions = await this.calculateStatutoryDeductions(employee._id, baseSalary);

      const signingBonuses = await this.employeeSigningBonusModel.find({
        employeeId: employee._id,
        status: BonusStatus.APPROVED,
      }).populate('signingBonusId');

      const totalBonus = signingBonuses.reduce(
        (sum, b) => sum + this.toNumberOrZero((b.signingBonusId as any)?.amount),
        0,
      );

      const benefitTotal = [EmployeeStatus.RETIRED, EmployeeStatus.TERMINATED].includes(employee.status)
        ? approvedBenefits.reduce((sum, benefit) => sum + this.toNumberOrZero(benefit.amount), 0)
        : 0;

      const netSalary = baseSalary + totalAllowances + totalBonus + benefitTotal - deductions;

      const existingDetail = await this.payrollDetailsModel.findOne({
        employeeId: employee._id,
        payrollRunId: payrollRun._id,
      });

      const bankStatus = existingDetail?.bankStatus ?? BankStatus.VALID;

      if (existingDetail) {
        existingDetail.baseSalary = baseSalary;
        existingDetail.allowances = totalAllowances;
        existingDetail.deductions = deductions;
        existingDetail.netSalary = netSalary;
        existingDetail.netPay = netSalary;
        existingDetail.bonus = totalBonus || undefined;
        existingDetail.benefit = benefitTotal || undefined;
        existingDetail.bankStatus = bankStatus;

        await existingDetail.save();
        payrollDetailsList.push(existingDetail);
      } else {
        const payrollDetail = new this.payrollDetailsModel({
          employeeId: employee._id,
          baseSalary,
          allowances: totalAllowances,
          deductions,
          netSalary,
          netPay: netSalary,
          bankStatus,
          payrollRunId: payrollRun._id,
          bonus: totalBonus || undefined,
          benefit: benefitTotal || undefined,
        });

        await payrollDetail.save();
        payrollDetailsList.push(payrollDetail);
      }
    }

    await this.flagPayrollIrregularities(payrollRun._id);
    await this.updatePayrollRunAggregates(payrollRun._id);

    return payrollDetailsList;
  }

  // Prorated salary for mid-month hires/terminations
  async calculateProratedSalary(employeeId: Types.ObjectId, payPeriodStart: Date, payPeriodEnd: Date): Promise<number> {
    const employee = await this.employeeModel.findById(employeeId).populate('payGradeId');
    if (!employee) throw new Error('Employee not found');

    const grade = await this.payGradeModel.findById(employee.payGradeId);
    if (!grade) throw new Error('Pay grade not found');

    const baseSalary = this.toNumberOrZero(grade.baseSalary);
    if (baseSalary === 0) {
      return 0;
    }
    const hireDate = employee.dateOfHire;
    const terminationDate = employee.contractEndDate || payPeriodEnd;

    const periodStartTime = payPeriodStart?.getTime?.();
    const periodEndTime = payPeriodEnd?.getTime?.();
    if (!Number.isFinite(periodStartTime) || !Number.isFinite(periodEndTime)) {
      return baseSalary;
    }

    const start = hireDate > payPeriodStart ? hireDate : payPeriodStart;
    const end = terminationDate < payPeriodEnd ? terminationDate : payPeriodEnd;

    const totalDaysInMonth = Math.max(
      1,
      Math.floor((payPeriodEnd.getTime() - payPeriodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    );
    const daysWorked = Math.max(
      0,
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    );

    const prorated = (baseSalary / totalDaysInMonth) * daysWorked;
    return Number.isFinite(prorated) ? prorated : 0;
  }

  // Apply statutory deductions: tax + insurance
  async calculateStatutoryDeductions(employeeId: Types.ObjectId, baseSalary: number): Promise<number> {
    // Taxes: use rate as percentage
    const taxDocs = await this.taxRulesModel.find({ status: ConfigStatus.APPROVED }) as unknown as taxRules[];
    let totalTaxes = 0;
    for (const tax of taxDocs) {
      totalTaxes += (baseSalary * this.toNumberOrZero(tax.rate)) / 100;
    }

    // Insurance: only brackets applicable to this salary
    const insuranceDocs = await this.insuranceBracketsModel.find({ status: ConfigStatus.APPROVED }) as unknown as insuranceBrackets[];
    let totalInsurance = 0;
    for (const ins of insuranceDocs) {
      const min = this.toNumberOrZero(ins.minSalary);
      const max = this.toNumberOrZero(ins.maxSalary);
      const rate = this.toNumberOrZero(ins.employeeRate);
      if (baseSalary >= min && baseSalary <= (max || Number.MAX_SAFE_INTEGER)) {
        totalInsurance += (baseSalary * rate) / 100;
      }
    }

    return totalTaxes + totalInsurance;
  }




  async autoGenerateDraftPayrollRun(
    entity: string,
    payrollSpecialistId: string,
    payrollPeriod?: string | Date,
  ): Promise<payrollRunsDocument> {
    const period = this.resolvePayrollPeriod(payrollPeriod);
    const normalizedPeriod = new Date(period);
    normalizedPeriod.setUTCHours(0, 0, 0, 0);

    const existingRun = await this.payrollRunsModel.findOne({
      entity,
      payrollPeriod: normalizedPeriod,
    });

    if (existingRun) {
      if (existingRun.status !== PayRollStatus.LOCKED) {
        await this.calculatePayrollForRun(existingRun._id);
      }
      await this.updatePayrollRunAggregates(existingRun._id);
      return existingRun;
    }

    const draftRun = await this.createDraftPayrollRun(
      entity,
      normalizedPeriod,
      this.toObjectId(payrollSpecialistId, 'payrollSpecialistId'),
    );

    await this.calculatePayrollForRun(draftRun._id);

    return draftRun;
  }

  async createDraftPayrollRun(entity: string, payrollPeriod: Date, payrollSpecialistId: Types.ObjectId): Promise<payrollRunsDocument> {
    // Generate a unique runId like PR-2025-0001
    const lastRun = await this.payrollRunsModel.findOne({}).sort({ createdAt: -1 });
    const nextNumber = lastRun ? Number(lastRun.runId.split('-')[2]) + 1 : 1;
    const runId = `PR-${payrollPeriod.getFullYear()}-${String(nextNumber).padStart(4, '0')}`;

    const employees = await this.employeeModel.find({ status: EmployeeStatus.ACTIVE });
    
    const draftRun = new this.payrollRunsModel({
      runId,
      payrollPeriod,
      status: PayRollStatus.DRAFT,
      entity,
      employees: employees.length,
      exceptions: 0,
      totalnetpay: 0,
      payrollSpecialistId,
      paymentStatus: PayRollPaymentStatus.PENDING,
    });

    await draftRun.save();
    return draftRun;
  }




  async flagPayrollIrregularities(payrollRunId: Types.ObjectId) {
    const payrollDetails = await this.payrollDetailsModel.find({ payrollRunId });
  
    const flagged: employeePayrollDetails[] = [];
  
    for (const detail of payrollDetails) {
      let exceptionMessages: string[] = [];
  
      // Check for missing bank account
      if (detail.bankStatus === BankStatus.MISSING) {
        exceptionMessages.push('Missing bank account');
      }
  
      // Check for negative net pay
      if (detail.netPay < 0) {
        exceptionMessages.push('Negative net pay');
      }
  
      // Check for sudden salary spikes compared to previous payrolls
      const lastPayroll = await this.payrollDetailsModel
        .findOne({
          employeeId: detail.employeeId, // ObjectId is fine here
          _id: { $ne: detail._id },
        })
        .sort({ createdAt: -1 });
  
      if (lastPayroll) {
        const diff = detail.netSalary - lastPayroll.netSalary;
        if (diff > lastPayroll.netSalary * 0.2) {
          // more than 20% increase
          exceptionMessages.push('Sudden salary spike');
        }
      }
  
      if (exceptionMessages.length > 0) {
        detail.exceptions = exceptionMessages.join('; ');
        await detail.save();
        flagged.push(detail);
      } else if (detail.exceptions) {
        detail.exceptions = '';
        await detail.save();
      }
    }

    await this.updatePayrollRunAggregates(payrollRunId);
  
    return flagged;
  }

  async getRunByRunId(runId: string) {
    return this.findPayrollRunByIdentifier(runId);
  }
  
  async getPayrollPreview(payrollRunId: Types.ObjectId | string): Promise<any> {
    const payrollRun = await this.findPayrollRunByIdentifier(payrollRunId);

    const hasDetails = await this.payrollDetailsModel.exists({
      payrollRunId: payrollRun._id,
    });

    if (!hasDetails) {
      await this.calculatePayrollForRun(payrollRun._id);
    }

    await this.flagPayrollIrregularities(payrollRun._id);
    await this.updatePayrollRunAggregates(payrollRun._id);
  
    const payrollDetails = await this.payrollDetailsModel
      .find({ payrollRunId: payrollRun._id })
      .populate('employeeId', 'employeeNumber workEmail firstName lastName')
      .lean();
  
    // Flag irregularities
    const flaggedDetails = payrollDetails.map((detail) => {
      const issues: string[] = [];
  
      if (detail.bankStatus === BankStatus.MISSING)
        issues.push('Missing bank account');
      if (detail.netPay < 0) issues.push('Negative net pay');
      if (detail.exceptions) issues.push(detail.exceptions);
      // You can add more rules here, e.g., sudden salary spikes vs previous month
      // Example: if detail.netPay > previousMonthNet * 1.5 => issues.push('Salary spike')
  
      return {
        ...detail,
        issues,
        exceptions: issues.length > 0 ? issues.join(', ') : detail.exceptions || null,
        canFinalize: issues.length === 0,
      };
    });
  
    // Overall payroll run can finalize if all employee details have canFinalize = true
    const canFinalizeRun = flaggedDetails.every((d) => d.canFinalize);

    const irregularities = flaggedDetails
      .filter((detail) => detail.issues?.length)
      .map((detail) => ({
        employeeId: detail.employeeId,
        employee: (detail as any).employeeId,
        issue: detail.issues?.join(', ') ?? '',
        bankStatus: detail.bankStatus,
        netPay: detail.netPay,
      }));

    const totals = flaggedDetails.reduce(
      (acc, detail) => {
        acc.totalAllowances += detail.allowances ?? 0;
        acc.totalDeductions += detail.deductions ?? 0;
        acc.totalNetPay += detail.netPay ?? 0;
        return acc;
      },
      { totalAllowances: 0, totalDeductions: 0, totalNetPay: 0 },
    );
  
    return {
      run: payrollRun,
      totals,
      canFinalizeRun,
      payrollDetails: flaggedDetails,
      irregularities,
    };
  }

  async lockPayrollRun(payrollRunId: Types.ObjectId | string, managerId: Types.ObjectId | string): Promise<payrollRunsDocument> {
    const payrollRun = await this.findPayrollRunByIdentifier(payrollRunId);

    if (payrollRun.status === PayRollStatus.LOCKED) {
      throw new Error('Payroll run is already locked');
    }

    if (payrollRun.status !== PayRollStatus.APPROVED) {
      throw new Error('Only approved payroll runs can be locked');
    }

    payrollRun.status = PayRollStatus.LOCKED;

    // cast to any to bypass TS type error
    if (managerId) {
      (payrollRun as any).payrollManagerId = this.toObjectId(managerId, 'managerId');
    }

    payrollRun.managerApprovalDate = new Date();

    return await payrollRun.save();
  }

  async unlockPayrollRun(
    payrollRunId: Types.ObjectId | string,
    managerId: Types.ObjectId | string,
    reason: string
  ): Promise<payrollRunsDocument> {
    const payrollRun = await this.findPayrollRunByIdentifier(payrollRunId);

    if (payrollRun.status !== PayRollStatus.LOCKED) {
      throw new Error('Payroll run is not locked');
    }

    payrollRun.status = PayRollStatus.UNLOCKED;

    if (managerId) {
      (payrollRun as any).payrollManagerId = this.toObjectId(managerId, 'managerId');
    }

    payrollRun.unlockReason = reason;
    payrollRun.managerApprovalDate = new Date();

    return await payrollRun.save();
  }

  async isPayrollRunLocked(payrollRunId: Types.ObjectId | string): Promise<boolean> {
    const payrollRun = await this.findPayrollRunByIdentifier(payrollRunId);
    return payrollRun.status === PayRollStatus.LOCKED;
  }



  async generatePayslips(payrollRunId: Types.ObjectId): Promise<PayslipDocument[]> {
    // Fetch payroll details for the run
    const payrollDetails = await this.payrollDetailsModel.find({ payrollRunId });

    const payslips: PayslipDocument[] = [];

    for (const detail of payrollDetails) {
      const employee = await this.employeeModel.findById(detail.employeeId);
      if (!employee) continue;

      // Fetch allowances, taxes, insurances for this employee
      const allowances: allowance[] = []; // Optional: fetch approved allowances if needed
      const taxes: taxRules[] = []; // Optional: fetch approved tax rules
      const insurances: insuranceBrackets[] = []; // Optional: fetch insurance brackets

      const earnings = {
        baseSalary: detail.baseSalary,
        allowances: allowances,
        bonuses: detail.bonus ? [{ amount: detail.bonus, name: 'Bonus' }] : [],
        benefits: detail.benefit ? [{ amount: detail.benefit, name: 'Benefit' }] : [],
        refunds: [], // populate if needed
      };

      const deductions = {
        taxes: taxes,
        insurances: insurances,
        penalties: undefined, // optional: fetch penalties
      };

      const payslip = new this.paySlipModel({
        employeeId: employee._id,
        payrollRunId: detail.payrollRunId,
        earningsDetails: earnings,
        deductionsDetails: deductions,
        totalGrossSalary: detail.netSalary + detail.deductions,
        totaDeductions: detail.deductions,
        netPay: detail.netPay,
        paymentStatus: PaySlipPaymentStatus.PENDING,
      });

      await payslip.save();
      payslips.push(payslip);

      // Optional: send email to employee
      // await this.sendPayslipEmail(employee.workEmail, payslip);
    }

    return payslips;
  }

  async getPayslipsForRun(payrollRunId: Types.ObjectId | string) {
    const payrollRun = await this.findPayrollRunByIdentifier(payrollRunId);
    return this.paySlipModel
      .find({ payrollRunId: payrollRun._id })
      .populate('employeeId', 'employeeNumber firstName lastName workEmail')
      .lean();
  }

  // Optional stub for email sending
  async sendPayslipEmail(email: string, payslip: PayslipDocument) {
    console.log(`Sending payslip to ${email}`);
    // integrate with nodemailer or any email service
  }



  
  async sendPayrollForApproval(
    payrollRunId: string,
    managerId: string,
    financeId: string,
  ): Promise<payrollRuns> {
    const payrollRun = await this.findPayrollRunByIdentifier(payrollRunId);
  
    if (![PayRollStatus.DRAFT, PayRollStatus.UNDER_REVIEW].includes(payrollRun.status)) {
      throw new Error('Only draft payroll runs can be sent for approval');
    }

    if (managerId) {
      payrollRun.payrollManagerId = this.toObjectId(managerId, 'managerId') as any;
    }
    if (financeId) {
      payrollRun.financeStaffId = this.toObjectId(financeId, 'financeId') as any;
    }

    payrollRun.status = PayRollStatus.UNDER_REVIEW;
  
    await payrollRun.save();
  
    return payrollRun;
  }
  
  
  

  async getPayrollApprovalStatus(payrollRunId: Types.ObjectId | string): Promise<payrollRunsDocument> {
    return this.findPayrollRunByIdentifier(payrollRunId);
  }

  async approvePayrollByFinance(
    payrollRunId: string,
    financeStaffId: string,
  ): Promise<payrollRunsDocument> {
    const payrollRun = await this.findPayrollRunByIdentifier(payrollRunId);
  
    if (!financeStaffId) {
      throw new Error('Finance staff is required');
    }
  
    if (![PayRollStatus.PENDING_FINANCE_APPROVAL, PayRollStatus.UNDER_REVIEW].includes(payrollRun.status)) {
      throw new Error('Payroll run must be pending finance approval');
    }
  
    payrollRun.financeStaffId = this.toObjectId(financeStaffId, 'financeStaffId') as any;
  
    payrollRun.financeApprovalDate = new Date();
    payrollRun.status = PayRollStatus.APPROVED;
    payrollRun.paymentStatus = PayRollPaymentStatus.PAID;
  
    await payrollRun.save();
    await this.generatePayslips(payrollRun._id);
    await this.updatePayrollRunAggregates(payrollRun._id);
    return payrollRun;
  }

  //nour
  async unlockPayroll(
    payrollRunId: string,
    managerId: string,
    reason: string,
  ): Promise<payrollRunsDocument> {
    return this.unlockPayrollRun(payrollRunId, managerId, reason);
  }

  async resolvePayrollIrregularity(
    payrollRunId: string,
    managerId: string,
    resolvedDetails: { employeeId: string; resolutionNote: string }[],
  ): Promise<payrollRunsDocument> {
    const payrollRun = await this.findPayrollRunByIdentifier(payrollRunId);
  
    if (![PayRollStatus.UNDER_REVIEW, PayRollStatus.APPROVED].includes(payrollRun.status)) {
      throw new Error('Payroll run is not eligible for irregularity resolution');
    }
  
    // Update exceptions for each employee
    for (const detail of resolvedDetails) {
      const payrollDetail = await this.payrollDetailsModel.findOne({
        payrollRunId: payrollRun._id,
        employeeId: detail.employeeId,
      });
  
      if (!payrollDetail) continue;
  
      payrollDetail.exceptions = '';
      await payrollDetail.save();
    }
  
    if (managerId) {
      payrollRun.payrollManagerId = this.toObjectId(managerId, 'managerId') as any;
    }
  
    await payrollRun.save();
    await this.updatePayrollRunAggregates(payrollRun._id);
    return payrollRun;
  }


  async approvePayrollByManager(
    payrollRunId: string,
    managerId: string,
  ): Promise<payrollRunsDocument> {
    const payrollRun = await this.findPayrollRunByIdentifier(payrollRunId);
  
    // Only payroll runs under DRAFT or UNDER_REVIEW can be approved by manager
    if (![PayRollStatus.DRAFT, PayRollStatus.UNDER_REVIEW].includes(payrollRun.status)) {
      throw new Error('Payroll run is not eligible for manager approval');
    }
  
    // Assign manager and mark approval
    payrollRun.payrollManagerId = this.toObjectId(managerId, 'managerId') as any;
    payrollRun.managerApprovalDate = new Date();
    payrollRun.status = PayRollStatus.PENDING_FINANCE_APPROVAL; // Keep it under review until finance approves
  
    await payrollRun.save();
    return payrollRun;
  }


  async initiatePayrollAutomatically(
    entity: string,
    payrollSpecialistId: string,
    payrollPeriod?: string | Date,
  ): Promise<payrollRunsDocument> {
    // Count existing employees and initialize totals as 0
    const employeeCount = await this.employeeModel.countDocuments({
      status: { $in: [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION, EmployeeStatus.RETIRED, EmployeeStatus.TERMINATED] },
    });
    const period = this.resolvePayrollPeriod(payrollPeriod);
  
    const newPayrollRun = new this.payrollRunsModel({
      runId: `PR-${period.getFullYear()}-${(period.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-0001`, // simple runId pattern
      payrollPeriod: period,
      status: PayRollStatus.DRAFT,
      entity,
      employees: employeeCount,
      exceptions: 0,
      totalnetpay: 0,
      payrollSpecialistId: this.toObjectId(payrollSpecialistId, 'payrollSpecialistId') as any,
      paymentStatus: PayRollPaymentStatus.PENDING,
    });
  
    await newPayrollRun.save();
    await this.calculatePayrollForRun(newPayrollRun._id);
    await this.updatePayrollRunAggregates(newPayrollRun._id);
    return newPayrollRun;
  }
  
  async approvePayrollInitiation(
    payrollRunId: string,
    payrollSpecialistId: string,
  ): Promise<payrollRunsDocument> {
    const payrollRun = await this.findPayrollRunByIdentifier(payrollRunId);
  
    if (!payrollRun) {
      throw new Error('Payroll run not found');
    }
  
    // Only the Payroll Specialist who created the run can approve it
    if (payrollRun.payrollSpecialistId.toString() !== payrollSpecialistId) {
      throw new Error('Unauthorized: Only the Payroll Specialist who initiated this run can approve it');
    }
  
    if (payrollRun.status !== PayRollStatus.DRAFT) {
      throw new Error('Only draft payroll runs can be approved by Payroll Specialist');
    }
  
    // Approve the payroll initiation
    payrollRun.status = PayRollStatus.UNDER_REVIEW;
    await payrollRun.save();
  
    return payrollRun;
  }
  
  async editPayrollInitiation(
    payrollRunId: string,
    payrollSpecialistId: string,
    updates: Partial<{
      entity: string;
      employees: number;
      exceptions: number;
      totalnetpay: number;
      // any other editable fields you want to allow
    }>,
  ): Promise<payrollRunsDocument> {
    const payrollRun = await this.findPayrollRunByIdentifier(payrollRunId);
  
    if (!payrollRun) {
      throw new Error('Payroll run not found');
    }
  
    // Only the Payroll Specialist who created the run can edit it
    if (payrollRun.payrollSpecialistId.toString() !== payrollSpecialistId) {
      throw new Error('Unauthorized: Only the Payroll Specialist who initiated this run can edit it');
    }
  
    // Only allow editing if the run is DRAFT or APPROVED_BY_SPECIALIST
    if (![PayRollStatus.DRAFT, PayRollStatus.APPROVED, PayRollStatus.UNLOCKED].includes(payrollRun.status)) {
      throw new Error('Payroll run cannot be edited after manager approval or under review');
    }
  
    // Apply updates
    Object.assign(payrollRun, updates);
  
    await payrollRun.save();
  
    return payrollRun;
  }
  
  async applySigningBonuses(payrollRunId: string): Promise<void> {
    const payrollRun = await this.findPayrollRunByIdentifier(payrollRunId);
    if (!payrollRun) throw new Error('Payroll run not found');

    const employees = await this.employeeModel.find({ status: EmployeeStatus.ACTIVE });

    for (const employee of employees) {
      // Fetch approved employee signing bonuses
      const bonuses = await this.employeeSigningBonusModel.find({
        employeeId: employee._id,
        status: BonusStatus.APPROVED,
      }).populate('signingBonusId'); // populate to get the amount

      if (bonuses.length === 0) continue;

      const payrollDetail = await this.payrollDetailsModel.findOne({
        employeeId: employee._id,
        payrollRunId: payrollRun._id,
      });

      if (!payrollDetail) continue;

      const totalBonus = bonuses.reduce(
        (sum, b) => sum + ((b.signingBonusId as any).amount ?? 0),
        0,
      );

      payrollDetail.bonus = totalBonus;
      payrollDetail.netSalary += totalBonus;
      payrollDetail.netPay += totalBonus;

      await payrollDetail.save();
    }
    await this.updatePayrollRunAggregates(payrollRun._id);
  }


  async approveEmployeeSigningBonus(
    employeeBonusId: string,
    payrollRunId: string
  ): Promise<employeeSigningBonusDocument> {
    const payrollRun = await this.findPayrollRunByIdentifier(payrollRunId);
    // Find the employee bonus record
    const bonus = await this.employeeSigningBonusModel.findById(employeeBonusId);
    if (!bonus) throw new Error('Employee signing bonus not found');
  
    if (bonus.status !== BonusStatus.PENDING) {
      throw new Error('Only pending bonuses can be approved');
    }
  
    // Mark as approved
    bonus.status = BonusStatus.APPROVED;
    bonus.paymentDate = new Date();
  
    await bonus.save();
  
    // Optionally, add this bonus to the payroll run
    const payrollDetail = await this.payrollDetailsModel.findOne({
      employeeId: bonus.employeeId,
      payrollRunId: payrollRun._id,
    });

    if (payrollDetail) {
      payrollDetail.bonus = (payrollDetail.bonus || 0) + ((bonus.signingBonusId as any).amount || 0);
      payrollDetail.netSalary += ((bonus.signingBonusId as any).amount || 0);
      payrollDetail.netPay += ((bonus.signingBonusId as any).amount || 0);
      await payrollDetail.save();
    }
  
    await this.updatePayrollRunAggregates(payrollRun._id);
  
    return bonus;
  }

  async editEmployeeSigningBonus(
    employeeBonusId: string,
    updateData: Partial<{
      paymentDate: Date;
      status: BonusStatus;
    }>,
  ): Promise<employeeSigningBonus> {
    const employeeBonus = await this.employeeSigningBonusModel.findById(employeeBonusId);
  
    if (!employeeBonus) {
      throw new Error('Employee signing bonus record not found');
    }
  
    // Update allowed fields
    if (updateData.paymentDate !== undefined) {
      employeeBonus.paymentDate = updateData.paymentDate;
    }
    if (updateData.status !== undefined) {
      employeeBonus.status = updateData.status;
    }
  
    await employeeBonus.save();
    return employeeBonus;
  }



  async processResignationBenefits(employeeId: string, payrollRunId: string): Promise<employeePayrollDetails> {
    const employeeDoc = await this.employeeModel.findById(employeeId);
    if (!employeeDoc) throw new Error('Employee not found');
    const payrollRun = await this.findPayrollRunByIdentifier(payrollRunId);

    // Convert to plain object to access schema fields safely
    const employee = employeeDoc.toObject() as EmployeeProfile;

    if (![EmployeeStatus.RETIRED, EmployeeStatus.TERMINATED].includes(employee.status)) {
      throw new Error('Employee is not marked as resigned or terminated');
    }

    const payGradeDoc = await this.payGradeModel.findById(employee.payGradeId);
    if (!payGradeDoc) throw new Error('Pay grade not found');

    const payGrade = payGradeDoc.toObject() as any; // type assertion to access baseSalary

    // Fetch all applicable resignation benefits
    const benefits = await this.terminationBenefitsModel.find({
      status: ConfigStatus.APPROVED,
    });    

    const totalBenefits = benefits.reduce((sum, b) => sum + b.amount, 0);

    // Calculate final net pay (base salary + benefits)
    const baseSalary = payGrade.baseSalary;
    const netPay = baseSalary + totalBenefits;

    // Create payroll detail entry
    const payrollDetail = new this.payrollDetailsModel({
      employeeId: employeeDoc._id,
      baseSalary,
      allowances: 0,
      deductions: 0,
      netSalary: netPay,
      netPay,
      bankStatus: BankStatus.VALID,
      payrollRunId: payrollRun._id,
      benefit: totalBenefits,
    });

    await payrollDetail.save();
    await this.updatePayrollRunAggregates(payrollRunId);

    return payrollDetail;
  }
  
  async approveResignationBenefits(
    employeePayrollDetailId: Types.ObjectId,
  ): Promise<employeePayrollDetails> {
    const payrollDetail = await this.payrollDetailsModel.findById(employeePayrollDetailId);
    if (!payrollDetail) throw new Error('Payroll detail not found');

    if (!payrollDetail.benefit || payrollDetail.benefit <= 0) {
      throw new Error('No resignation benefits to approve for this employee');
    }

    // Clear exception flag once approved
    payrollDetail.exceptions = '';
    await payrollDetail.save();
    await this.updatePayrollRunAggregates(payrollDetail.payrollRunId);

    return payrollDetail;
  }

  async previewResignationBenefits(employeePayrollDetailId: Types.ObjectId): Promise<employeePayrollDetails> {
    const payrollDetail = await this.payrollDetailsModel.findById(employeePayrollDetailId);
    if (!payrollDetail) throw new Error('Payroll detail not found');

    return payrollDetail;
  }


  async editResignationBenefits(
    payrollDetailId: string,
    newBenefitAmount: number,
    newBonusAmount?: number,
  ): Promise<employeePayrollDetails> {
    const payrollDetail = await this.payrollDetailsModel.findById(payrollDetailId);
    if (!payrollDetail) throw new Error('Payroll detail not found');

    // Update the benefits and optionally bonus
    const benefitDelta = newBenefitAmount - (payrollDetail.benefit ?? 0);
    payrollDetail.benefit = newBenefitAmount;
    payrollDetail.netSalary += benefitDelta;
    payrollDetail.netPay += benefitDelta;

    if (newBonusAmount !== undefined) {
      const bonusDelta = newBonusAmount - (payrollDetail.bonus ?? 0);
      payrollDetail.bonus = newBonusAmount;
      payrollDetail.netSalary += bonusDelta;
      payrollDetail.netPay += bonusDelta;
    }

    await payrollDetail.save();
    await this.updatePayrollRunAggregates(payrollDetail.payrollRunId);
    return payrollDetail;
  }

  async processResignationBenefit(
    employeeId: string,
    benefitId: string
  ): Promise<employeePayrollDetailsDocument> {
    const benefit = await this.benefitsModel.findById(benefitId);
    if (!benefit) throw new Error('Benefit not found');
  
    if (benefit.status !== ConfigStatus.APPROVED) {
      throw new Error('Benefit must be approved before processing');
    }
  
    const employee = await this.employeeModel.findById(employeeId);
    if (!employee) throw new Error('Employee not found');
  
    // Example: adding benefit to employee payroll
    const payrollDetails = await this.payrollDetailsModel.findOne({ employeeId: employee._id });
if (!payrollDetails) throw new Error('Payroll details not found for this employee');

const benefitDelta = benefit.amount - (payrollDetails.benefit ?? 0);
payrollDetails.benefit = benefit.amount;
payrollDetails.netSalary += benefitDelta;
payrollDetails.netPay += benefitDelta;
await payrollDetails.save();

if (payrollDetails.payrollRunId) {
  await this.updatePayrollRunAggregates(payrollDetails.payrollRunId);
}

return payrollDetails;
  }

  async getAllPayrollRuns(): Promise<payrollRuns[]> {
    return this.payrollRunsModel.find().sort({ createdAt: -1 }).exec();
  }

  async getAllIrregularities(): Promise<any[]> {
    // Get all payroll details with exceptions or issues
    const payrollDetails = await this.payrollDetailsModel
      .find({
        $or: [
          { exceptions: { $exists: true, $ne: '' } },
          { bankStatus: BankStatus.MISSING },
          { netPay: { $lt: 0 } },
        ],
      })
      .populate('employeeId', 'employeeNumber workEmail firstName lastName')
      .populate('payrollRunId', 'runId payrollPeriod status')
      .lean();

    const irregularities = payrollDetails
      .filter((detail) => {
        const hasExceptions = detail.exceptions && detail.exceptions.trim() !== '';
        const hasMissingBank = detail.bankStatus === BankStatus.MISSING;
        const hasNegativePay = detail.netPay < 0;
        return hasExceptions || hasMissingBank || hasNegativePay;
      })
      .map((detail) => {
        const issues: string[] = [];
        if (detail.bankStatus === BankStatus.MISSING) issues.push('Missing bank account');
        if (detail.netPay < 0) issues.push('Negative net pay');
        if (detail.exceptions) issues.push(detail.exceptions);

        return {
          id: detail._id.toString(),
          runId: (detail.payrollRunId as any)?._id?.toString() || (detail.payrollRunId as any)?.runId || '',
          employeeId: (detail.employeeId as any)?._id?.toString() || detail.employeeId?.toString() || '',
          title: issues.join(', '),
          description: `Payroll run: ${(detail.payrollRunId as any)?.runId || 'Unknown'}`,
          severity: detail.netPay < 0 ? 'high' : detail.bankStatus === BankStatus.MISSING ? 'medium' : 'low',
          resolved: false,
        };
      });

    return irregularities;
  }

  async getAllSigningBonuses(): Promise<any[]> {
    const employeeBonuses = await this.employeeSigningBonusModel
      .find()
      .populate('employeeId', 'employeeNumber firstName lastName workEmail')
      .populate('signingBonusId', 'amount name')
      .lean();

    return employeeBonuses.map((bonus) => {
      const employee = bonus.employeeId as any;
      const signingBonus = bonus.signingBonusId as any;
      
      return {
        _id: bonus._id.toString(),
        employeeId: employee?._id?.toString() || bonus.employeeId?.toString() || '',
        employeeName: employee ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.employeeNumber : '',
        amount: signingBonus?.amount || 0,
        status: bonus.status || 'pending',
        approvedBy: undefined,
        approvedAt: undefined,
        paidAt: bonus.paymentDate ? bonus.paymentDate.toISOString() : undefined,
        notes: undefined,
        createdAt: (bonus as any).createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: (bonus as any).updatedAt?.toISOString() || new Date().toISOString(),
      };
    });
  }

  async getResignationBenefits(): Promise<any[]> {
    // Get payroll details that have resignation benefits (benefit > 0)
    // and employee status is RETIRED (resignation)
    const payrollDetails = await this.payrollDetailsModel
      .find({
        benefit: { $gt: 0 },
      })
      .populate('employeeId', 'employeeNumber firstName lastName workEmail status')
      .populate('payrollRunId', 'runId payrollPeriod')
      .lean();

    const employees = await this.employeeModel
      .find({ status: EmployeeStatus.RETIRED })
      .select('_id employeeNumber firstName lastName')
      .lean();

    const employeeMap = new Map(employees.map(emp => [emp._id.toString(), emp]));

    return payrollDetails
      .filter((detail) => {
        const employee = detail.employeeId as any;
        const emp = employeeMap.get(employee?._id?.toString() || employee?.toString() || '');
        return emp || (employee?.status === EmployeeStatus.RETIRED);
      })
      .map((detail) => {
        const employee = detail.employeeId as any;
        return {
          _id: detail._id.toString(),
          employeeId: employee?._id?.toString() || employee?.toString() || '',
          employeeName: employee ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.employeeNumber : '',
          type: 'resignation' as const,
          amount: detail.benefit || 0,
          status: detail.exceptions ? 'pending' : 'approved',
          approvedBy: undefined,
          approvedAt: undefined,
          paidAt: undefined,
          notes: detail.exceptions || undefined,
          createdAt: (detail as any).createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: (detail as any).updatedAt?.toISOString() || new Date().toISOString(),
        };
      });
  }

  async getTerminationBenefits(): Promise<any[]> {
    // Get payroll details that have termination benefits (benefit > 0)
    // and employee status is TERMINATED
    const payrollDetails = await this.payrollDetailsModel
      .find({
        benefit: { $gt: 0 },
      })
      .populate('employeeId', 'employeeNumber firstName lastName workEmail status')
      .populate('payrollRunId', 'runId payrollPeriod')
      .lean();

    const employees = await this.employeeModel
      .find({ status: EmployeeStatus.TERMINATED })
      .select('_id employeeNumber firstName lastName')
      .lean();

    const employeeMap = new Map(employees.map(emp => [emp._id.toString(), emp]));

    return payrollDetails
      .filter((detail) => {
        const employee = detail.employeeId as any;
        const emp = employeeMap.get(employee?._id?.toString() || employee?.toString() || '');
        return emp || (employee?.status === EmployeeStatus.TERMINATED);
      })
      .map((detail) => {
        const employee = detail.employeeId as any;
        return {
          _id: detail._id.toString(),
          employeeId: employee?._id?.toString() || employee?.toString() || '',
          employeeName: employee ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.employeeNumber : '',
          type: 'termination' as const,
          amount: detail.benefit || 0,
          status: detail.exceptions ? 'pending' : 'approved',
          approvedBy: undefined,
          approvedAt: undefined,
          paidAt: undefined,
          notes: detail.exceptions || undefined,
          createdAt: (detail as any).createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: (detail as any).updatedAt?.toISOString() || new Date().toISOString(),
        };
      });
  }

}
