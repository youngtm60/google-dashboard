import { google } from 'googleapis';
import { MOCK_EMAILS, MOCK_TASKS, MOCK_FILES, MOCK_CALENDAR_EVENTS } from './mock-data';

const IS_MOCK = !process.env.GOOGLE_CLIENT_ID || process.env.USE_MOCK === 'true';

export async function getGmailMessages(accessToken?: string, maxResults: number = 20, query: string = 'is:unread') {
  if (IS_MOCK || !accessToken) {
    return MOCK_EMAILS.slice(0, maxResults);
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth });
  
  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: query,
    });

    if (!res.data.messages) return [];

    const messages = await Promise.all(
      res.data.messages.map(async (msg) => {
        const fullMsg = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
        });

        const headers = fullMsg.data.payload?.headers;
        const subject = headers?.find(h => h.name === 'Subject')?.value || 'No Subject';
        const from = headers?.find(h => h.name === 'From')?.value || 'Unknown Sender';

        return {
          id: msg.id,
          threadId: msg.threadId,
          from,
          subject,
          snippet: fullMsg.data.snippet,
          date: new Date(parseInt(fullMsg.data.internalDate!)).toISOString(),
          isUnread: fullMsg.data.labelIds?.includes('UNREAD'),
        };
      })
    );

    return messages;
  } catch (error) {
    console.error('Gmail API Error:', error);
    return MOCK_EMAILS; // Fallback to mock on error for demo purposes
  }
}

export async function getGoogleTasks(accessToken?: string) {
  if (IS_MOCK || !accessToken) {
    return MOCK_TASKS;
  }
  
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const tasksApi = google.tasks({ version: 'v1', auth });
   
  try {
    // 1. Get all task lists
    const listRes = await tasksApi.tasklists.list({ maxResults: 50 });
    const taskLists = listRes.data.items || [];
    
    // 2. Fetch tasks from all lists in parallel
    const allTasks = await Promise.all(
      taskLists.map(async (list) => {
        const res = await tasksApi.tasks.list({
          tasklist: list.id!,
          showCompleted: true,
          showHidden: true,
          maxResults: 100,
        });
        
        return (res.data.items || []).map(task => ({
          id: task.id,
          title: task.title,
          status: task.status,
          due: task.due,
          updated: task.updated,
          listId: list.id,
          listName: list.title
        }));
      })
    );
    
    // 3. Flatten and sort by update time (newest first)
    return allTasks.flat().sort((a, b) => {
      return new Date(b.updated!).getTime() - new Date(a.updated!).getTime();
    });
  } catch (error) {
    console.error('Tasks API Error (Full Sync):', error);
    return MOCK_TASKS;
  }
}

export async function getDriveFiles(accessToken?: string, query?: string) {
  if (IS_MOCK || !accessToken) {
    if (query) {
      return MOCK_FILES.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));
    }
    return MOCK_FILES;
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth });

  try {
    const res = await drive.files.list({
      pageSize: 100,
      q: query ? `name contains '${query}'` : undefined,
      fields: 'files(id, name, mimeType, modifiedTime, size, webViewLink, iconLink)',
      orderBy: 'modifiedTime desc',
    });

    return res.data.files?.map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      modifiedTime: file.modifiedTime,
      size: file.size,
      webViewLink: file.webViewLink,
      iconLink: file.iconLink,
    })) || [];
  } catch (error) {
    console.error('Drive API Error:', error);
    return MOCK_FILES;
  }
}

export async function getGoogleCalendarList(accessToken?: string) {
  if (IS_MOCK || !accessToken) {
    return [{ id: 'primary', summary: 'Primary Calendar', colorId: '#4285F4' }];
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const res = await calendar.calendarList.list({
      showHidden: true,
      maxResults: 250
    });
    return res.data.items?.map(c => ({
      id: c.id,
      summary: c.summaryOverride || c.summary,
      colorId: c.backgroundColor || '#4285F4',
    })) || [];
  } catch (error) {
    console.error('Calendar List API Error:', error);
    return [{ id: 'primary', summary: 'Primary Calendar', colorId: '#4285F4' }];
  }
}

export async function getGoogleCalendarEvents(accessToken?: string, maxResults: number = 20, calendarIds: string[] = ['primary']) {
  if (IS_MOCK || !accessToken) {
    return MOCK_CALENDAR_EVENTS;
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const allEvents = await Promise.all(
      calendarIds.map(async (calId) => {
        try {
          const res = await calendar.events.list({
            calendarId: calId,
            timeMin: new Date().toISOString(),
            timeMax: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            maxResults: maxResults > 20 ? maxResults : 150,
            singleEvents: true,
            orderBy: 'startTime',
          });

          return res.data.items?.map(event => ({
            id: event.id,
            summary: event.summary,
            start: event.start,
            end: event.end,
            location: event.location,
            description: event.description,
            hangoutLink: event.hangoutLink,
            calendarId: calId // Tag with source calendar
          })) || [];
        } catch (err) {
          console.error(`Calendar API Error for ${calId}:`, err);
          return [];
        }
      })
    );

    // Flatten and sort by start time
    return allEvents.flat().sort((a, b) => {
      const timeA = new Date(a.start?.dateTime || a.start?.date || 0).getTime();
      const timeB = new Date(b.start?.dateTime || b.start?.date || 0).getTime();
      return timeA - timeB;
    });
  } catch (error) {
    console.error('Calendar API Error:', error);
    throw error;
  }
}

export async function createGoogleCalendarEvent(
  accessToken: string,
  eventData: { summary: string; location?: string; description?: string; start: string; end: string }
) {
  if (IS_MOCK || !accessToken) {
    // In mock mode, we would just simulate success
    return { id: "mock-new-event-" + Date.now(), summary: eventData.summary };
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: eventData.summary,
        location: eventData.location,
        description: eventData.description,
        start: { dateTime: eventData.start },
        end: { dateTime: eventData.end },
      },
    });

    return res.data;
  } catch (error) {
    console.error('Calendar API Insert Error:', error);
    throw error;
  }
}

export async function updateGoogleCalendarEvent(
  accessToken: string,
  eventId: string,
  eventData: { summary: string; location?: string; description?: string; start: string; end: string }
) {
  if (IS_MOCK || !accessToken) return { id: eventId, summary: eventData.summary };

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const res = await calendar.events.patch({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: {
        summary: eventData.summary,
        location: eventData.location,
        description: eventData.description,
        start: { dateTime: eventData.start },
        end: { dateTime: eventData.end },
      },
    });
    return res.data;
  } catch (error) {
    console.error('Calendar API Update Error:', error);
    throw error;
  }
}

export async function deleteGoogleCalendarEvent(accessToken: string, eventId: string) {
  if (IS_MOCK || !accessToken) return { success: true };

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
    return { success: true };
  } catch (error) {
    console.error('Calendar API Delete Error:', error);
    throw error;
  }
}
