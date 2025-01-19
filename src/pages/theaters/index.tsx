import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import getLogger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prefecture } from "@/types/Prefecture";
import { Region } from "@/types/Region";
import { Theater } from "@prisma/client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const logger = getLogger("theaters");

type TheatersPageProps = {
  regions: Region[];
};

const Theaters = (props: TheatersPageProps) => {
  const [selectedPrefecture, setSelectedPrefecture] = useState(0);
  // const [location, setLocation] = useState({ lat: null, lng: null });
  const [searchResults, setSearchResults] = useState<Theater[] | undefined>([]);
  const [isRegionsExpanded, setIsRegionsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {}, []);

  const handleSearch = async (prefecture: number) => {
    setIsLoading(true);
    setSelectedPrefecture(prefecture);

    try {
      const results = await searchTheaters(
        // theaterName,
        prefecture
        // location.lat,
        // location.lng
      );
      setSearchResults(results);
      setTimeout(() => {
        searchResultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const searchTheaters = async (
    // name: string,
    prefecture: number
    // lat: number | null,
    // lng: number | null
  ) => {
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
        {/* <Input
          placeholder="映画館名"
          value={theaterName}
          onChange={(e) => setTheaterName(e.target.value)}
        /> */}
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
            {props.regions.map((region) => (
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
                      // onClick={() => setSelectedPrefecture(pref.id)}
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
        {/* <Button onClick={handleLocationSearch}>
          <MapPin className="mr-2 h-4 w-4" /> 現在位置から検索
        </Button> */}
        {/* <Button onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" /> 検索
        </Button> */}
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
};

export default Theaters;

export const getStaticProps: GetStaticProps = async () => {
  const regions = await prisma.region.findMany({
    select: {
      id: true,
      name: true,
      name_kana: true,
      prefecture: true,
    },
  });

  if (!regions) {
    logger.error("Failed to fetch theaters");
    return {
      notFound: true,
    };
  }

  const result: Region[] = regions.map((region) => {
    return {
      id: region.id,
      name: region.name,
      name_kana: region.name_kana,
      prefectures: region.prefecture.map((prefecture) => {
        return {
          id: prefecture.id,
          name: prefecture.name,
          name_kana: prefecture.name_kana,
        } as Prefecture;
      }),
    } as Region;
  });

  return {
    props: { regions: result } as TheatersPageProps,
  };
};
