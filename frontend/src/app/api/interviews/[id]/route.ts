import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Interview from '@/models/Interview';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const interview = await Interview.findById(params.id);
    
    if (!interview) {
        return NextResponse.json({ success: false, error: 'Interview not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: interview });
  } catch (error: any) {
    console.error(`Error in GET /api/interviews/${params.id}:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
