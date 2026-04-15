'use server';

import { Client } from '@notionhq/client';
import { MOCK_NOTION_CONTENT } from '../mock-data';

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
