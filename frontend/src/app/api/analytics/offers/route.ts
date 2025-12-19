import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Offer from '@/models/Offer';

export async function GET() {
  try {
    await dbConnect();

    const stats = await Offer.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formatted: any = {
        Draft: 0,
        Sent: 0,
        Accepted: 0,
        Rejected: 0
    };
    
    stats.forEach((item: any) => {
        formatted[item._id] = item.count;
    });

    // Calculate Acceptance Rate
    const totalDecided = formatted.Accepted + formatted.Rejected;
    const acceptanceRate = totalDecided > 0 
        ? ((formatted.Accepted / totalDecided) * 100).toFixed(1) 
        : 0;

    return NextResponse.json({ success: true, data: { ...formatted, acceptanceRate } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
