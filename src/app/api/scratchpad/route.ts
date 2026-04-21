import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';

export async function GET() {
  try {
    const store = getStore('scratchpad');
    const notes = await store.get('today_notes') || '';
    
    return NextResponse.json({ success: true, notes });
  } catch (error: any) {
    console.error('Error fetching today notes:', error);
    // If not in a netlify environment or blobs not configured, return an empty string gracefully
    if (error.message?.includes('Netlify Blobs environment variables are missing') || process.env.NODE_ENV === 'development') {
      return NextResponse.json({ success: true, notes: '', fallback: true });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { notes } = await request.json();
    
    if (typeof notes !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const store = getStore('scratchpad');
    await store.set('today_notes', notes);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving today notes:', error);
    // Graceful fallback for local development if Netlify Blobs not configured
    if (error.message?.includes('Netlify Blobs environment variables are missing') || process.env.NODE_ENV === 'development') {
      return NextResponse.json({ success: true, fallback: true });
    }
    return NextResponse.json({ success: false, error: 'Failed to save notes' }, { status: 500 });
  }
}
