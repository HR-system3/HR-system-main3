import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Interview from '@/models/Interview';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Basic validation could be added here
    
    const interview = await Interview.create(body);
    return NextResponse.json({ success: true, data: interview }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/interviews:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
