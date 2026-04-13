import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDriveFiles } from '@/lib/google';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || undefined;
  
  const session = await getServerSession(authOptions);

  const files = await getDriveFiles((session as any)?.accessToken, query);
  
  return NextResponse.json(files);
}
