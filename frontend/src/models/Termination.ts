import mongoose from 'mongoose';

export interface ITermination extends mongoose.Document {
  employeeId: string;
  reason: string;
  type: 'Voluntary' | 'Involuntary';
  lastWorkingDay: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TerminationSchema = new mongoose.Schema<ITermination>({
  employeeId: {
    type: String, // Ideally ObjectId ref 'User'
    required: [true, 'Please provide an employee ID'],
  },
  reason: {
    type: String,
    required: [true, 'Please provide a reason for termination'],
  },
  type: {
    type: String,
    enum: ['Voluntary', 'Involuntary'],
    required: [true, 'Please specify the termination type'],
  },
  lastWorkingDay: {
    type: Date,
    required: [true, 'Please provide the last working day'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  comments: {
    type: String,
    required: false,
  },
}, { timestamps: true });

export default mongoose.models.Termination || mongoose.model<ITermination>('Termination', TerminationSchema);
