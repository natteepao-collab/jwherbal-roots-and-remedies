import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Check, X, Trash2, MessageSquare, User, Reply, Eye } from "lucide-react";
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
  admin_reply: string | null;
  admin_reply_at: string | null;
  admin_reply_by: string | null;
  products?: {
    name_th: string;
  } | null;
}

const AdminReviews = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

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

  const replyMutation = useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string }) => {
      const { data: session } = await supabase.auth.getSession();
      const adminEmail = session?.session?.user?.email || "Admin";
      
      const { error } = await supabase
        .from("reviews")
        .update({
          admin_reply: reply,
          admin_reply_at: new Date().toISOString(),
          admin_reply_by: adminEmail,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("ตอบกลับรีวิวเรียบร้อย");
      setIsReplyDialogOpen(false);
      setReplyText("");
      setSelectedReview(null);
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

  const handleOpenReply = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.admin_reply || "");
    setIsReplyDialogOpen(true);
  };

  const handleOpenView = (review: Review) => {
    setSelectedReview(review);
    setIsViewDialogOpen(true);
  };

  const handleSubmitReply = () => {
    if (!selectedReview || !replyText.trim()) {
      toast.error("กรุณาใส่ข้อความตอบกลับ");
      return;
    }
    replyMutation.mutate({ id: selectedReview.id, reply: replyText.trim() });
  };

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
        <p className="text-muted-foreground">อนุมัติ ตอบกลับ หรือลบรีวิวจากผู้ใช้</p>
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
                  <TableHead>ตอบกลับ</TableHead>
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
                    <TableCell className="max-w-xs">
                      <p className="truncate">{review.comment}</p>
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
                      {review.admin_reply ? (
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          ตอบกลับแล้ว
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                          ยังไม่ตอบกลับ
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenView(review)}
                          title="ดูรายละเอียด"
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenReply(review)}
                          title="ตอบกลับ"
                        >
                          <Reply className="h-4 w-4 text-primary" />
                        </Button>
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

      {/* View Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-prompt">รายละเอียดรีวิว</DialogTitle>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {selectedReview.author_avatar ? (
                  <img
                    src={avatarImages[selectedReview.author_avatar] || selectedReview.author_avatar}
                    alt={selectedReview.author_name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-semibold">{selectedReview.author_name}</p>
                  <div className="flex items-center gap-2">
                    {renderStars(selectedReview.rating)}
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(selectedReview.created_at), "d MMMM yyyy", { locale: th })}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">สินค้า</p>
                <p className="font-medium">{selectedReview.products?.name_th || "รีวิวทั่วไป"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">ความคิดเห็น</p>
                <p className="bg-muted p-3 rounded-lg">{selectedReview.comment}</p>
              </div>

              {selectedReview.admin_reply && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-1">การตอบกลับจากแอดมิน</p>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <p>{selectedReview.admin_reply}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      ตอบกลับโดย {selectedReview.admin_reply_by} เมื่อ{" "}
                      {selectedReview.admin_reply_at &&
                        format(new Date(selectedReview.admin_reply_at), "d MMMM yyyy HH:mm", { locale: th })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  ปิด
                </Button>
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  handleOpenReply(selectedReview);
                }}>
                  <Reply className="h-4 w-4 mr-2" />
                  {selectedReview.admin_reply ? "แก้ไขการตอบกลับ" : "ตอบกลับ"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-prompt">
              {selectedReview?.admin_reply ? "แก้ไขการตอบกลับ" : "ตอบกลับรีวิว"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium text-sm">{selectedReview.author_name}</p>
                  {renderStars(selectedReview.rating)}
                </div>
                <p className="text-sm">{selectedReview.comment}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">ข้อความตอบกลับ</p>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="พิมพ์ข้อความตอบกลับที่นี่..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsReplyDialogOpen(false);
                  setReplyText("");
                }}>
                  ยกเลิก
                </Button>
                <Button 
                  onClick={handleSubmitReply}
                  disabled={replyMutation.isPending || !replyText.trim()}
                >
                  {replyMutation.isPending ? "กำลังบันทึก..." : "บันทึกการตอบกลับ"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReviews;
