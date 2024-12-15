import React from "react";
import { notion } from "@/lib/notion-api";
import {
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface NewsPageProps {
  news: {
    id: string;
    title: string;
    createDate: string;
    tag?: {
      name: string;
      color: string;
    };
  }[];
}

export async function getStaticProps() {
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId) {
    return {
      props: {
        news: [],
      },
    };
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
      const tag = tagProperty.type === "select" ? tagProperty.select : null;

      const dateProperty = page.properties.CreateDate;
      const date =
        dateProperty.type === "date" ? dateProperty.date?.start || "" : "";

      if (title !== "" || tagProperty !== null || date !== "") {
        return {
          id: page.id,
          title: title,
          tag: tag,
          createDate: date,
        };
      }
    });

  return {
    props: {
      news,
    },
  };
}

export default function News({ news }: NewsPageProps) {
  const router = useRouter();
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="">お知らせ</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((page) => (
          <Card
            key={page.id}
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              router.push(`/news/${page.id}`);
            }}
          >
            <CardHeader className="font-bold">{page.title}</CardHeader>
            <CardContent className="p-4">
              <p className="text-gray-500 text-sm">{page.createDate}</p>
              {page.tag && (
                <div
                  className="inline-block px-2 py-1 rounded mt-2"
                  style={{ backgroundColor: page.tag.color }}
                >
                  <p className="text-white text-sm">{page.tag.name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
