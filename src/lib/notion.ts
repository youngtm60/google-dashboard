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
    const notebooks = [
      { id: personalId, label: 'Personal' },
      { id: byuId, label: 'BYU Notes' }
    ].filter(n => n.id);

    const allPages = await Promise.all(
      notebooks.map(async (notebook) => {
        try {
          const filter: any = query ? {
            property: 'Name',
            title: {
              contains: query
            }
          } : undefined;

          // Attempt to query as a database with filter
          const response = await notion.databases.query({
            database_id: notebook.id!,
            filter: filter,
            sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }],
            page_size: 100,
          });

          return response.results.map((page: any) => {
            const title = page.properties.Name?.title?.[0]?.plain_text || 
                          page.properties.title?.title?.[0]?.plain_text || 
                          'Untitled';
            
            return {
              id: page.id,
              title: title,
              notebook: notebook.label,
              lastEdited: page.last_edited_time,
              url: page.url,
              icon: page.icon?.emoji || '📄'
            };
          });
        } catch (dbError) {
          // If it fails as a database, it might be a parent page
          // Fetching children pages of a parent page
          const response = await notion.blocks.children.list({
            block_id: notebook.id!,
            page_size: 100,
          });

          const pages = response.results.filter((block: any) => block.type === 'child_page');
          
          return pages.map((page: any) => ({
            id: page.id,
            title: page.child_page.title,
            notebook: notebook.label,
            lastEdited: new Date().toISOString(), // Block children list doesn't give last_edited_time easily
            url: `https://notion.so/${page.id.replace(/-/g, '')}`,
            icon: '📄'
          }));
        }
      })
    );

    // Flatten and sort by last edited
    return allPages.flat().sort((a, b) => 
      new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime()
    );

  } catch (error) {
    console.error('Notion API Error:', error);
    return MOCK_NOTION_PAGES;
  }
}
