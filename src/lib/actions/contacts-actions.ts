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

    if (!query || query.trim() === '') {
      return { success: true, results: [] };
    }

    const results: { name: string; email: string }[] = [];
    const seenEmails = new Set();

    const processPerson = (personResult: any) => {
      // Depending on the API, the object might be nested under 'person' or it might BE the person
      const person = personResult.person || personResult;
      if (!person) return;
      
      const emailObj = person.emailAddresses && person.emailAddresses.length > 0 ? person.emailAddresses[0] : null;
      if (!emailObj || !emailObj.value) return;

      if (seenEmails.has(emailObj.value)) return;
      seenEmails.add(emailObj.value);

      const nameObj = person.names && person.names.length > 0 ? person.names[0] : null;
      const name = nameObj?.displayName || emailObj.value.split('@')[0];

      results.push({ name, email: emailObj.value });
    };

    try {
      const res = await people.people.searchContacts({
        query: query,
        readMask: 'names,emailAddresses',
      });
      const connections = res.data.results || [];
      console.log('SearchContacts results:', connections.length);
      connections.forEach(processPerson);
    } catch (e) {
      console.error('Error searching regular contacts:', e);
    }

    try {
      const otherRes = await people.otherContacts.search({
        query: query,
        readMask: 'names,emailAddresses',
      });
      const otherConnections = otherRes.data.results || [];
      console.log('OtherContacts results:', otherConnections.length);
      otherConnections.forEach(processPerson);
    } catch (e) {
      console.error('Error searching other contacts:', e);
    }

    console.log('Final parsed results length:', results.length);
    return { success: true, results };
  } catch (error: any) {
    console.error('People API Search Error:', error);
    return { success: false, error: error.message || 'Failed to search contacts' };
  }
}
