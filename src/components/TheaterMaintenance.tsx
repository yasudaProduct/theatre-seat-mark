import React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Theater {
  id: number;
  name: string;
  address: string;
  url: string | null;
  prefecture_id: number;
}

const TheaterMaintenance = () => {
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

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>劇場名</TableHead>
              <TableHead>住所</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>都道府県ID</TableHead>
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
                    <Input
                      type="number"
                      value={editForm.prefecture_id}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          prefecture_id: parseInt(e.target.value),
                        })
                      }
                    />
                  ) : (
                    theater.prefecture_id
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
                    <Button onClick={() => handleEdit(theater)}>編集</Button>
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
