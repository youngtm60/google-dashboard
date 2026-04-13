import { NextResponse } from 'next/server';
import { getNotionNotes } from '@/lib/notion';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || undefined;

  try {
    const notes = await getNotionNotes(query);
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Notion notes' }, { status: 500 });
  }
}
