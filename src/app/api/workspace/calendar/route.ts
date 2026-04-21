import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGoogleCalendarEvents, createGoogleCalendarEvent, updateGoogleCalendarEvent, deleteGoogleCalendarEvent } from '@/lib/google';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const maxResults = parseInt(searchParams.get('maxResults') || '20');
  const calendarsParam = searchParams.get('calendars');
  const timeMin = searchParams.get('timeMin') || undefined;
  const calendars = calendarsParam ? calendarsParam.split(',') : ['primary'];

  try {
    const events = await getGoogleCalendarEvents((session as any).accessToken as string, maxResults, calendars, timeMin);
    return NextResponse.json(events);
  } catch (error: any) {
    const errMsg = error?.message || String(error) || 'Failed to fetch calendar events';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    if (!body.summary || !body.start || !body.end) {
      return NextResponse.json({ error: 'Missing required fields (summary, start, end)' }, { status: 400 });
    }

    const newEvent = await createGoogleCalendarEvent((session as any).accessToken as string, body);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: any) {
    const errMsg = error?.message || String(error) || 'Failed to create calendar event';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    if (!eventId) return NextResponse.json({ error: 'Missing eventId parameter' }, { status: 400 });

    const body = await request.json();
    if (!body.summary || !body.start || !body.end) {
      return NextResponse.json({ error: 'Missing required fields (summary, start, end)' }, { status: 400 });
    }

    const updatedEvent = await updateGoogleCalendarEvent((session as any).accessToken as string, eventId, body);
    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error: any) {
    const errMsg = error?.message || String(error) || 'Failed to update calendar event';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    if (!eventId) return NextResponse.json({ error: 'Missing eventId parameter' }, { status: 400 });

    const result = await deleteGoogleCalendarEvent((session as any).accessToken as string, eventId);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    const errMsg = error?.message || String(error) || 'Failed to delete calendar event';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
