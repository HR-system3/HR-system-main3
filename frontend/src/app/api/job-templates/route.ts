import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import JobTemplate from '@/models/JobTemplate';

// GET: Get all templates
export async function GET() {
  await dbConnect();

  try {
    const templates = await JobTemplate.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: templates.length, data: templates });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch templates' }, { status: 400 });
  }
}

// POST: Create a template
export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const template = await JobTemplate.create(body);
    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
