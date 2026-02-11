import { notion } from "@/lib/notion-api";
import {
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import NewsClient from "./NewsClient";

export const dynamic = "force-dynamic";

interface NewsItem {
  id: string;
  title: string;
  createDate: string;
  tag: {
    id: string;
    name: string;
    color: string;
  } | null;
}

async function getNews(): Promise<NewsItem[]> {
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId) {
    return [];
  }

  const response: QueryDatabaseResponse = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: "CreateDate",
        direction: "descending",
      },
    ],
  });

  const news = response.results
    .filter((page): page is PageObjectResponse => "properties" in page)
    .map((page) => {
      const titleProperty = page.properties.Title;
      const title =
        titleProperty.type === "title"
          ? titleProperty.title[0]?.plain_text || ""
          : "";

      const tagProperty = page.properties.Tag;
      const tagSelect = tagProperty.type === "select" ? tagProperty.select : null;
      const tag = tagSelect ? {
        id: tagSelect.id,
        name: tagSelect.name,
        color: String(tagSelect.color),
      } : null;

      const dateProperty = page.properties.CreateDate;
      const date =
        dateProperty.type === "date" ? dateProperty.date?.start || "" : "";

      if (title !== "" || tagProperty !== null || date !== "") {
        return {
          id: page.id,
          title,
          tag,
          createDate: date,
        };
      }
      return null;
    })
    .filter((item): item is NewsItem => item !== null);

  return news;
}

export default async function NewsPage() {
  const news = await getNews();

  return <NewsClient news={news} />;
}
