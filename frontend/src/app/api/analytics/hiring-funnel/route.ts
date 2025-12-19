import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';

export async function GET() {
  try {
    await dbConnect();

    const funnel = await Application.aggregate([
      {
        $group: {
          _id: null,
          Applied: { $sum: 1 }, // Everyone starts here
          Interview: { $sum: { $cond: [{ $in: ['$status', ['Interview', 'Offer', 'Hired', 'Rejected']] }, 1, 0] } }, // Rough approximation
          Offer: { $sum: { $cond: [{ $in: ['$status', ['Offer', 'Hired']] }, 1, 0] } },
          Hired: { $sum: { $cond: [{ $eq: ['$status', 'Hired'] }, 1, 0] } }
        }
      }
    ]);

    // Better approach: Count by status directly
    const statusCounts = await Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Map to funnel steps (Accumulative would be ideal but simple count is often requested)
    // The user likely wants snapshot counts
    const data = {
        Applied: 0,
        Interview: 0,
        Offer: 0,
        Hired: 0
    };

    statusCounts.forEach((item: any) => {
        if (data.hasOwnProperty(item._id)) {
            // @ts-ignore
            data[item._id] = item.count;
        }
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
