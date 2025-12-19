import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ClearanceChecklist from '@/models/ClearanceChecklist';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const checklist = await ClearanceChecklist.findById(params.id);
    
    if (!checklist) {
        return NextResponse.json({ success: false, error: 'Checklist not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: checklist });
  } catch (error: any) {
    console.error(`Error in GET /api/clearance-checklists/${params.id}:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
