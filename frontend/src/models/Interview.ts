import mongoose from 'mongoose';

export interface IInterview extends mongoose.Document {
  applicationId: string; // Using string heavily for now to avoid direct population issues if models aren't ready
  interviewerId?: string;
  date: Date;
  type: 'Phone' | 'Video' | 'On-site';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Passed' | 'Failed';
  notes?: string;
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new mongoose.Schema<IInterview>({
  applicationId: {
    type: String,
    required: [true, 'Please provide an application ID'],
    index: true,
  },
  interviewerId: {
    type: String, // Ideally ObjectId ref 'User'
    required: false,
  },
  date: {
    type: Date,
    required: [true, 'Please provide an interview date'],
  },
  type: {
    type: String,
    enum: ['Phone', 'Video', 'On-site'],
    default: 'Video',
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'Passed', 'Failed'],
    default: 'Scheduled',
  },
  notes: {
    type: String,
    required: false,
  },
  meetingLink: {
    type: String,
    required: false,
  },
}, { timestamps: true });

export default mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);
