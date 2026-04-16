'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';

export async function searchGoogleContacts(query: string) {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = (session as any)?.accessToken;

    if (!accessToken) {
      return { success: false, error: 'Not authenticated' };
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const people = google.people({ version: 'v1', auth });

    // Ensure query is non-empty, otherwise there's nothing to search
    if (!query || query.trim() === '') {
      return { success: true, results: [] };
    }

    const res = await people.people.searchContacts({
      query: query,
      readMask: 'names,emailAddresses',
    });

    const results: { name: string; email: string }[] = [];

    const connections = res.data.results || [];
    
    connections.forEach((personResult) => {
      const person = personResult.person;
      if (!person) return;
      
      const emailObj = person.emailAddresses && person.emailAddresses.length > 0 ? person.emailAddresses[0] : null;
      if (!emailObj || !emailObj.value) return;

      const nameObj = person.names && person.names.length > 0 ? person.names[0] : null;
      const name = nameObj?.displayName || emailObj.value.split('@')[0];

      results.push({ name, email: emailObj.value });
    });

    return { success: true, results };
  } catch (error: any) {
    console.error('People API Search Error:', error);
    return { success: false, error: error.message || 'Failed to search contacts' };
  }
}
