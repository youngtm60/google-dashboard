import { Client } from '@notionhq/client';
import { MOCK_NOTION_PAGES } from './mock-data';

const notionToken = process.env.NOTION_INTEGRATION_TOKEN;
const personalId = process.env.NOTION_PERSONAL_ID;
const byuId = process.env.NOTION_BYU_NOTES_ID;

const notion = new Client({ auth: notionToken });

export async function getNotionNotes(query?: string) {
  if (!notionToken || (!personalId && !byuId)) {
    // If mocking, filter the mock data
    if (query) {
      return MOCK_NOTION_PAGES.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) || 
        p.notebook.toLowerCase().includes(query.toLowerCase())
      );
    }
    return MOCK_NOTION_PAGES;
  }

  try {
    const searchParams: any = {
      filter: { property: 'object', value: 'page' },
      sort: { direction: 'descending', timestamp: 'last_edited_time' },
      page_size: 100,
    };

    if (query) {
      searchParams.query = query;
    }

    const response = await notion.search(searchParams);

    const allPages = response.results.map((page: any) => {
      const title = page.properties?.Name?.title?.[0]?.plain_text || 
                    page.properties?.title?.title?.[0]?.plain_text || 
                    'Untitled Note';
      
      // Attempt to categorize based on parent if known, else 'Workspace'
      let notebook = 'Workspace';
      if (page.parent?.type === 'database_id') {
        const parentId = page.parent.database_id.replace(/-/g, '');
        if (personalId && parentId === personalId.replace(/-/g, '')) notebook = 'Personal';
        if (byuId && parentId === byuId.replace(/-/g, '')) notebook = 'BYU Notes';
      } else if (page.parent?.type === 'page_id') {
        const parentId = page.parent.page_id.replace(/-/g, '');
        if (personalId && parentId === personalId.replace(/-/g, '')) notebook = 'Personal';
        if (byuId && parentId === byuId.replace(/-/g, '')) notebook = 'BYU Notes';
      }

      return {
        id: page.id,
        title: title,
        notebook: notebook,
        lastEdited: page.last_edited_time,
        url: page.url,
        icon: page.icon?.emoji || '📄'
      };
    });

    // We no longer need to flatten or sort, as search API handles descending order.
    return allPages;

  } catch (error) {
    console.error('Notion API Error:', error);
    return MOCK_NOTION_PAGES;
  }
}
