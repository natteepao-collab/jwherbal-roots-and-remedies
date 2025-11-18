import { Link } from "react-router-dom";
import { Calendar, MessageSquare, Eye, User, Plus, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50/30 via-white to-blue-50/30">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with decorative elements */}
          <div className="relative mb-8">
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-pink-200/30 rounded-full blur-2xl"></div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-pink-100/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {t("community.title")}
                  </h1>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-pink-400" />
                    {t("community.description")}
                  </p>
                </div>
                <Button 
                  onClick={handleNewPost}
                  className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("community.newPost")}
                </Button>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="cursor-pointer bg-pink-100 hover:bg-pink-200 text-pink-700 border-pink-200 transition-colors rounded-full px-4 py-1">
                  {t("community.categories.all")}
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-purple-100 hover:text-purple-700 hover:border-purple-300 transition-colors rounded-full px-4 py-1">
                  {t("community.tags.herbs")}
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300 transition-colors rounded-full px-4 py-1">
                  {t("community.tags.elderly")}
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-green-100 hover:text-green-700 hover:border-green-300 transition-colors rounded-full px-4 py-1">
                  {t("community.tags.caregiving")}
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-amber-100 hover:text-amber-700 hover:border-amber-300 transition-colors rounded-full px-4 py-1">
                  {t("community.tags.health")}
                </Badge>
              </div>
            </div>
          </div>

          {/* Forum Board Style */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-pink-100/50 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-pink-100/50 to-purple-100/50 px-6 py-4 border-b border-pink-200/50">
              <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-muted-foreground">
                <div className="col-span-7 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-pink-400" />
                  {t("community.topics")}
                </div>
                <div className="col-span-2 text-center hidden md:block">{t("community.author")}</div>
                <div className="col-span-2 text-center hidden md:block">{t("community.stats")}</div>
                <div className="col-span-1 text-center hidden lg:block">{t("community.activity")}</div>
              </div>
            </div>

            {/* Posts List */}
            <div className="divide-y divide-pink-100/30">
              {communityPostsData.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/community/${post.id}`}
                  className="block px-6 py-4 hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-purple-50/50 transition-all duration-200 group"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Topic Info */}
                    <div className="col-span-12 md:col-span-7 flex gap-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={post.thumbnail}
                          alt={t(post.titleKey)}
                          className="w-16 h-16 rounded-2xl object-cover shadow-sm border-2 border-white group-hover:border-pink-200 transition-all"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center border-2 border-pink-200">
                          <MessageSquare className="h-3 w-3 text-pink-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge 
                          variant="secondary" 
                          className="mb-2 text-xs rounded-full px-3 py-0.5 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-pink-200"
                        >
                          {t(post.tagKey)}
                        </Badge>
                        <h3 className="font-semibold text-foreground group-hover:text-pink-600 transition-colors line-clamp-1 mb-1">
                          {t(post.titleKey)}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {t(post.previewKey)}
                        </p>
                      </div>
                    </div>

                    {/* Author */}
                    <div className="col-span-6 md:col-span-2 flex items-center justify-center gap-2">
                      <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                        <AvatarImage src={post.authorAvatar} alt={t(post.authorNameKey)} />
                        <AvatarFallback className="bg-gradient-to-br from-pink-200 to-purple-200 text-pink-700">
                          {t(post.authorNameKey).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate hidden md:block">
                        {t(post.authorNameKey)}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="col-span-6 md:col-span-2 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-blue-400" />
                        <span className="hidden sm:inline">{Math.floor(Math.random() * 500) + 50}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-green-400" />
                        <span>{Math.floor(Math.random() * 30) + 1}</span>
                      </div>
                    </div>

                    {/* Activity */}
                    <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 text-purple-400" />
                        <span>{formatDate(post.createdAt).split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Community;
