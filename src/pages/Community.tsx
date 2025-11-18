import { Link } from "react-router-dom";
import { Calendar, MessageSquare, Eye, User, Plus, TrendingUp, Search, Pin, Flame } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { communityPostsData } from "@/data/communityPosts";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";

const Community = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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

  // Pinned posts (top 3)
  const pinnedPosts = communityPostsData.slice(0, 3);

  // Trending posts (based on views/comments simulation)
  const trendingPosts = [...communityPostsData]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  // Filter and search posts
  const filteredPosts = useMemo(() => {
    return communityPostsData.filter((post) => {
      const matchesSearch = searchQuery === "" || 
        t(post.titleKey).toLowerCase().includes(searchQuery.toLowerCase()) ||
        t(post.previewKey).toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || 
        t(post.tagKey).toLowerCase() === t(`community.tags.${selectedCategory}`).toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, t]);

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

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("community.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 rounded-full border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={selectedCategory === "all" ? "secondary" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  className={`cursor-pointer transition-colors rounded-full px-4 py-1 ${
                    selectedCategory === "all" 
                      ? "bg-pink-100 text-pink-700 border-pink-200" 
                      : "hover:bg-pink-100 hover:text-pink-700 hover:border-pink-300"
                  }`}
                >
                  {t("community.categories.all")}
                </Badge>
                <Badge 
                  variant={selectedCategory === "herbs" ? "secondary" : "outline"}
                  onClick={() => setSelectedCategory("herbs")}
                  className={`cursor-pointer transition-colors rounded-full px-4 py-1 ${
                    selectedCategory === "herbs" 
                      ? "bg-purple-100 text-purple-700 border-purple-200" 
                      : "hover:bg-purple-100 hover:text-purple-700 hover:border-purple-300"
                  }`}
                >
                  {t("community.tags.herbs")}
                </Badge>
                <Badge 
                  variant={selectedCategory === "elderly" ? "secondary" : "outline"}
                  onClick={() => setSelectedCategory("elderly")}
                  className={`cursor-pointer transition-colors rounded-full px-4 py-1 ${
                    selectedCategory === "elderly" 
                      ? "bg-blue-100 text-blue-700 border-blue-200" 
                      : "hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300"
                  }`}
                >
                  {t("community.tags.elderly")}
                </Badge>
                <Badge 
                  variant={selectedCategory === "caregiving" ? "secondary" : "outline"}
                  onClick={() => setSelectedCategory("caregiving")}
                  className={`cursor-pointer transition-colors rounded-full px-4 py-1 ${
                    selectedCategory === "caregiving" 
                      ? "bg-green-100 text-green-700 border-green-200" 
                      : "hover:bg-green-100 hover:text-green-700 hover:border-green-300"
                  }`}
                >
                  {t("community.tags.caregiving")}
                </Badge>
                <Badge 
                  variant={selectedCategory === "health" ? "secondary" : "outline"}
                  onClick={() => setSelectedCategory("health")}
                  className={`cursor-pointer transition-colors rounded-full px-4 py-1 ${
                    selectedCategory === "health" 
                      ? "bg-amber-100 text-amber-700 border-amber-200" 
                      : "hover:bg-amber-100 hover:text-amber-700 hover:border-amber-300"
                  }`}
                >
                  {t("community.tags.health")}
                </Badge>
              </div>
            </div>
          </div>

          {/* Pinned & Trending Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Pinned Posts */}
            <div className="lg:col-span-2 bg-gradient-to-br from-pink-50/50 to-purple-50/50 rounded-3xl p-6 border border-pink-200/50">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Pin className="h-5 w-5 text-pink-500" />
                {t("community.pinnedPosts")}
              </h2>
              <div className="space-y-3">
                {pinnedPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/community/${post.id}`}
                    className="flex gap-3 p-3 bg-white/80 rounded-2xl hover:shadow-md transition-all group"
                  >
                    <img
                      src={post.thumbnail}
                      alt={t(post.titleKey)}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-pink-600 transition-colors">
                        {t(post.titleKey)}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {t(post.previewKey)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-3xl p-6 border border-amber-200/50">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                {t("community.trendingTopics")}
              </h2>
              <div className="space-y-3">
                {trendingPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    to={`/community/${post.id}`}
                    className="flex gap-3 items-start p-2 hover:bg-white/50 rounded-xl transition-all group"
                  >
                    <span className="text-2xl font-bold text-orange-400/50">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {t(post.titleKey)}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{Math.floor(Math.random() * 500) + 50}</span>
                        <MessageSquare className="h-3 w-3 ml-2" />
                        <span>{Math.floor(Math.random() * 30) + 1}</span>
                      </div>
                    </div>
                  </Link>
                ))}
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
              {filteredPosts.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-pink-300" />
                  <p className="text-lg">{t("community.noResults")}</p>
                  <p className="text-sm">{t("community.tryDifferentSearch")}</p>
                </div>
              ) : (
                filteredPosts.map((post, index) => (
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
              ))
            )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Community;
