import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Interview from '@/models/Interview';

export async function GET() {
  try {
    await dbConnect();

    const stats = await Interview.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formatted: any = {};
    stats.forEach((item: any) => {
        formatted[item._id] = item.count;
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
