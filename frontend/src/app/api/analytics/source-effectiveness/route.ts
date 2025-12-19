import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';

export async function GET() {
  try {
    await dbConnect();

    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$source',
          total: { $sum: 1 },
          hired: { $sum: { $cond: [{ $eq: ['$status', 'Hired'] }, 1, 0] } }
        }
      },
      {
        $project: {
          source: '$_id',
          total: 1,
          hired: 1,
          conversionRate: { 
            $cond: [ { $eq: ['$total', 0] }, 0, { $multiply: [ { $divide: ['$hired', '$total'] }, 100 ] } ]
          }
        }
      }
    ]);

    // Format for easier consumption if needed, or return raw
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
