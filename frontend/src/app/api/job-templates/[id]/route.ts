import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import JobTemplate from '@/models/JobTemplate';

// GET: Get single template
export async function GET(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const template = await JobTemplate.findById(params.id);
    if (!template) {
        return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch template' }, { status: 400 });
  }
}

// PUT: Update template
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const body = await request.json();
    const template = await JobTemplate.findByIdAndUpdate(params.id, body, {
       new: true,
       runValidators: true
    });
    
    if (!template) {
        return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update template' }, { status: 400 });
  }
}

// DELETE: Delete template
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const deletedTemplate = await JobTemplate.findByIdAndDelete(params.id);
    
    if (!deletedTemplate) {
        return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete template' }, { status: 400 });
  }
}
