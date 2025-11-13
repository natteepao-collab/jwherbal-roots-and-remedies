import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { communityPostsData } from "@/data/communityPosts";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Community = () => {
  const { t } = useTranslation();

  const handleNewPost = () => {
    toast.info(t("community.loginToPost"));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(t("community.locale"), {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">{t("community.title")}</h1>
              <p className="text-muted-foreground">
                {t("community.description")}
              </p>
            </div>
            <Button onClick={handleNewPost}>{t("community.newPost")}</Button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              {t("community.categories.all")}
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              {t("community.tags.herbs")}
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              {t("community.tags.elderly")}
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              {t("community.tags.caregiving")}
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              {t("community.tags.health")}
            </Badge>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityPostsData.map((post) => (
              <Card key={post.id} className="hover:shadow-card-hover transition-shadow overflow-hidden">
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={post.thumbnail} 
                    alt={t(post.titleKey)}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-3">
                    {t(post.tagKey)}
                  </Badge>
                  <h2 className="text-xl font-semibold mb-3 line-clamp-2">
                    <Link
                      to={`/community/${post.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {t(post.titleKey)}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {t(post.previewKey)}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.authorAvatar} alt={t(post.authorNameKey)} />
                        <AvatarFallback>{t(post.authorNameKey).charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{t(post.authorNameKey)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.createdAt)}</span>
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
