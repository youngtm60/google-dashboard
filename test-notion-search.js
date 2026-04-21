const { Client } = require('@notionhq/client');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const notion = new Client({ auth: process.env.NOTION_INTEGRATION_TOKEN });
  try {
    const response = await notion.search({
      filter: { property: 'object', value: 'page' }
    });
    console.log(`Found ${response.results.length} pages via search.`);
  } catch(e) {
    console.error(e.message);
  }
}
run();
