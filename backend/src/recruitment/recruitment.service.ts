import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JobTemplate, JobTemplateDocument } from './models/job-template.schema';
import { JobRequisition, JobRequisitionDocument } from './models/job-requisition.schema';
import { Application, ApplicationDocument } from './models/application.schema';
import { ApplicationStatusHistory, ApplicationStatusHistoryDocument } from './models/application-history.schema';
import { Interview, InterviewDocument } from './models/interview.schema';
import { Offer, OfferDocument } from './models/offer.schema';
import { Contract, ContractDocument } from './models/contract.schema';
import { TerminationRequest, TerminationRequestDocument } from './models/termination-request.schema';
import { ClearanceChecklist, ClearanceChecklistDocument } from './models/clearance-checklist.schema';
import { Onboarding, OnboardingDocument } from './models/onboarding.schema';
import { ApplicationStatus } from './enums/application-status.enum';
import { ApplicationStage } from './enums/application-stage.enum';
import { InterviewStatus } from './enums/interview-status.enum';
import { OfferFinalStatus } from './enums/offer-final-status.enum';
import { OfferResponseStatus } from './enums/offer-response-status.enum';
import { TerminationStatus } from './enums/termination-status.enum';
import { ApprovalStatus } from './enums/approval-status.enum';

@Injectable()
export class RecruitmentService {
  constructor(
    @InjectModel(JobTemplate.name)
    private readonly jobTemplateModel: Model<JobTemplateDocument>,
    @InjectModel(JobRequisition.name)
    private readonly jobRequisitionModel: Model<JobRequisitionDocument>,
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
    @InjectModel(ApplicationStatusHistory.name)
    private readonly applicationHistoryModel: Model<ApplicationStatusHistoryDocument>,
    @InjectModel(Interview.name)
    private readonly interviewModel: Model<InterviewDocument>,
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
    @InjectModel(Contract.name)
    private readonly contractModel: Model<ContractDocument>,
    @InjectModel(TerminationRequest.name)
    private readonly terminationRequestModel: Model<TerminationRequestDocument>,
    @InjectModel(ClearanceChecklist.name)
    private readonly clearanceChecklistModel: Model<ClearanceChecklistDocument>,
    @InjectModel(Onboarding.name)
    private readonly onboardingModel: Model<OnboardingDocument>,
  ) {}

  // ==================== Job Templates ====================
  async getJobTemplates() {
    return this.jobTemplateModel.find().lean();
  }

  async getJobTemplate(id: string) {
    const template = await this.jobTemplateModel.findById(id).lean();
    if (!template) {
      throw new NotFoundException('Job template not found');
    }
    return template;
  }

  async createJobTemplate(data: Partial<JobTemplate>) {
    return this.jobTemplateModel.create(data);
  }

  async updateJobTemplate(id: string, data: Partial<JobTemplate>) {
    const template = await this.jobTemplateModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!template) {
      throw new NotFoundException('Job template not found');
    }
    return template;
  }

  async deleteJobTemplate(id: string) {
    const result = await this.jobTemplateModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Job template not found');
    }
    return { success: true };
  }

  // ==================== Job Requisitions (Jobs) ====================
  async getJobs(status?: string) {
    const filter: any = {};
    if (status) {
      filter.publishStatus = status;
    }
    return this.jobRequisitionModel.find(filter).populate('templateId').populate('hiringManagerId').lean();
  }

  async getJob(id: string) {
    const job = await this.jobRequisitionModel.findById(id).populate('templateId').populate('hiringManagerId').lean();
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async createJob(data: Partial<JobRequisition>) {
    return this.jobRequisitionModel.create(data);
  }

  async updateJob(id: string, data: Partial<JobRequisition>) {
    const job = await this.jobRequisitionModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  // ==================== Applications ====================
  async getApplications(filters?: { requisitionId?: string; status?: string; candidateId?: string }) {
    const query: any = {};
    if (filters?.requisitionId) {
      query.requisitionId = new Types.ObjectId(filters.requisitionId);
    }
    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.candidateId) {
      query.candidateId = new Types.ObjectId(filters.candidateId);
    }
    return this.applicationModel.find(query).populate('requisitionId').populate('candidateId').populate('assignedHr').sort({ createdAt: -1 }).lean();
  }

  async getApplication(id: string) {
    const application = await this.applicationModel.findById(id).populate('requisitionId').populate('candidateId').populate('assignedHr').lean();
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  async createApplication(data: Partial<Application>) {
    const application = await this.applicationModel.create({
      ...data,
      candidateId: new Types.ObjectId(data.candidateId as any),
      requisitionId: new Types.ObjectId(data.requisitionId as any),
      status: ApplicationStatus.SUBMITTED,
      currentStage: ApplicationStage.SCREENING,
    });
    return application;
  }

  async updateApplicationStatus(id: string, status: ApplicationStatus, stage?: ApplicationStage, changedBy?: Types.ObjectId) {
    const application = await this.applicationModel.findById(id);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const oldStatus = application.status;
    const oldStage = application.currentStage;

    application.status = status;
    if (stage) {
      application.currentStage = stage;
    }
    await application.save();

    // Record history
    if (changedBy) {
      await this.applicationHistoryModel.create({
        applicationId: application._id,
        oldStatus,
        newStatus: status,
        oldStage,
        newStage: stage || application.currentStage,
        changedBy,
      });
    }

    return application.toObject();
  }

  // ==================== Interviews ====================
  async getInterviews(filters?: { applicationId?: string; status?: string }) {
    const query: any = {};
    if (filters?.applicationId) {
      query.applicationId = new Types.ObjectId(filters.applicationId);
    }
    if (filters?.status) {
      query.status = filters.status;
    }
    return this.interviewModel.find(query).populate('applicationId').populate('panel').sort({ scheduledDate: -1 }).lean();
  }

  async getInterview(id: string) {
    const interview = await this.interviewModel.findById(id).populate('applicationId').populate('panel').lean();
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }
    return interview;
  }

  async createInterview(data: Partial<Interview>) {
    return this.interviewModel.create({
      ...data,
      applicationId: new Types.ObjectId(data.applicationId as any),
      status: InterviewStatus.SCHEDULED,
    });
  }

  async updateInterviewStatus(id: string, status: InterviewStatus) {
    const interview = await this.interviewModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }
    return interview;
  }

  async getInterviewsByApplication(applicationId: string) {
    return this.interviewModel.find({ applicationId: new Types.ObjectId(applicationId) }).populate('panel').sort({ scheduledDate: -1 }).lean();
  }

  // ==================== Offers ====================
  async getOffers(filters?: { applicationId?: string; candidateId?: string; finalStatus?: string }) {
    const query: any = {};
    if (filters?.applicationId) {
      query.applicationId = new Types.ObjectId(filters.applicationId);
    }
    if (filters?.candidateId) {
      query.candidateId = new Types.ObjectId(filters.candidateId);
    }
    if (filters?.finalStatus) {
      query.finalStatus = filters.finalStatus;
    }
    return this.offerModel.find(query).populate('applicationId').populate('candidateId').populate('hrEmployeeId').sort({ createdAt: -1 }).lean();
  }

  async getOffer(id: string) {
    const offer = await this.offerModel.findById(id).populate('applicationId').populate('candidateId').populate('hrEmployeeId').lean();
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  async createOffer(data: Partial<Offer>) {
    return this.offerModel.create({
      ...data,
      applicationId: new Types.ObjectId(data.applicationId as any),
      candidateId: new Types.ObjectId(data.candidateId as any),
      applicantResponse: OfferResponseStatus.PENDING,
      finalStatus: OfferFinalStatus.PENDING,
    });
  }

  async sendOffer(id: string) {
    const offer = await this.offerModel.findByIdAndUpdate(id, { finalStatus: OfferFinalStatus.APPROVED }, { new: true }).lean();
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  async acceptOffer(id: string) {
    const offer = await this.offerModel.findByIdAndUpdate(
      id,
      {
        applicantResponse: OfferResponseStatus.ACCEPTED,
        candidateSignedAt: new Date(),
      },
      { new: true }
    ).lean();
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  async rejectOffer(id: string) {
    const offer = await this.offerModel.findByIdAndUpdate(
      id,
      {
        applicantResponse: OfferResponseStatus.REJECTED,
      },
      { new: true }
    ).lean();
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  // ==================== Contracts ====================
  async getContracts(filters?: { offerId?: string }) {
    const query: any = {};
    if (filters?.offerId) {
      query.offerId = new Types.ObjectId(filters.offerId);
    }
    return this.contractModel.find(query).populate('offerId').populate('documentId').lean();
  }

  async createContract(data: Partial<Contract>) {
    return this.contractModel.create({
      ...data,
      offerId: new Types.ObjectId(data.offerId as any),
      acceptanceDate: new Date(),
    });
  }

  // ==================== Terminations ====================
  async getTerminations(filters?: { employeeId?: string; status?: string }) {
    const query: any = {};
    if (filters?.employeeId) {
      query.employeeId = new Types.ObjectId(filters.employeeId);
    }
    if (filters?.status) {
      query.status = filters.status;
    }
    return this.terminationRequestModel.find(query).populate('employeeId').populate('contractId').sort({ createdAt: -1 }).lean();
  }

  async getTermination(id: string) {
    const termination = await this.terminationRequestModel.findById(id).populate('employeeId').populate('contractId').lean();
    if (!termination) {
      throw new NotFoundException('Termination request not found');
    }
    return termination;
  }

  async createTermination(data: Partial<TerminationRequest>) {
    return this.terminationRequestModel.create({
      ...data,
      employeeId: new Types.ObjectId(data.employeeId as any),
      contractId: new Types.ObjectId(data.contractId as any),
      status: TerminationStatus.PENDING,
    });
  }

  async approveTermination(id: string) {
    const termination = await this.terminationRequestModel.findByIdAndUpdate(
      id,
      { status: TerminationStatus.APPROVED },
      { new: true }
    ).lean();
    if (!termination) {
      throw new NotFoundException('Termination request not found');
    }
    return termination;
  }

  async rejectTermination(id: string) {
    const termination = await this.terminationRequestModel.findByIdAndUpdate(
      id,
      { status: TerminationStatus.REJECTED },
      { new: true }
    ).lean();
    if (!termination) {
      throw new NotFoundException('Termination request not found');
    }
    return termination;
  }

  // ==================== Clearance Checklists ====================
  async getClearanceChecklists(filters?: { terminationId?: string }) {
    const query: any = {};
    if (filters?.terminationId) {
      query.terminationId = new Types.ObjectId(filters.terminationId);
    }
    return this.clearanceChecklistModel.find(query).populate('terminationId').lean();
  }

  async getClearanceChecklist(id: string) {
    const checklist = await this.clearanceChecklistModel.findById(id).populate('terminationId').lean();
    if (!checklist) {
      throw new NotFoundException('Clearance checklist not found');
    }
    return checklist;
  }

  async createClearanceChecklist(data: Partial<ClearanceChecklist>) {
    return this.clearanceChecklistModel.create({
      ...data,
      terminationId: new Types.ObjectId(data.terminationId as any),
    });
  }

  async updateClearanceChecklist(id: string, data: Partial<ClearanceChecklist>) {
    const checklist = await this.clearanceChecklistModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!checklist) {
      throw new NotFoundException('Clearance checklist not found');
    }
    return checklist;
  }

  async updateClearanceChecklistDepartment(id: string, department: string, status: ApprovalStatus, comments?: string, updatedBy?: Types.ObjectId) {
    const checklist = await this.clearanceChecklistModel.findById(id);
    if (!checklist) {
      throw new NotFoundException('Clearance checklist not found');
    }

    const itemIndex = checklist.items.findIndex((item: any) => item.department === department);
    if (itemIndex >= 0) {
      checklist.items[itemIndex].status = status;
      if (comments) checklist.items[itemIndex].comments = comments;
      if (updatedBy) checklist.items[itemIndex].updatedBy = updatedBy;
      checklist.items[itemIndex].updatedAt = new Date();
    } else {
      checklist.items.push({
        department,
        status,
        comments,
        updatedBy,
        updatedAt: new Date(),
      });
    }

    await checklist.save();
    return checklist.toObject();
  }

  async updateClearanceChecklistEquipment(id: string, equipmentId: Types.ObjectId, returned: boolean, condition?: string) {
    const checklist = await this.clearanceChecklistModel.findById(id);
    if (!checklist) {
      throw new NotFoundException('Clearance checklist not found');
    }

    const itemIndex = checklist.equipmentList.findIndex((item: any) => item.equipmentId?.toString() === equipmentId.toString());
    if (itemIndex >= 0) {
      checklist.equipmentList[itemIndex].returned = returned;
      if (condition) checklist.equipmentList[itemIndex].condition = condition;
    } else {
      checklist.equipmentList.push({
        equipmentId,
        returned,
        condition: condition || 'Good',
      });
    }

    await checklist.save();
    return checklist.toObject();
  }

  async updateClearanceChecklistCard(id: string, cardReturned: boolean) {
    const checklist = await this.clearanceChecklistModel.findByIdAndUpdate(
      id,
      { cardReturned, cardReturnedDate: cardReturned ? new Date() : undefined },
      { new: true }
    ).lean();
    if (!checklist) {
      throw new NotFoundException('Clearance checklist not found');
    }
    return checklist;
  }

  // ==================== Analytics ====================
  async getHiringFunnel() {
    const statusCounts = await this.applicationModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const data: Record<string, number> = {
      submitted: 0,
      in_process: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };

    statusCounts.forEach((item) => {
      if (data.hasOwnProperty(item._id)) {
        data[item._id] = item.count;
      }
    });

    return data;
  }

  async getSourceEffectiveness() {
    // Note: Source tracking would need to be added to Application schema
    // For now, return empty or mock data
    return [];
  }

  async getTimeToFill() {
    const applications = await this.applicationModel.find({
      status: ApplicationStatus.HIRED,
    }).select('createdAt updatedAt').lean();

    const times = applications.map((app: any) => {
      const created = new Date(app.createdAt);
      const hired = new Date(app.updatedAt);
      return Math.round((hired.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)); // days
    });

    return {
      average: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
      min: times.length > 0 ? Math.min(...times) : 0,
      max: times.length > 0 ? Math.max(...times) : 0,
      count: times.length,
    };
  }

  async getInterviewAnalytics() {
    const statusCounts = await this.interviewModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const data: Record<string, number> = {
      scheduled: 0,
      completed: 0,
      cancelled: 0,
    };

    statusCounts.forEach((item) => {
      if (data.hasOwnProperty(item._id)) {
        data[item._id] = item.count;
      }
    });

    return data;
  }

  async getOfferAnalytics() {
    const statusCounts = await this.offerModel.aggregate([
      { $group: { _id: '$finalStatus', count: { $sum: 1 } } }
    ]);

    const data: Record<string, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    statusCounts.forEach((item) => {
      if (data.hasOwnProperty(item._id)) {
        data[item._id] = item.count;
      }
    });

    return data;
  }

  async getProgressAnalytics() {
    const jobs = await this.jobRequisitionModel.countDocuments();
    const applications = await this.applicationModel.countDocuments();
    const interviews = await this.interviewModel.countDocuments();
    const offers = await this.offerModel.countDocuments();
    const hired = await this.applicationModel.countDocuments({ status: ApplicationStatus.HIRED });

    return {
      jobs,
      applications,
      interviews,
      offers,
      hired,
    };
  }

  // ==================== Onboarding ====================
  async getOnboarding(employeeId: string) {
    const onboarding = await this.onboardingModel.findOne({ employeeId: new Types.ObjectId(employeeId) }).lean();
    if (!onboarding) {
      // Return empty onboarding if not found
      return {
        employeeId,
        tasks: [],
        completed: false,
      };
    }
    return onboarding;
  }

  async updateOnboardingTask(employeeId: string, taskId: string, completed: boolean) {
    const onboarding = await this.onboardingModel.findOne({ employeeId: new Types.ObjectId(employeeId) });
    if (!onboarding) {
      throw new NotFoundException('Onboarding record not found');
    }

    const taskIndex = onboarding.tasks.findIndex((t: any) => t._id?.toString() === taskId);
    if (taskIndex >= 0) {
      onboarding.tasks[taskIndex].status = completed ? 'completed' : 'pending';
      onboarding.tasks[taskIndex].completedAt = completed ? new Date() : undefined;
    }

    onboarding.completed = onboarding.tasks.every((t: any) => t.status === 'completed');
    if (onboarding.completed) {
      onboarding.completedAt = new Date();
    }

    await onboarding.save();
    return onboarding.toObject();
  }
}
