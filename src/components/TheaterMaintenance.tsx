"use client";

import React, { useMemo } from "react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useRouter } from "next/navigation";
import { regions } from "@/data/regions";

interface Theater {
  id: number;
  name: string;
  address: string;
  url: string | null;
  prefecture_id: number;
}

const prefectureMap = new Map<number, string>();
regions.forEach((region) => {
  region.prefecture.forEach((pref) => {
    prefectureMap.set(pref.id, pref.name);
  });
});

const TheaterMaintenance = () => {
  const router = useRouter();
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Theater>({
    id: 0,
    name: "",
    address: "",
    url: "",
    prefecture_id: 0,
  });

  useEffect(() => {
    fetchTheaters();
  }, []);

  const fetchTheaters = async () => {
    try {
      const response = await fetch("/api/theaters");
      if (response.ok) {
        const data = await response.json();
        setTheaters(data);
      }
    } catch {
      toast.error("劇場情報の取得に失敗しました");
    }
  };

  const handleEdit = (theater: Theater) => {
    setEditingId(theater.id);
    setEditForm(theater);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/theaters/${editForm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast.success("更新しました");
        setEditingId(null);
        fetchTheaters();
      }
    } catch {
      toast.error("更新に失敗しました");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const getPrefectureName = useMemo(() => {
    return (id: number) => prefectureMap.get(id) || `ID: ${id}`;
  }, []);

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">映画館一覧</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>劇場名</TableHead>
              <TableHead>住所</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>都道府県</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {theaters.map((theater) => (
              <TableRow key={theater.id}>
                <TableCell>{theater.id}</TableCell>
                <TableCell>
                  {editingId === theater.id ? (
                    <Input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                    />
                  ) : (
                    theater.name
                  )}
                </TableCell>
                <TableCell>
                  {editingId === theater.id ? (
                    <Input
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm({ ...editForm, address: e.target.value })
                      }
                    />
                  ) : (
                    theater.address
                  )}
                </TableCell>
                <TableCell>
                  {editingId === theater.id ? (
                    <Input
                      value={editForm.url || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, url: e.target.value })
                      }
                    />
                  ) : (
                    theater.url
                  )}
                </TableCell>
                <TableCell>
                  {editingId === theater.id ? (
                    <Select
                      value={String(editForm.prefecture_id)}
                      onValueChange={(value) =>
                        setEditForm({
                          ...editForm,
                          prefecture_id: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectGroup key={region.id}>
                            <SelectLabel>{region.name}</SelectLabel>
                            {region.prefecture.map((pref) => (
                              <SelectItem
                                key={pref.id}
                                value={String(pref.id)}
                              >
                                {pref.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    getPrefectureName(theater.prefecture_id)
                  )}
                </TableCell>
                <TableCell>
                  {editingId === theater.id ? (
                    <>
                      <Button onClick={handleSave} className="mr-2">
                        保存
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        キャンセル
                      </Button>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => handleEdit(theater)}>編集</Button>
                      <Button
                        onClick={() =>
                          router.push(`/maintenances/${theater.id}`)
                        }
                      >
                        詳細
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TheaterMaintenance;
