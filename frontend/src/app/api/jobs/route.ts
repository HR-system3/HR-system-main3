import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';

export async function GET() {
  try {
    await dbConnect();
    const jobs = await Job.find({ status: 'Active' }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: jobs });
  } catch (error: any) {
    console.error('Error in GET /api/jobs:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch jobs', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const job = await Job.create(body);
    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/jobs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
