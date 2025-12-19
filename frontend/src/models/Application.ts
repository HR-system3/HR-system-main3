import mongoose from 'mongoose';

export interface IApplication extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string; // Could be a reference to Job model in a more complex system
  status: 'Applied' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  resumeUrl?: string;
  source?: 'LinkedIn' | 'Referral' | 'Website' | 'Other';
  appliedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new mongoose.Schema<IApplication>({
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
  },
  jobTitle: {
    type: String,
    required: [true, 'Please provide the job title applied for'],
  },
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Offer', 'Hired', 'Rejected'],
    default: 'Applied',
  },
  resumeUrl: {
    type: String,
  },
  source: {
    type: String,
    enum: ['LinkedIn', 'Referral', 'Website', 'Other'],
    default: 'Website',
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
