import mongoose from 'mongoose';

export interface IJob extends mongoose.Document {
  title: string;
  department: string;
  description: string;
  requirements: string;
  status: 'Active' | 'Closed' | 'Draft';
  createdAt: Date;
}

const JobSchema = new mongoose.Schema<IJob>({
  title: {
    type: String,
    required: [true, 'Please provide a job title'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  department: {
    type: String,
    required: [true, 'Please specify the department'],
  },
  description: {
    type: String,
    required: [true, 'Please provide the job description'],
  },
  requirements: {
    type: String,
    required: [true, 'Please provide job requirements'],
  },
  status: {
    type: String,
    enum: ['Active', 'Closed', 'Draft'],
    default: 'Active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
