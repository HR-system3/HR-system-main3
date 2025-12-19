import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Offer from '@/models/Offer';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Create offer with 'Draft' status by default
    const offer = await Offer.create(body);
    
    return NextResponse.json({ success: true, data: offer }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/offers:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
