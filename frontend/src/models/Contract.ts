import mongoose from 'mongoose';

export interface IContract extends mongoose.Document {
  applicationId: string;
  offerId: string;
  status: 'Active' | 'Terminated';
  startDate: Date;
  salary: number;
  signedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new mongoose.Schema<IContract>({
  applicationId: {
    type: String, // Ref to Application
    required: true,
  },
  offerId: {
    type: String, // Ref to Offer
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Terminated'],
    default: 'Active',
  },
  startDate: {
    type: Date,
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  signedDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.models.Contract || mongoose.model<IContract>('Contract', ContractSchema);
