import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ClearanceChecklist from '@/models/ClearanceChecklist';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { item, returned, condition } = await request.json();

    const checklist = await ClearanceChecklist.findOneAndUpdate(
        { _id: params.id, "equipment.item": item },
        { 
            $set: { 
                "equipment.$.returned": returned,
                "equipment.$.condition": condition
            }
        },
        { new: true }
    );
    
    // If item doesn't exist, maybe add it? Or create separate generic update.
    // For M2, we assume items are initialized and we just update them.
    
    if (!checklist) {
         // Create logic if we want to allow adding new equipment dynamically:
         // await ClearanceChecklist.findByIdAndUpdate(params.id, { $push: { equipment: ... } })
        return NextResponse.json({ success: false, error: 'Equipment item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: checklist });
  } catch (error: any) {
    console.error(`Error in PUT /api/clearance-checklists/${params.id}/equipment:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
