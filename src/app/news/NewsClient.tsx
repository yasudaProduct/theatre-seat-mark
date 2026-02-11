"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface NewsItem {
  id: string;
  title: string;
  createDate: string;
  tag?: {
    name: string;
    color: string;
  } | null;
}

interface NewsClientProps {
  news: NewsItem[];
}

export default function NewsClient({ news }: NewsClientProps) {
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
