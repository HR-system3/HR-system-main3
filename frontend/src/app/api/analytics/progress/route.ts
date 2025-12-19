import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import Application from '@/models/Application';
import Offer from '@/models/Offer';

export async function GET() {
  try {
    await dbConnect();

    const [activeJobs, totalApplications, openPositions, hiredCandidates] = await Promise.all([
      Job.countDocuments({ status: 'Active' }),
      Application.countDocuments({}),
      Job.countDocuments({ status: 'Active' }), // Assuming open positions = active jobs for now
      Application.countDocuments({ status: 'Hired' })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        activeJobs,
        totalApplications,
        openPositions,
        hiredCandidates,
        hiringRate: totalApplications > 0 ? ((hiredCandidates / totalApplications) * 100).toFixed(1) : 0
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
