import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGmailUnreadCount } from '@/lib/google';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  const count = await getGmailUnreadCount((session as any)?.accessToken);
  
  return NextResponse.json({ unreadCount: count });
}
