import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ClearanceChecklist from '@/models/ClearanceChecklist';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { departmentName, status, remarks } = await request.json();

    const checklist = await ClearanceChecklist.findOneAndUpdate(
        { _id: params.id, "departments.name": departmentName },
        { 
            $set: { 
                "departments.$.status": status,
                "departments.$.remarks": remarks
            }
        },
        { new: true }
    );
    
    if (!checklist) {
        return NextResponse.json({ success: false, error: 'Department not found in checklist' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: checklist });
  } catch (error: any) {
    console.error(`Error in PUT /api/clearance-checklists/${params.id}/department:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
