import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Offer from '@/models/Offer';
import Application from '@/models/Application';
import Contract from '@/models/Contract';
import mongoose from 'mongoose';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ success: false, error: 'Invalid Offer ID' }, { status: 400 });
    }

    // 1. Find the Offer
    const offer = await Offer.findById(id);
    if (!offer) {
      return NextResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
    }

    // 2. Update Offer Status
    offer.status = 'Accepted';
    await offer.save();

    // 3. Update Application Status
    const application = await Application.findByIdAndUpdate(
        offer.applicationId,
        { status: 'Hired' },
        { new: true }
    );

    // 4. Create Contract
    const contract = await Contract.create({
        applicationId: offer.applicationId,
        offerId: offer._id,
        startDate: offer.startDate,
        salary: offer.salary,
        status: 'Active',
        signedDate: new Date()
    });

    return NextResponse.json({ success: true, data: { offer, contract, application } });
  } catch (error: any) {
    console.error('Error in POST /api/offers/[id]/accept:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
