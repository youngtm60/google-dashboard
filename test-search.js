const { Client } = require('@notionhq/client');
require('dotenv').config({ path: '.env.local' });
const notion = new Client({ auth: process.env.NOTION_INTEGRATION_TOKEN });

async function run() {
  const q1 = await notion.search({ query: 'Potatoes' });
  console.log('Title search for Potatoes:', q1.results.length);
  
  const q2 = await notion.search({ query: 'Fudge' });
  console.log('Title search for Fudge:', q2.results.length);
}
run();
