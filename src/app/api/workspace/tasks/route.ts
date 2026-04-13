import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGoogleTasks } from '@/lib/google';

export async function GET() {
  const session = await getServerSession(authOptions);
  const tasks = await getGoogleTasks((session as any)?.accessToken);
  return NextResponse.json(tasks);
}
