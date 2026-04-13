import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGoogleCalendarEvents } from '@/lib/google';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const maxResults = parseInt(searchParams.get('maxResults') || '20');

  try {
    const events = await getGoogleCalendarEvents(session.accessToken as string, maxResults);
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}
