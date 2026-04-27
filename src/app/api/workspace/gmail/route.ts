import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGmailMessages } from '@/lib/google';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const query = searchParams.get('q') || 'label:INBOX';
  
  const session = await getServerSession(authOptions);

  const messages = await getGmailMessages((session as any)?.accessToken, limit, query);
  
  return NextResponse.json(messages);
}
