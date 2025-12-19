import mongoose from 'mongoose';

const DepartmentStatusSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'IT', 'Finance', 'HR'
  status: { 
    type: String, 
    enum: ['Pending', 'Cleared', 'Rejected'], 
    default: 'Pending' 
  },
  remarks: { type: String }
});

const EquipmentStatusSchema = new mongoose.Schema({
  item: { type: String, required: true }, // e.g., 'Laptop', 'Monitor', 'Keys'
  returned: { type: Boolean, default: false },
  condition: { type: String, enum: ['Good', 'Damaged', 'Lost'], default: 'Good' }
});

export interface IClearanceChecklist extends mongoose.Document {
  terminationId: string;
  departments: { name: string; status: string; remarks?: string }[];
  equipment: { item: string; returned: boolean; condition: string }[];
  cardReturned: boolean;
  cardReturnedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ClearanceChecklistSchema = new mongoose.Schema<IClearanceChecklist>({
  terminationId: {
    type: String, // Ideally ObjectId ref 'Termination'
    required: true,
    unique: true
  },
  departments: [DepartmentStatusSchema],
  equipment: [EquipmentStatusSchema],
  cardReturned: {
    type: Boolean,
    default: false
  },
  cardReturnedDate: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.models.ClearanceChecklist || mongoose.model<IClearanceChecklist>('ClearanceChecklist', ClearanceChecklistSchema);
