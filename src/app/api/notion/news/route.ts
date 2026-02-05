import { NextResponse } from "next/server";
import { notion } from "@/lib/notion-api";
import {
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";

export async function GET() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!databaseId) {
      throw new Error("NOTION_DATABASE_ID is not defined");
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

    console.log(response);

    const news = response.results
      .filter((page): page is PageObjectResponse => "properties" in page)
      .map((page) => {
        const titleProperty = page.properties.Title;
        console.log(titleProperty);
        const title =
          titleProperty.type === "title"
            ? titleProperty.title[0]?.plain_text || ""
            : "";

        const tagProperty = page.properties.Tag;
        console.log(tagProperty);
        const tag = tagProperty.type === "select" ? tagProperty.select : {};

        const dateProperty = page.properties.CreateDate;
        console.log(dateProperty);
        const date =
          dateProperty.type === "date" ? dateProperty.date?.start || "" : "";

        const contentProperty = page.properties.Content;
        console.log(contentProperty);
        const content =
          contentProperty.type === "rich_text"
            ? contentProperty.rich_text[0]?.plain_text || ""
            : "";

        return {
          id: page.id,
          title: title,
          tag: tag,
          createDate: date,
          content: content,
        };
      });

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { message: "Error fetching news from Notion" },
      { status: 500 }
    );
  }
}
