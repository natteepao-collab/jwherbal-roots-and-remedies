import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, Check, X, Trash2, MessageSquare, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { avatarImages } from "@/assets/avatars";

interface Review {
  id: string;
  user_id: string;
  product_id: string | null;
  rating: number;
  comment: string;
  author_name: string;
  author_avatar: string | null;
  is_approved: boolean;
  created_at: string;
  products?: {
    name_th: string;
  } | null;
}

const AdminReviews = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin-reviews", filter],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select("*, products(name_th)")
        .order("created_at", { ascending: false });

      if (filter === "pending") {
        query = query.eq("is_approved", false);
      } else if (filter === "approved") {
        query = query.eq("is_approved", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Review[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      const { error } = await supabase
        .from("reviews")
        .update({ is_approved: approve })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("อัปเดตสถานะรีวิวเรียบร้อย");
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("ลบรีวิวเรียบร้อย");
    },
    onError: (error) => {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    },
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  const pendingCount = reviews?.filter((r) => !r.is_approved).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">จัดการรีวิว</h1>
        <p className="text-muted-foreground">อนุมัติหรือลบรีวิวจากผู้ใช้</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          ทั้งหมด ({reviews?.length || 0})
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
        >
          รอตรวจสอบ ({pendingCount})
        </Button>
        <Button
          variant={filter === "approved" ? "default" : "outline"}
          onClick={() => setFilter("approved")}
        >
          อนุมัติแล้ว ({(reviews?.length || 0) - pendingCount})
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            รายการรีวิว
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>กำลังโหลด...</p>
          ) : reviews?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              ยังไม่มีรีวิว
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ผู้รีวิว</TableHead>
                  <TableHead>สินค้า</TableHead>
                  <TableHead>คะแนน</TableHead>
                  <TableHead>ความคิดเห็น</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews?.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {review.author_avatar ? (
                          <img
                            src={avatarImages[review.author_avatar] || review.author_avatar}
                            alt={review.author_name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium">{review.author_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {review.products?.name_th || "ทั่วไป"}
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {review.comment}
                    </TableCell>
                    <TableCell>
                      {format(new Date(review.created_at), "d MMM yyyy", {
                        locale: th,
                      })}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          review.is_approved
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {review.is_approved ? "อนุมัติแล้ว" : "รอตรวจสอบ"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!review.is_approved && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              approveMutation.mutate({
                                id: review.id,
                                approve: true,
                              })
                            }
                            title="อนุมัติ"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {review.is_approved && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              approveMutation.mutate({
                                id: review.id,
                                approve: false,
                              })
                            }
                            title="ยกเลิกอนุมัติ"
                          >
                            <X className="h-4 w-4 text-orange-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(review.id)}
                          title="ลบ"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReviews;
