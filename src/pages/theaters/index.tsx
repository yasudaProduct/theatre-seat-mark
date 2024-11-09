import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import getLogger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prefecture } from "@/types/Prefecture";
import { Region } from "@/types/Region";
import { Theater } from "@prisma/client";
import { MapPin, Search } from "lucide-react";
import { GetStaticProps } from "next";
import { useRouter } from "next/navigation";
import Router from "next/router";
import React, { useEffect, useState } from "react";

const logger = getLogger("theaters");

type TheatersPageProps = {
  regions: Region[];
};

const Theaters = (props: TheatersPageProps) => {
  const [selectedPrefecture, setSelectedPrefecture] = useState(0);
  // const [location, setLocation] = useState({ lat: null, lng: null });
  const [searchResults, setSearchResults] = useState<Theater[] | undefined>([]);
  const router = useRouter();

  useEffect(() => {}, []);

  // const handleLocationSearch = () => {
  //   if ("geolocation" in navigator) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         setLocation({
  //           lat: position.coords.latitude,
  //           lng: position.coords.longitude,
  //         });
  //       },
  //       (error) => {
  //         console.error("Error getting location:", error);
  //       }
  //     );
  //   } else {
  //     console.error("Geolocation is not supported by this browser.");
  //   }
  // };

  const handleSearch = async () => {
    const results = await searchTheaters(
      // theaterName,
      selectedPrefecture
      // location.lat,
      // location.lng
    );
    setSearchResults(results);
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

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">映画館検索</h1>
      <div className="grid gap-4 mb-4">
        {/* <Input
          placeholder="映画館名"
          value={theaterName}
          onChange={(e) => setTheaterName(e.target.value)}
        /> */}
        <div className="space-y-4">
          {props.regions.map((region) => (
            <div key={region.id}>
              <h2 className="text-lg font-semibold mb-2">{region.name}</h2>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {region.prefectures.map((pref) => (
                  <Button
                    key={pref.id}
                    variant={
                      selectedPrefecture === pref.id ? "default" : "outline"
                    }
                    onClick={() => setSelectedPrefecture(pref.id)}
                    className="h-10 px-2 py-1 text-xs"
                  >
                    {pref.name}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* <Button onClick={handleLocationSearch}>
          <MapPin className="mr-2 h-4 w-4" /> 現在位置から検索
        </Button> */}
        <Button onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" /> 検索
        </Button>
      </div>
      <div className="grid gap-4">
        {searchResults &&
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
          ))}
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

  console.log(result);

  return {
    props: { regions: result } as TheatersPageProps,
  };
};
