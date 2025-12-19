import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';

export async function GET() {
  try {
    await dbConnect();

    // Calculate time diff between appliedDate and updatedAt (if status is Hired)
    // In a real system we would track 'hiredDate' explicitly or use Job creation time.
    // For now, let's use Application Applied -> Hired time.
    const hiredApps = await Application.find({ status: 'Hired' });
    
    if (hiredApps.length === 0) {
        return NextResponse.json({ success: true, data: { averageDays: 0 } });
    }

    let totalDays = 0;
    hiredApps.forEach(app => {
        const start = new Date(app.appliedDate).getTime();
        const end = new Date(app.updatedAt).getTime();
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        totalDays += diffDays;
    });

    const averageDays = (totalDays / hiredApps.length).toFixed(1);

    return NextResponse.json({ success: true, data: { averageDays } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
