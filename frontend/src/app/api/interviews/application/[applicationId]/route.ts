import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Interview from '@/models/Interview';

export async function GET(request: Request, { params }: { params: { applicationId: string } }) {
  try {
    await dbConnect();
    const interviews = await Interview.find({ applicationId: params.applicationId }).sort({ date: 1 });
    
    return NextResponse.json({ success: true, count: interviews.length, data: interviews });
  } catch (error: any) {
    console.error(`Error in GET /api/interviews/application/${params.applicationId}:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
