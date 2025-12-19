import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Termination from '@/models/Termination';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const termination = await Termination.findByIdAndUpdate(
        params.id, 
        { status: 'Approved' }, 
        { new: true }
    );
    
    if (!termination) {
        return NextResponse.json({ success: false, error: 'Termination request not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: termination });
  } catch (error: any) {
    console.error(`Error in POST /api/terminations/${params.id}/approve:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
