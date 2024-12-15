import React from "react";
import { notion } from "@/lib/notion-api";
import { GetStaticPaths } from "next";
import {
  BlockObjectResponse,
  GetPageResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface NewsDetailProps {
  page: {
    title: string;
    createDate: string;
    content: string;
    tag?: {
      name: string;
      color: string;
    };
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId) {
    return {
      paths: [],
      fallback: false,
    };
  }

  const response = await notion.databases.query({
    database_id: databaseId,
  });

  const paths = response.results.map((page) => ({
    params: { id: page.id },
  }));

  return {
    paths,
    fallback: false,
  };
};

export async function getStaticProps({ params }: { params: { id: string } }) {
  const pageId = params?.id as string;

  const page: GetPageResponse = await notion.pages.retrieve({
    page_id: pageId,
  });
  const blocks = await notion.blocks.children.list({ block_id: pageId });

  console.log(page);

  if (!("properties" in page)) {
    return {
      notFound: true,
    };
  }

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

  const content = blocks.results
    .filter((block): block is BlockObjectResponse => "type" in block)
    .map((block) => {
      if (block.type === "paragraph") {
        return block.paragraph.rich_text[0]?.plain_text || "";
      }
      return "";
    })
    .join("\n");

  return {
    props: {
      page: {
        title,
        createDate: date,
        content,
        tag,
      },
    },
  };
}

export default function NewsDetail({ page }: NewsDetailProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="space-y-4">
          <h1 className="text-2xl font-bold">{page.title}</h1>
          <div className="flex items-center space-x-4">
            <p className="text-gray-500">{page.createDate}</p>
            {page.tag && (
              <div
                className="px-2 py-1 rounded"
                style={{ backgroundColor: page.tag.color }}
              >
                <p className="text-white text-sm">{page.tag.name}</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {page.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
