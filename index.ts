import 'dotenv/config';
import { Client, LogLevel } from '@notionhq/client';
import util from 'util';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  logLevel: LogLevel.DEBUG,
});

console.time('RUN_POC');

// 1. obter a ultima sprint
// obtem as sprints
const currentSprint = await notion.databases.query({
  database_id: 'acb2d0ca-55cd-4b19-94f8-b176ad88a148',
  sorts: [
    {
      timestamp: 'created_time',
      direction: 'descending',
    },
  ],
  page_size: 1,
});

// obtem o id do block da sprint mais recente
const currentSprintId = currentSprint.results.at(0)?.id;

if (currentSprintId == undefined) {
  process.exit(1);
}

// obtem o block da sprint mais recente
const sprintBlock = await notion.blocks.children.list({
  block_id: currentSprintId,
});

// obtem o id do database da sprint mais recente
const currentSprintDatabaseId = sprintBlock.results.at(0)?.id;

if (currentSprintDatabaseId == undefined) {
  process.exit(1);
}

// 2. obter as entrys com version null
// obtem o database da sprint mais recente
const currentSprintDatabase = await notion.databases.query({
  database_id: currentSprintDatabaseId,
  filter: {
    and: [
      {
        property: 'Version',
        number: {
          is_empty: true,
        },
      },
    ],
  },
});

const entrys = currentSprintDatabase.results.map(entry => {
  const {
    properties: { Description, Link, Category },
  } = entry as { properties: any };
  return {
    Description: Description.title.at(0).plain_text,
    Link: Link.url,
    Category: Category.select.name,
  };
});

console.log(
  'SPRINT',
  util.inspect(entrys, {
    showHidden: false,
    depth: null,
    colors: true,
  })
);

console.timeEnd('RUN_POC');
