import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Offer from '@/models/Offer';
import mongoose from 'mongoose';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return NextResponse.json({ success: false, error: 'Invalid Offer ID format' }, { status: 400 });
    }

    const offer = await Offer.findByIdAndUpdate(
        params.id,
        { status: 'Sent' },
        { new: true }
    );
    
    if (!offer) {
        return NextResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
    }
    
    // In a real app, we would trigger an email/notification here
    
    return NextResponse.json({ success: true, data: offer });
  } catch (error: any) {
    console.error(`Error in POST /api/offers/${params.id}/send:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
