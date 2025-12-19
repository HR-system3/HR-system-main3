import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Offer from '@/models/Offer';
import Application from '@/models/Application';
import mongoose from 'mongoose';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ success: false, error: 'Invalid Offer ID' }, { status: 400 });
    }

    const offer = await Offer.findByIdAndUpdate(
        id,
        { status: 'Rejected' },
        { new: true }
    );

    if (!offer) {
        return NextResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
    }

    // Also update Application status
    await Application.findByIdAndUpdate(
        offer.applicationId,
        { status: 'Rejected' },
        { new: true }
    );

    return NextResponse.json({ success: true, data: offer });
  } catch (error: any) {
    console.error('Error in POST /api/offers/[id]/reject:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
