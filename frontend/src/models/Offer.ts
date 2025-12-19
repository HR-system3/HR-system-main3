import mongoose from 'mongoose';

export interface IOffer extends mongoose.Document {
  applicationId: string;
  salary: number;
  startDate: Date;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new mongoose.Schema<IOffer>({
  applicationId: {
    type: String, // Ideally ObjectId ref 'Application'
    required: [true, 'Please provide an application ID'],
  },
  salary: {
    type: Number,
    required: [true, 'Please provide the offered salary'],
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide the start date'],
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Accepted', 'Rejected'],
    default: 'Draft',
  },
}, { timestamps: true });

export default mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);
