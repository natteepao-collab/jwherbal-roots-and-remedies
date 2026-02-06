import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, MessageCircle, Heart, Quote, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ReviewImageCarousel from "@/components/ReviewImageCarousel";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { reviews as staticReviews } from "@/data/reviews";

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

const INITIAL_DISPLAY_COUNT = 1;

const Reviews = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const currentLanguage = i18n.language as "th" | "en" | "zh";
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [showAllDbReviews, setShowAllDbReviews] = useState(false);
  const [showAllStaticReviews, setShowAllStaticReviews] = useState(false);

  useEffect(() => {
    const checkUserAndRole = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email || "" });
        
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", authUser.id)
          .eq("role", "admin");
        
        setIsAdmin(roles && roles.length > 0);
      }
    };
    checkUserAndRole();
  }, []);

  const { data: dbReviews } = useQuery({
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
        const { error } = await supabase
          .from("review_likes")
          .delete()
          .eq("review_id", reviewId)
          .eq("user_id", user.id);
        if (error) throw error;

        await supabase
          .from("reviews")
          .update({ likes_count: Math.max(0, currentLikes - 1) })
          .eq("id", reviewId);
      } else {
        const { error } = await supabase
          .from("review_likes")
          .insert({ review_id: reviewId, user_id: user.id });
        if (error) throw error;

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

  const renderStars = (rating: number, interactive = false, onRate?: (r: number) => void, size: "sm" | "md" | "lg" = "sm") => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };
    
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`${sizeClasses[size]} ${
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Determine displayed reviews
  const displayedDbReviews = showAllDbReviews 
    ? dbReviews 
    : dbReviews?.slice(0, INITIAL_DISPLAY_COUNT);
  
  const displayedStaticReviews = showAllStaticReviews 
    ? staticReviews 
    : staticReviews.slice(0, INITIAL_DISPLAY_COUNT);

  const hasMoreDbReviews = dbReviews && dbReviews.length > INITIAL_DISPLAY_COUNT;
  const hasMoreStaticReviews = staticReviews.length > INITIAL_DISPLAY_COUNT;

  return (
    <PageTransition>
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-secondary/30 via-background to-secondary/20">
      <Helmet>
        <title>{t("sections.customerReviews")} - JWHERBAL</title>
        <meta name="description" content={t("sections.customerReviews")} />
      </Helmet>
      
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-20 overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Header */}
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                {currentLanguage === "th" ? "เสียงจากลูกค้าจริง" : currentLanguage === "en" ? "Real Customer Voices" : "真实客户反馈"}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                {t("sections.customerReviews")}
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                {currentLanguage === "th"
                  ? "ประสบการณ์จริงจากผู้ใช้ V Flow Herbal Drink ที่ได้รับความไว้วางใจจากลูกค้ามากมาย"
                  : currentLanguage === "en"
                  ? "Real experiences from V Flow Herbal Drink users who trust our products"
                  : "来自V Flow草本饮料用户的真实体验，深受众多客户信赖"}
              </p>

              {user ? (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl transition-shadow">
                      <Star className="h-4 w-4 mr-2" />
                      {currentLanguage === "th" ? "เขียนรีวิว" : currentLanguage === "en" ? "Write a Review" : "写评论"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        {currentLanguage === "th" ? "แบ่งปันประสบการณ์ของคุณ" : currentLanguage === "en" ? "Share Your Experience" : "分享您的体验"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="text-center">
                        <Label className="text-muted-foreground">
                          {currentLanguage === "th" ? "ให้คะแนนความพึงพอใจ" : currentLanguage === "en" ? "Rate your satisfaction" : "评分"}
                        </Label>
                        <div className="mt-3 flex justify-center">
                          {renderStars(newRating, true, setNewRating, "lg")}
                        </div>
                      </div>
                      <div>
                        <Label>
                          {currentLanguage === "th" ? "ความคิดเห็นของคุณ" : currentLanguage === "en" ? "Your comment" : "您的评论"}
                        </Label>
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder={currentLanguage === "th" ? "แบ่งปันประสบการณ์การใช้ผลิตภัณฑ์..." : "Share your experience..."}
                          className="mt-2 min-h-[120px]"
                        />
                      </div>
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => submitMutation.mutate()}
                        disabled={submitMutation.isPending || !newComment.trim()}
                      >
                        {submitMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                            {currentLanguage === "th" ? "กำลังส่ง..." : "Sending..."}
                          </>
                        ) : (
                          currentLanguage === "th" ? "ส่งรีวิว" : currentLanguage === "en" ? "Submit Review" : "提交评论"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full px-8"
                  onClick={() => window.location.href = "/auth"}
                >
                  {currentLanguage === "th" ? "เข้าสู่ระบบเพื่อเขียนรีวิว" : currentLanguage === "en" ? "Login to write a review" : "登录以撰写评论"}
                </Button>
              )}
            </div>

            {/* Review Image Carousel */}
            <div className="mb-16">
              <ReviewImageCarousel isAdmin={isAdmin} />
            </div>

            {/* Database Reviews */}
            {dbReviews && dbReviews.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border max-w-[100px]" />
                  <h2 className="text-2xl font-semibold text-center">
                    {currentLanguage === "th" ? "รีวิวล่าสุด" : currentLanguage === "en" ? "Latest Reviews" : "最新评论"}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border max-w-[100px]" />
                </div>
                
                <div className={`grid gap-6 ${displayedDbReviews && displayedDbReviews.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                  {displayedDbReviews?.map((review) => (
                    <Card
                      key={review.id}
                      className={`group relative overflow-hidden rounded-2xl border-0 bg-card/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${displayedDbReviews.length === 1 ? 'p-2' : ''}`}
                    >
                      <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Quote className="h-12 w-12 text-primary" />
                      </div>
                      
                      <CardContent className={`p-6 ${displayedDbReviews.length === 1 ? 'p-8' : 'p-6'}`}>
                        <div className="flex items-start gap-4 mb-4">
                          {review.author_avatar ? (
                            <img
                              src={review.author_avatar}
                              alt={review.author_name}
                              className={`rounded-full object-cover border-2 border-primary/20 shadow-md ${displayedDbReviews.length === 1 ? 'w-16 h-16' : 'w-14 h-14'}`}
                            />
                          ) : (
                            <div className={`rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold shadow-md ${displayedDbReviews.length === 1 ? 'w-16 h-16 text-xl' : 'w-14 h-14 text-lg'}`}>
                              {review.author_name.split(' ')[0].charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className={`font-semibold text-foreground ${displayedDbReviews.length === 1 ? 'text-xl' : 'text-lg'}`}>
                              {/* Parse name - extract just the name part before parenthesis */}
                              {review.author_name.includes('(') 
                                ? review.author_name.split('(')[0].trim()
                                : review.author_name}
                            </h3>
                            {review.author_name.includes('(') && (
                              <p className="text-sm text-muted-foreground">
                                {review.author_name.match(/\(([^)]+)\)/)?.[1]}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {renderStars(review.rating)}
                              <span className="text-xs text-muted-foreground">
                                {formatDate(review.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <p className={`text-muted-foreground leading-relaxed mb-4 ${displayedDbReviews.length === 1 ? 'text-base' : 'line-clamp-4'}`}>
                          {review.comment}
                        </p>

                        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`gap-1.5 rounded-full ${userLikes?.includes(review.id) ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"}`}
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
                              className={`h-4 w-4 transition-transform ${userLikes?.includes(review.id) ? "fill-current scale-110" : ""}`}
                            />
                            <span className="text-sm">{review.likes_count || 0}</span>
                          </Button>
                        </div>
                        
                        {review.admin_reply && (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <MessageCircle className="h-3 w-3 text-primary-foreground" />
                              </div>
                              <span className="text-sm font-medium text-primary">ตอบกลับจากทีมงาน V Flow</span>
                            </div>
                            <p className="text-sm text-foreground bg-primary/5 p-3 rounded-xl border border-primary/10">
                              {review.admin_reply}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Show More/Less Button for DB Reviews */}
                {hasMoreDbReviews && (
                  <div className="flex justify-center mt-8">
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-full px-8 gap-2"
                      onClick={() => setShowAllDbReviews(!showAllDbReviews)}
                    >
                      {showAllDbReviews ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          {currentLanguage === "th" ? "แสดงน้อยลง" : currentLanguage === "en" ? "Show Less" : "显示更少"}
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          {currentLanguage === "th" 
                            ? `ดูเพิ่มเติม (${dbReviews.length - INITIAL_DISPLAY_COUNT} รีวิว)` 
                            : currentLanguage === "en" 
                            ? `Show More (${dbReviews.length - INITIAL_DISPLAY_COUNT} reviews)` 
                            : `显示更多 (${dbReviews.length - INITIAL_DISPLAY_COUNT} 条评论)`}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Static Reviews */}
            <div>
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border max-w-[100px]" />
                <h2 className="text-2xl font-semibold text-center">
                  {currentLanguage === "th" ? "รีวิวจากลูกค้า" : currentLanguage === "en" ? "Customer Reviews" : "客户评论"}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border max-w-[100px]" />
              </div>
              
              <div className={`grid gap-6 ${displayedStaticReviews.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {displayedStaticReviews.map((review) => (
                  <Card
                    key={review.id}
                    className={`group relative overflow-hidden rounded-2xl border-0 bg-card/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${displayedStaticReviews.length === 1 ? 'p-2' : ''}`}
                  >
                    <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Quote className="h-12 w-12 text-primary" />
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={review.avatarUrl}
                          alt={review.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 shadow-md bg-muted"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.nextElementSibling) {
                              (target.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 items-center justify-center text-primary font-bold text-lg shadow-md hidden">
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-lg">
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
                      <p className="text-muted-foreground leading-relaxed line-clamp-4">
                        {review.review[currentLanguage]}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Show More/Less Button for Static Reviews */}
              {hasMoreStaticReviews && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full px-8 gap-2"
                    onClick={() => setShowAllStaticReviews(!showAllStaticReviews)}
                  >
                    {showAllStaticReviews ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        {currentLanguage === "th" ? "แสดงน้อยลง" : currentLanguage === "en" ? "Show Less" : "显示更少"}
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        {currentLanguage === "th" 
                          ? `ดูเพิ่มเติม (${staticReviews.length - INITIAL_DISPLAY_COUNT} รีวิว)` 
                          : currentLanguage === "en" 
                          ? `Show More (${staticReviews.length - INITIAL_DISPLAY_COUNT} reviews)` 
                          : `显示更多 (${staticReviews.length - INITIAL_DISPLAY_COUNT} 条评论)`}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </PageTransition>
  );
};

export default Reviews;
