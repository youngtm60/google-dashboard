'use server';

import { Client } from '@notionhq/client';
import { MOCK_NOTION_CONTENT, MOCK_NOTION_PAGES } from '../mock-data';

const notionToken = process.env.NOTION_INTEGRATION_TOKEN;
const notion = new Client({ auth: notionToken });

export async function getNotionPageBlocks(pageId: string) {
  if (!notionToken) {
    // Return mock data
    const mockBlocks = MOCK_NOTION_CONTENT[pageId] || [];
    return { success: true, blocks: mockBlocks };
  }

  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });

    const blocks = response.results.map((block: any) => {
      let text = '';
      const type = block.type;
      
      const richTextObj = block[type]?.rich_text;
      if (richTextObj && Array.isArray(richTextObj)) {
        text = richTextObj.map((t: any) => t.plain_text).join('');
      } else if (type === 'child_page') {
        text = `[Sub-page]: ${block.child_page.title}`;
      } else if (type === 'bookmark') {
        text = `[Bookmark]: ${block.bookmark.url}`;
      }

      return { id: block.id, type, text };
    }).filter((b: any) => b.text !== '' || b.type === 'paragraph'); // Keep paragraphs even if empty

    return { success: true, blocks };
  } catch (error: any) {
    console.error('Failed to fetch Notion blocks:', error);
    return { success: false, error: error.message };
  }
}

export async function updateNotionBlock(blockId: string, text: string, type: string = 'paragraph') {
  if (!notionToken) {
    // Update mock data
    for (const page in MOCK_NOTION_CONTENT) {
      const block = MOCK_NOTION_CONTENT[page].find(b => b.id === blockId);
      if (block) {
        block.text = text;
        return { success: true };
      }
    }
    return { success: false, error: 'Mock block not found' };
  }

  try {
    // Prevent trying to update unsupported types dynamically
    if (type === 'child_page' || type === 'bookmark') {
      return { success: false, error: 'Cannot edit this block type inline.' };
    }

    const updatePayload: any = { block_id: blockId };
    updatePayload[type] = {
      rich_text: [
        { text: { content: text } }
      ]
    };

    await notion.blocks.update(updatePayload);

    return { success: true };
  } catch (error: any) {
    console.error('Failed to update Notion block:', error);
    return { success: false, error: error.message };
  }
}


export async function createNotionPage(title: string, notebook: string = 'Personal') {
  const personalId = process.env.NOTION_PERSONAL_ID;
  const byuId = process.env.NOTION_BYU_NOTES_ID;

  if (!notionToken) {
    // Mock implementation
    const newId = 'mock-page-' + Date.now();
    MOCK_NOTION_PAGES.unshift({
      id: newId,
      title: title,
      notebook: notebook,
      lastEdited: new Date().toISOString(),
      url: '#',
      icon: '📄'
    });
    MOCK_NOTION_CONTENT[newId] = [
      { id: 'block-1', type: 'paragraph', text: '' }
    ];
    return { success: true, pageId: newId };
  }

  try {
    const parentId = notebook === 'BYU Notes' ? byuId : personalId;
    if (!parentId) {
      return { success: false, error: `No parent ID configured for ${notebook}` };
    }

    const response = await notion.pages.create({
      parent: { type: 'database_id', database_id: parentId },
      properties: {
        Name: { // Assumes database has 'Name' title property
          title: [
            { text: { content: title } }
          ]
        }
      }
    });

    return { success: true, pageId: response.id };
  } catch (error: any) {
    // If parent is a page instead of database, we might need parent: { type: 'page_id', page_id: parentId }
    // Let's try page_id fallback if database_id fails
    try {
      const parentId = notebook === 'BYU Notes' ? byuId : personalId;
      if (!parentId) throw new Error("No parent ID");
      const response = await notion.pages.create({
        parent: { type: 'page_id', page_id: parentId },
        properties: {
          title: {
            title: [
              { text: { content: title } }
            ]
          }
        }
      });
      return { success: true, pageId: response.id };
    } catch (fallbackError: any) {
      console.error('Failed to create Notion page:', fallbackError);
      return { success: false, error: fallbackError.message };
    }
  }
}
