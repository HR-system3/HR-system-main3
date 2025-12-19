import mongoose from 'mongoose';

export interface IJobTemplate extends mongoose.Document {
  title: string;
  department: string;
  description: string;
  requirements: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobTemplateSchema = new mongoose.Schema<IJobTemplate>({
  title: {
    type: String,
    required: [true, 'Please provide a template title'],
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
    required: [true, 'Please provide standard requirements'],
  },
}, { timestamps: true });

export default mongoose.models.JobTemplate || mongoose.model<IJobTemplate>('JobTemplate', JobTemplateSchema);
