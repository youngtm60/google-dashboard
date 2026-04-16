'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGoogleCalendarList } from '@/lib/google';

export async function fetchCalendarList() {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = (session as any)?.accessToken;

    if (!accessToken) {
      return { success: false, error: 'Not authenticated' };
    }

    const calendars = await getGoogleCalendarList(accessToken);
    return { success: true, calendars };
  } catch (error: any) {
    console.error('Failed to fetch calendar list:', error);
    return { success: false, error: error.message || 'Error fetching calendar list' };
  }
}
