import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ClearanceChecklist from '@/models/ClearanceChecklist';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { returned } = await request.json();

    const checklist = await ClearanceChecklist.findByIdAndUpdate(
        params.id,
        { 
            cardReturned: returned,
            cardReturnedDate: returned ? new Date() : null
        },
        { new: true }
    );
    
    if (!checklist) {
        return NextResponse.json({ success: false, error: 'Checklist not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: checklist });
  } catch (error: any) {
    console.error(`Error in PUT /api/clearance-checklists/${params.id}/card:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
