"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { regions } from "@/data/regions";

interface ScrapedScreen {
  name: string;
  seatCount: number;
}

interface ScrapedTheater {
  name: string;
  address: string;
  url: string | null;
  prefectureId: number;
  screens: ScrapedScreen[];
  sourceUrl: string;
}

const TheaterScraper = () => {
  const [prefectureId, setPrefectureId] = useState<string>("");
  const [theaters, setTheaters] = useState<ScrapedTheater[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleScrape = async () => {
    if (!prefectureId) {
      toast.error("都道府県を選択してください");
      return;
    }

    setLoading(true);
    setTheaters([]);
    setSelectedIndexes(new Set());

    try {
      const response = await fetch(
        `/api/theaters/scrape?prefectureId=${prefectureId}`
      );
      if (!response.ok) {
        throw new Error("取得に失敗しました");
      }
      const data = await response.json();
      setTheaters(data.theaters);
      toast.success(`${data.count}件の映画館を取得しました`);
    } catch {
      toast.error("映画館情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (index: number) => {
    setSelectedIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIndexes.size === theaters.length) {
      setSelectedIndexes(new Set());
    } else {
      setSelectedIndexes(new Set(theaters.map((_, i) => i)));
    }
  };

  const handleImport = async () => {
    if (selectedIndexes.size === 0) {
      toast.error("インポートする映画館を選択してください");
      return;
    }

    setImporting(true);

    try {
      const selectedTheaters = theaters.filter((_, i) =>
        selectedIndexes.has(i)
      );

      const response = await fetch("/api/theaters/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theaters: selectedTheaters }),
      });

      if (!response.ok) {
        throw new Error("インポートに失敗しました");
      }

      const data = await response.json();
      const created = data.results.filter(
        (r: { status: string }) => r.status === "created"
      ).length;
      const skipped = data.results.filter(
        (r: { status: string }) => r.status === "skipped"
      ).length;

      let message = `${created}件をインポートしました`;
      if (skipped > 0) {
        message += `（${skipped}件は登録済みのためスキップ）`;
      }
      toast.success(message);
      setSelectedIndexes(new Set());
    } catch {
      toast.error("インポート中にエラーが発生しました");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">映画館データ自動取得</h2>
        <p className="text-sm text-muted-foreground mb-4">
          映画.com（eiga.com）から映画館・スクリーン・座席数を自動取得します。
        </p>

        <div className="flex gap-2 mb-4 items-end">
          <div className="flex-1 max-w-xs">
            <label className="text-sm font-medium mb-1 block">都道府県</label>
            <Select value={prefectureId} onValueChange={setPrefectureId}>
              <SelectTrigger>
                <SelectValue placeholder="都道府県を選択" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectGroup key={region.id}>
                    <SelectLabel>{region.name}</SelectLabel>
                    {region.prefecture.map((pref) => (
                      <SelectItem key={pref.id} value={String(pref.id)}>
                        {pref.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleScrape} disabled={loading || !prefectureId}>
            {loading ? "取得中..." : "映画館を検索"}
          </Button>
        </div>

        {loading && (
          <div className="text-center py-8 text-muted-foreground">
            映画館情報を取得中です。しばらくお待ちください...
          </div>
        )}

        {!loading && theaters.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                {theaters.length}件の映画館が見つかりました（
                {selectedIndexes.size}件選択中）
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedIndexes.size === theaters.length
                    ? "全選択解除"
                    : "全選択"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleImport}
                  disabled={importing || selectedIndexes.size === 0}
                >
                  {importing ? "インポート中..." : "選択した映画館をインポート"}
                </Button>
              </div>
            </div>

            <div className="max-h-[600px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">選択</TableHead>
                    <TableHead>映画館名</TableHead>
                    <TableHead>住所</TableHead>
                    <TableHead className="w-28">スクリーン数</TableHead>
                    <TableHead>スクリーン詳細</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {theaters.map((theater, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIndexes.has(index)}
                          onChange={() => handleToggleSelect(index)}
                          className="h-4 w-4"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {theater.name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {theater.address || "-"}
                      </TableCell>
                      <TableCell>{theater.screens.length}スクリーン</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {theater.screens.length > 0
                          ? theater.screens
                              .map((s) => `${s.name}(${s.seatCount}席)`)
                              .join(", ")
                          : "スクリーン情報なし"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {!loading && theaters.length === 0 && prefectureId && (
          <div className="text-center py-4 text-muted-foreground">
            上の「映画館を検索」ボタンを押して映画館を取得してください
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TheaterScraper;
