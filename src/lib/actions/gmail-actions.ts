'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { revalidatePath } from 'next/cache';

const IS_MOCK = !process.env.GOOGLE_CLIENT_ID || process.env.USE_MOCK === 'true';

// Helper to recursively extract the HTML or text body from a Gmail payload
function getMessageBody(payload: any): string {
  if (!payload) return '';
  
  if (payload.mimeType === 'text/html' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64url').toString('utf8');
  }
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    const text = Buffer.from(payload.body.data, 'base64url').toString('utf8');
    return `<div style="white-space: pre-wrap; font-family: sans-serif;">${text}</div>`;
  }
  
  if (payload.parts) {
    // Try to find HTML first
    const htmlPart = payload.parts.find((p: any) => p.mimeType === 'text/html');
    if (htmlPart && htmlPart.body?.data) {
      return Buffer.from(htmlPart.body.data, 'base64url').toString('utf8');
    }
    // Try plain text
    const textPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (textPart && textPart.body?.data) {
      const text = Buffer.from(textPart.body.data, 'base64url').toString('utf8');
      return `<div style="white-space: pre-wrap; font-family: sans-serif;">${text}</div>`;
    }
    
    // Recurse into sub-parts (like multipart/alternative)
    for (const part of payload.parts) {
      const result = getMessageBody(part);
      if (result) return result;
    }
  }
  
  return '<i>Message body not available.</i>';
}

export async function getGmailMessageDetails(messageId: string) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken;

  if (IS_MOCK || !accessToken) {
    return { success: true, bodyHtml: '<p>This is a mock email body.</p>', mock: true };
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const res = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    const bodyHtml = getMessageBody(res.data.payload);
    
    // Extract headers just in case we need more details on the detail page
    const headers = res.data.payload?.headers || [];
    const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
    const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
    const date = new Date(parseInt(res.data.internalDate!)).toISOString();

    return { 
      success: true, 
      bodyHtml,
      subject,
      from,
      date,
      isUnread: res.data.labelIds?.includes('UNREAD')
    };
  } catch (error) {
    console.error('Get Gmail Details Error:', error);
    return { success: false, error: 'Failed to fetch message details' };
  }
}

export async function trashGmailMessage(messageId: string) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken;

  if (IS_MOCK || !accessToken) return { success: true, mock: true };

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    await gmail.users.messages.trash({
      userId: 'me',
      id: messageId,
    });
    return { success: true };
  } catch (error) {
    console.error('Trash Gmail Message Error:', error);
    return { success: false, error: 'Failed to trash message' };
  }
}

export async function archiveGmailMessage(messageId: string) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken;

  if (IS_MOCK || !accessToken) return { success: true, mock: true };

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['INBOX'],
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Archive Gmail Message Error:', error);
    return { success: false, error: 'Failed to archive message' };
  }
}

export async function markGmailAsRead(messageId: string) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken;

  if (IS_MOCK || !accessToken) return { success: true, mock: true };

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Mark Gmail Read Error:', error);
    return { success: false, error: 'Failed to mark message as read' };
  }
}

export async function sendGmailMessage(to: string, subject: string, bodyText: string) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken;

  if (IS_MOCK || !accessToken) return { success: true, mock: true };

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    // Ensures clean UTF-8 encoding for Subject header
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    
    // Construct valid RFC 2822 email format
    const messageParts = [
      `To: ${to}`,
      `Subject: ${utf8Subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      bodyText.replace(/\n/g, '<br>'), // Convert plaintext newlines to HTML
    ];
    
    const message = messageParts.join('\r\n');
    const encodedMessage = Buffer.from(message).toString('base64url');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Send Gmail Error:', error);
    return { success: false, error: 'Failed to send message' };
  }
}
