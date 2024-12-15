import { NextApiRequest, NextApiResponse } from 'next';
import { notion } from '@/lib/notion-api';
import { PageObjectResponse, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const databaseId = process.env.NOTION_DATABASE_ID;

        if (!databaseId) {
            throw new Error('NOTION_DATABASE_ID is not defined');
        }

        const response: QueryDatabaseResponse = await notion.databases.query({
            database_id: databaseId,
            // filter: {
            //     property: 'CreateDate',
            //     date: {
            //         after: '2024-12-15',
            //     },
            // },
            sorts: [
                {
                    property: 'CreateDate',
                    direction: 'descending',
                },
            ],
        });

        console.log(response);
        // return res.status(200).json(response);

        const news = response.results
            .filter((page): page is PageObjectResponse => 'properties' in page)
            .map((page) => {
                const titleProperty = page.properties.Title;
                console.log(titleProperty);
                const title = titleProperty.type === 'title' ? titleProperty.title[0]?.plain_text || '' : '';

                const tagProperty = page.properties.Tag;
                console.log(tagProperty);
                const tag = tagProperty.type === 'select' ? tagProperty.select : {};

                const dateProperty = page.properties.CreateDate;
                console.log(dateProperty);
                const date = dateProperty.type === 'date' ? dateProperty.date?.start || '' : '';

                const contentProperty = page.properties.Content;
                console.log(contentProperty);
                const content = contentProperty.type === 'rich_text' ? contentProperty.rich_text[0]?.plain_text || '' : '';

                return {
                    id: page.id,
                    title: title,
                    tag: tag,
                    createDate: date,
                    content: content,
                };
            });

        return res.status(200).json(news);
    } catch (error) {
        console.error('Error fetching news:', error);
        return res.status(500).json({ message: 'Error fetching news from Notion' });
    }
}
