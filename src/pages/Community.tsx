import { Link } from "react-router-dom";
import { MessageSquare, User as UserIcon, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { communityPosts } from "@/data/community";
import { toast } from "sonner";

const Community = () => {
  const handleNewPost = () => {
    toast.info("กรุณาเข้าสู่ระบบเพื่อโพสต์กระทู้");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">คอมมูนิตี้</h1>
              <p className="text-muted-foreground">
                แลกเปลี่ยนประสบการณ์และความรู้เกี่ยวกับสมุนไพร
              </p>
            </div>
            <Button onClick={handleNewPost}>ตั้งกระทู้ใหม่</Button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              ทั้งหมด
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              ประสบการณ์
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              ถาม–ตอบ
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              ความรู้
            </Badge>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {communityPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-card-hover transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{post.category}</Badge>
                      </div>
                      <h2 className="text-xl font-semibold mb-3">
                        <Link
                          to={`/community/${post.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Community;
