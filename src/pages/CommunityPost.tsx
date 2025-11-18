import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, User as UserIcon, Calendar, MessageSquare, Heart, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { communityPosts } from "@/data/community";
import { toast } from "sonner";
import { useState } from "react";

const CommunityPost = () => {
  const { id } = useParams();
  const post = communityPosts.find((p) => p.id === Number(id));
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState("");

  if (!post) {
    return <Navigate to="/community" replace />;
  }

  const handleReply = () => {
    if (!comment.trim()) {
      toast.error("กรุณาใส่ความคิดเห็น");
      return;
    }
    toast.success("ส่งความคิดเห็นสำเร็จ!");
    setComment("");
  };

  const handleLike = () => {
    setLiked(!liked);
    toast.success(liked ? "ยกเลิกถูกใจ" : "ถูกใจแล้ว!");
  };

  const handleShare = () => {
    toast.success("คัดลอกลิงก์แล้ว!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            asChild 
            className="mb-6 hover:bg-primary/10 rounded-full"
          >
            <Link to="/community">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับไปคอมมูนิตี้
            </Link>
          </Button>

          {/* Main Post */}
          <Card className="mb-6 bg-white/80 backdrop-blur-sm border-primary/20 shadow-lg rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              {/* Category Badge */}
              <Badge 
                variant="secondary" 
                className="mb-4 bg-gradient-to-r from-primary/10 to-emerald-100 text-primary border-primary/20 rounded-full px-4 py-1"
              >
                {post.category}
              </Badge>

              {/* Title */}
              <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                {post.title}
              </h1>
              
              {/* Author Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-primary/20">
                <Avatar className="h-12 w-12 border-2 border-primary/30">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-emerald-200">
                    {post.author.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{post.author}</div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{post.comments} ความคิดเห็น</span>
                    </div>
                  </div>
                </div>

                {/* Like & Share Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLike}
                    className={`rounded-full transition-all ${
                      liked 
                        ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20" 
                        : "hover:bg-primary/5"
                    }`}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${liked ? "fill-primary" : ""}`} />
                    {liked ? "ถูกใจแล้ว" : "ถูกใจ"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="rounded-full hover:bg-emerald-50"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    แชร์
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="prose max-w-none whitespace-pre-wrap text-foreground leading-relaxed">
                {post.content}
              </div>
            </CardContent>
          </Card>

          {/* Replies */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              ความคิดเห็น ({post.replies.length})
            </h2>
            <div className="space-y-4">
              {post.replies.map((reply) => (
                <Card 
                  key={reply.id}
                  className="bg-white/60 backdrop-blur-sm border-primary/20 rounded-2xl hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10 border-2 border-primary/30">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author}`} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-emerald-200">
                          {reply.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-foreground">{reply.author}</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{reply.date}</span>
                          </div>
                        </div>
                        <p className="text-foreground leading-relaxed">{reply.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Reply Form */}
          <Card className="bg-gradient-to-br from-primary/5 to-emerald-50/50 backdrop-blur-sm border-primary/20 rounded-3xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                แสดงความคิดเห็น
              </h3>
              <Textarea
                placeholder="พิมพ์ความคิดเห็นของคุณที่นี่..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-4 rounded-2xl border-primary/20 focus:border-primary focus:ring-primary bg-white/80"
                rows={4}
              />
              <Button 
                onClick={handleReply}
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                ส่งความคิดเห็น
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityPost;
