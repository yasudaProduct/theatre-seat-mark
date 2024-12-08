import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
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

interface Screen {
  id: number;
  name: string;
  theater_id: number;
}

export const ScreenMaintenance = () => {
  const router = useRouter();
  const { id: theaterId } = router.query;
  const [screens, setScreens] = useState<Screen[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Screen>({
    id: 0,
    name: "",
    theater_id: 0,
  });
  const [newScreen, setNewScreen] = useState<Omit<Screen, "id">>({
    name: "",
    theater_id: Number(theaterId),
  });
  const [screenSeats, setScreenSeats] = useState<{
    [key: number]: { rows: number; columns: number };
  }>({});

  useEffect(() => {
    if (theaterId) {
      fetchScreens();
    }
  }, [theaterId]);

  const fetchScreens = async () => {
    try {
      const response = await fetch(`/api/screens?theaterId=${theaterId}`);
      if (response.ok) {
        const data = await response.json();
        setScreens(data);
      }
    } catch {
      toast.error("スクリーン情報の取得に失敗しました");
    }
  };

  const handleEdit = (screen: Screen) => {
    setEditingId(screen.id);
    setEditForm(screen);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/screens/${editForm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast.success("更新しました");
        setEditingId(null);
        fetchScreens();
      }
    } catch {
      toast.error("更新に失敗しました");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("本当に削除しますか？")) return;

    try {
      const response = await fetch(`/api/screens/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("削除しました");
        fetchScreens();
      }
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  const handleAdd = async () => {
    try {
      const response = await fetch("/api/screens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theaterId: newScreen.theater_id,
          name: newScreen.name,
        }),
      });

      if (response.ok) {
        toast.success("スクリーンを追加しました");
        setNewScreen({ ...newScreen, name: "" });
        fetchScreens();
      }
    } catch {
      toast.error("スクリーンの追加に失敗しました");
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-4">スクリーン管理</h2>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="スクリーン名"
              value={newScreen.name}
              onChange={(e) =>
                setNewScreen({ ...newScreen, name: e.target.value })
              }
            />
            <Button onClick={handleAdd}>追加</Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>スクリーン名</TableHead>
              <TableHead>座席設定</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {screens.map((screen) => (
              <TableRow key={screen.id}>
                <TableCell>{screen.id}</TableCell>
                <TableCell>
                  {editingId === screen.id ? (
                    <Input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                    />
                  ) : (
                    screen.name
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="行数"
                      className="w-20"
                      onChange={(e) => {
                        const rows = parseInt(e.target.value);
                        setScreenSeats((prev) => ({
                          ...prev,
                          [screen.id]: { ...prev[screen.id], rows },
                        }));
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="列数"
                      className="w-20"
                      onChange={(e) => {
                        const columns = parseInt(e.target.value);
                        setScreenSeats((prev) => ({
                          ...prev,
                          [screen.id]: { ...prev[screen.id], columns },
                        }));
                      }}
                    />
                    <Button
                      onClick={async () => {
                        try {
                          const seats = screenSeats[screen.id];
                          if (!seats?.rows || !seats?.columns) {
                            toast.error("行数と列数を入力してください");
                            return;
                          }

                          const response = await fetch("/api/seats/generate", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              screenId: screen.id,
                              rows: seats.rows,
                              columns: seats.columns,
                            }),
                          });

                          if (response.ok) {
                            toast.success("座席を生成しました");
                          }
                        } catch {
                          toast.error("座席の生成に失敗しました");
                        }
                      }}
                    >
                      座席生成
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {editingId === screen.id ? (
                    <Button onClick={handleSave}>保存</Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => handleEdit(screen)}>編集</Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(screen.id)}
                      >
                        削除
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

export default ScreenMaintenance;
