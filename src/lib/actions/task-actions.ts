'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { revalidatePath } from 'next/cache';

const IS_MOCK = !process.env.GOOGLE_CLIENT_ID || process.env.USE_MOCK === 'true';

export async function addTask(title: string, listId: string = '@default') {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken;

  console.log(`[TaskAction] Adding task to list ${listId}: ${title}`);

  if (IS_MOCK || !accessToken) {
    return { success: true, mock: true };
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const tasks = google.tasks({ version: 'v1', auth });

  try {
    await tasks.tasks.insert({
      tasklist: listId,
      requestBody: { title, status: 'needsAction' },
    });
    revalidatePath('/'); // Revalidate the dashboard
    return { success: true };
  } catch (error) {
    console.error('Add Task Error:', error);
    return { success: false, error: 'Failed to add task' };
  }
}

export async function completeTask(taskId: string, listId: string = '@default', status: string = 'completed') {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken;

  console.log(`[TaskAction] Updating task ${taskId} in list ${listId} to status: ${status}`);

  if (IS_MOCK || !accessToken) {
    return { success: true, mock: true };
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const tasks = google.tasks({ version: 'v1', auth });

  try {
    await tasks.tasks.update({
      tasklist: listId,
      task: taskId,
      requestBody: { id: taskId, status },
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Update Task Error:', error);
    return { success: false, error: 'Failed to update task' };
  }
}

export async function editTaskTitle(taskId: string, listId: string, title: string) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken;

  if (IS_MOCK || !accessToken) return { success: true };

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const tasks = google.tasks({ version: 'v1', auth });

  try {
    await tasks.tasks.patch({
      tasklist: listId,
      task: taskId,
      requestBody: { title },
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Edit Task Error:', error);
    return { success: false, error: 'Failed to edit task' };
  }
}

export async function deleteTask(taskId: string, listId: string) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken;

  if (IS_MOCK || !accessToken) return { success: true };

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const tasks = google.tasks({ version: 'v1', auth });

  try {
    await tasks.tasks.delete({
      tasklist: listId,
      task: taskId,
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Delete Task Error:', error);
    return { success: false, error: 'Failed to delete task' };
  }
}

