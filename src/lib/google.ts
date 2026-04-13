import { google } from 'googleapis';
import { MOCK_EMAILS, MOCK_TASKS, MOCK_FILES } from './mock-data';

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

export async function getGoogleCalendarEvents(accessToken?: string, maxResults: number = 20) {
  if (IS_MOCK || !accessToken) {
    return MOCK_CALENDAR_EVENTS;
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults,
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
    })) || [];
  } catch (error) {
    console.error('Calendar API Error:', error);
    return MOCK_CALENDAR_EVENTS;
  }
}
