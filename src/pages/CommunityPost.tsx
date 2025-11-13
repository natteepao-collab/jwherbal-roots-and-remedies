import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, User as UserIcon, Calendar, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { communityPosts } from "@/data/community";
import { toast } from "sonner";

const CommunityPost = () => {
  const { id } = useParams();
  const post = communityPosts.find((p) => p.id === Number(id));

  if (!post) {
    return <Navigate to="/community" replace />;
  }

  const handleReply = () => {
    toast.info("กรุณาเข้าสู่ระบบเพื่อตอบกลับ");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/community">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับไปคอมมูนิตี้
            </Link>
          </Button>

          {/* Main Post */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <Badge variant="secondary" className="mb-4">{post.category}</Badge>
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b">
                <div className="flex items-center gap-1">
                  <UserIcon className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments} ความคิดเห็น</span>
                </div>
              </div>

              <div className="prose max-w-none whitespace-pre-wrap">
                {post.content}
              </div>
            </CardContent>
          </Card>

          {/* Replies */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">ความคิดเห็น ({post.replies.length})</h2>
            <div className="space-y-4">
              {post.replies.map((reply) => (
                <Card key={reply.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-4 w-4" />
                        <span className="font-medium text-foreground">{reply.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{reply.date}</span>
                      </div>
                    </div>
                    <p className="text-foreground">{reply.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Reply Form */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">แสดงความคิดเห็น</h3>
              <Textarea
                placeholder="พิมพ์ความคิดเห็นของคุณที่นี่..."
                className="mb-4"
                rows={4}
              />
              <Button onClick={handleReply}>ส่งความคิดเห็น</Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityPost;
