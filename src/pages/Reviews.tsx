import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, MessageCircle, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { reviews as staticReviews } from "@/data/reviews";
import { avatarImages } from "@/assets/avatars";

interface Review {
  id: string;
  author_name: string;
  author_avatar: string | null;
  rating: number;
  comment: string;
  created_at: string;
  admin_reply: string | null;
  admin_reply_at: string | null;
  admin_reply_by: string | null;
  likes_count: number;
}

interface ReviewLike {
  review_id: string;
  user_id: string;
}

const Reviews = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const currentLanguage = i18n.language as "th" | "en" | "zh";
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({ id: user.id, email: user.email || "" });
      }
    });
  }, []);

  const { data: dbReviews, refetch: refetchReviews } = useQuery({
    queryKey: ["approved-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });

  const { data: userLikes } = useQuery({
    queryKey: ["user-review-likes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("review_likes")
        .select("review_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map((l) => l.review_id);
    },
    enabled: !!user,
  });

  const likeMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) throw new Error("กรุณาเข้าสู่ระบบก่อน");

      const isLiked = userLikes?.includes(reviewId);
      const currentReview = dbReviews?.find((r) => r.id === reviewId);
      const currentLikes = currentReview?.likes_count || 0;

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from("review_likes")
          .delete()
          .eq("review_id", reviewId)
          .eq("user_id", user.id);
        if (error) throw error;

        // Decrease likes_count
        await supabase
          .from("reviews")
          .update({ likes_count: Math.max(0, currentLikes - 1) })
          .eq("id", reviewId);
      } else {
        // Like
        const { error } = await supabase
          .from("review_likes")
          .insert({ review_id: reviewId, user_id: user.id });
        if (error) throw error;

        // Increase likes_count
        await supabase
          .from("reviews")
          .update({ likes_count: currentLikes + 1 })
          .eq("id", reviewId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approved-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["user-review-likes"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("กรุณาเข้าสู่ระบบก่อน");
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const authorName = profile?.full_name || user.email.split("@")[0];

      const { data: reviewData, error } = await supabase.from("reviews").insert({
        user_id: user.id,
        rating: newRating,
        comment: newComment,
        author_name: authorName,
        is_approved: false,
      }).select().single();
      
      if (error) throw error;

      // Send admin notification
      try {
        await supabase.functions.invoke("send-admin-notification", {
          body: {
            type: "new_review",
            data: {
              review_id: reviewData.id,
              author_name: authorName,
              rating: newRating,
              comment: newComment,
            },
          },
        });
      } catch (notifyError) {
        console.error("Failed to send notification:", notifyError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approved-reviews"] });
      toast.success("ส่งรีวิวเรียบร้อย รอการอนุมัติจากแอดมิน");
      setIsDialogOpen(false);
      setNewRating(5);
      setNewComment("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const renderStars = (rating: number, interactive = false, onRate?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
            } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
            onClick={() => interactive && onRate && onRate(index + 1)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{t("sections.customerReviews")} - JWHERBAL</title>
        <meta
          name="description"
          content={t("sections.customerReviews")}
        />
      </Helmet>
      
      <Navbar />

      <main className="flex-1">
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                {t("sections.customerReviews")}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                {currentLanguage === "th"
                  ? "ประสบการณ์จริงจากผู้ใช้ V Flow Herbal Drink ที่ได้รับความไว้วางใจจากลูกค้ามากมาย"
                  : currentLanguage === "en"
                  ? "Real experiences from V Flow Herbal Drink users who trust our products"
                  : "来自V Flow草本饮料用户的真实体验，深受众多客户信赖"}
              </p>

              {user ? (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>เขียนรีวิว</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>เขียนรีวิวของคุณ</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>ให้คะแนน</Label>
                        <div className="mt-2">
                          {renderStars(newRating, true, setNewRating)}
                        </div>
                      </div>
                      <div>
                        <Label>ความคิดเห็น</Label>
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="แบ่งปันประสบการณ์ของคุณ..."
                          className="mt-2"
                          rows={4}
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => submitMutation.mutate()}
                        disabled={submitMutation.isPending || !newComment.trim()}
                      >
                        {submitMutation.isPending ? "กำลังส่ง..." : "ส่งรีวิว"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button variant="outline" onClick={() => window.location.href = "/auth"}>
                  เข้าสู่ระบบเพื่อเขียนรีวิว
                </Button>
              )}
            </div>

            {/* Database reviews */}
            {dbReviews && dbReviews.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6 text-center">รีวิวล่าสุด</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dbReviews.map((review) => (
                    <Card
                      key={review.id}
                      className="rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          {review.author_avatar ? (
                            <img
                              src={avatarImages[review.author_avatar] || review.author_avatar}
                              alt={review.author_name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-border"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                              {review.author_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">
                              {review.author_name}
                            </h3>
                            <div className="mt-1">{renderStars(review.rating)}</div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {review.comment}
                        </p>

                        {/* Like Button */}
                        <div className="mt-4 flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`gap-1.5 ${userLikes?.includes(review.id) ? "text-red-500" : "text-muted-foreground"}`}
                            onClick={() => {
                              if (!user) {
                                toast.error("กรุณาเข้าสู่ระบบเพื่อกดถูกใจ");
                                return;
                              }
                              likeMutation.mutate(review.id);
                            }}
                            disabled={likeMutation.isPending}
                          >
                            <Heart
                              className={`h-4 w-4 ${userLikes?.includes(review.id) ? "fill-current" : ""}`}
                            />
                            <span>{review.likes_count || 0}</span>
                          </Button>
                        </div>
                        
                        {/* Admin Reply */}
                        {review.admin_reply && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageCircle className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-primary">ตอบกลับจากทีมงาน</span>
                            </div>
                            <p className="text-sm text-foreground bg-primary/5 p-3 rounded-lg">
                              {review.admin_reply}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Static reviews */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staticReviews.map((review) => (
                <Card
                  key={review.id}
                  className="rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <img
                        src={review.avatarUrl}
                        alt={review.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-border"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {review.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {review.age}{" "}
                          {currentLanguage === "th"
                            ? "ปี"
                            : currentLanguage === "en"
                            ? "years old"
                            : "岁"}{" "}
                          • {review.occupation[currentLanguage]}
                        </p>
                        <div className="mt-1">{renderStars(review.rating)}</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.review[currentLanguage]}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Reviews;
