import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Termination from '@/models/Termination';
import mongoose from 'mongoose';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    debugger

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return NextResponse.json({ success: false, error: 'Invalid Termination ID format' }, { status: 400 });
    }

    const termination = await Termination.findById(params.id);
    
    if (!termination) {
        return NextResponse.json({ success: false, error: 'Termination request not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: termination });
  } catch (error: any) {
    console.error(`Error in GET /api/terminations/${params.id}:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await request.json();
    debugger
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return NextResponse.json({ success: false, error: 'Invalid Termination ID format' }, { status: 400 });
    }

    const termination = await Termination.findByIdAndUpdate(
        params.id, 
        body, 
        { new: true, runValidators: true }
    );
    
    if (!termination) {
        return NextResponse.json({ success: false, error: 'Termination request not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: termination });
  } catch (error: any) {
    console.error(`Error in PUT /api/terminations/${params.id}:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
