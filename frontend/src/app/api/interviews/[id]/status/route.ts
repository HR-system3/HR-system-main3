import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Interview from '@/models/Interview';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['Scheduled', 'Completed', 'Cancelled', 'Passed', 'Failed'];
    if (!status || !validStatuses.includes(status)) {
        return NextResponse.json({ success: false, error: 'Invalid status provided' }, { status: 400 });
    }

    const interview = await Interview.findByIdAndUpdate(
        params.id, 
        { status }, 
        { new: true, runValidators: true }
    );
    
    if (!interview) {
        return NextResponse.json({ success: false, error: 'Interview not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: interview });
  } catch (error: any) {
    console.error(`Error in PUT /api/interviews/${params.id}/status:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
