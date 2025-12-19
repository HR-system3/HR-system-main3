import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const application = await Application.create(body);
    
    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/applications:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import Offer from '@/models/Offer';

export async function GET() {
  try {
    await dbConnect();
    const applications = await Application.find({}).sort({ createdAt: -1 }).lean();

    // Attach Offer ID if exists
    const appsWithOffers = await Promise.all(applications.map(async (app) => {
        const offer = await Offer.findOne({ 
            applicationId: app._id, 
            status: { $in: ['Sent', 'Accepted', 'Rejected'] } 
        }).sort({ createdAt: -1 });
        
        return {
            ...app,
            offerId: offer ? offer._id : null,
            offerStatus: offer ? offer.status : null
        };
    }));

    return NextResponse.json({ success: true, count: appsWithOffers.length, data: appsWithOffers });
  } catch (error: any) {
    console.error('Error in GET /api/applications:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
