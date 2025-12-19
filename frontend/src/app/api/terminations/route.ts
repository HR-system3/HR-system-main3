import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Termination from '@/models/Termination';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const termination = await Termination.create(body);
    return NextResponse.json({ success: true, data: termination }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/terminations:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const terminations = await Termination.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: terminations.length, data: terminations });
  } catch (error: any) {
    console.error('Error in GET /api/terminations:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
