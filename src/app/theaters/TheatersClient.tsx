"use client";

import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Region } from "@/types/Region";
import { Theater } from "@prisma/client";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";

type TheatersClientProps = {
  regions: Region[];
};

export default function TheatersClient({ regions }: TheatersClientProps) {
  const [selectedPrefecture, setSelectedPrefecture] = useState(0);
  const [searchResults, setSearchResults] = useState<Theater[] | undefined>([]);
  const [isRegionsExpanded, setIsRegionsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSearch = async (prefecture: number) => {
    setIsLoading(true);
    setSelectedPrefecture(prefecture);

    try {
      const results = await searchTheaters(prefecture);
      setSearchResults(results);
      setTimeout(() => {
        searchResultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const searchTheaters = async (prefecture: number) => {
    const response = await fetch(`/api/theaters?prefectureId=${prefecture}`);
    if (response.ok) {
      const data: Theater[] = await response.json();
      return data;
    }
  };

  const toggleRegions = () => {
    setIsRegionsExpanded((prev) => !prev);
  };

  return (
    <div className="container mx-auto mt-4">
      <h1 className="text-2xl font-bold mb-4">映画館検索</h1>
      <div className="grid gap-4 mb-4">
        <div className="grid gap-4">
          <button
            className="w-full duration-200 flex"
            onClick={toggleRegions}
            aria-expanded={isRegionsExpanded}
            aria-controls="regions-list"
          >
            {isRegionsExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
            <span className="mx-2 text-lg font-semibold">地域から選択</span>
          </button>
          <div
            id="regions-list"
            className={`transition-all duration-300 ease-in-out ${
              isRegionsExpanded
                ? "max-h-[2000px] opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            {regions.map((region) => (
              <div
                key={region.id}
                className="grid grid-cols-1 ml-10 md:grid-cols-[100px_1fr] gap-4 mb-2"
              >
                <h3 className="font-semibold md:mb-0 md:self-start">
                  {region.name}
                </h3>
                <div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2"
                  role="group"
                  aria-label={`${region.name}の都道府県`}
                >
                  {region.prefectures.map((pref) => (
                    <Button
                      key={pref.id}
                      variant={
                        selectedPrefecture === pref.id ? "default" : "outline"
                      }
                      onClick={() => handleSearch(pref.id)}
                      className="h-10 px-2 py-1 text-xs"
                      aria-pressed={selectedPrefecture === pref.id}
                    >
                      {pref.name}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-4 mb-4" ref={searchResultsRef}>
        {isLoading ? (
          <Loading />
        ) : searchResults && searchResults.length > 0 ? (
          searchResults.map((theater) => (
            <Card
              key={theater.id}
              className="cursor-pointer"
              onClick={() => router.push(`/theaters/${theater.id}`)}
            >
              <CardHeader>
                <CardTitle>{theater.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{theater.address}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          selectedPrefecture !== 0 && (
            <div className="text-center py-8 text-gray-500">
              登録された映画館は見つかりません
              <br />
              <Link href="/contact" className="text-blue-500 underline">
                こちら
              </Link>
              からリクエストして下さい。
            </div>
          )
        )}
      </div>
    </div>
  );
}
