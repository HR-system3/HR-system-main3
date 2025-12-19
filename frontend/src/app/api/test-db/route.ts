import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();
    const connectionState = mongoose.connection.readyState;
    
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    const stateMap = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
      99: 'Uninitialized',
    };

    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connection established',
      state: stateMap[connectionState as keyof typeof stateMap] || 'Unknown' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: 'Database connection failed', error: error.message }, 
      { status: 500 }
    );
  }
}
