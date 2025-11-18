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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with decorative elements */}
          <div className="relative mb-8">
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl"></div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl"></div>
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent mb-2">
                    {t("community.title")}
                  </h1>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    {t("community.description")}
                  </p>
                </div>
                <Button 
                  onClick={handleNewPost}
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-6"
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
                  className="pl-12 rounded-full border-primary/20 focus:border-primary focus:ring-primary"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={selectedCategory === "all" ? "secondary" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  className={`cursor-pointer transition-colors rounded-full px-4 py-1 ${
                    selectedCategory === "all" 
                      ? "bg-primary/10 text-primary border-primary/20" 
                      : "hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                  }`}
                >
                  {t("community.categories.all")}
                </Badge>
                <Badge 
                  variant={selectedCategory === "herbs" ? "secondary" : "outline"}
                  onClick={() => setSelectedCategory("herbs")}
                  className={`cursor-pointer transition-colors rounded-full px-4 py-1 ${
                    selectedCategory === "herbs" 
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                      : "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                  }`}
                >
                  {t("community.tags.herbs")}
                </Badge>
                <Badge 
                  variant={selectedCategory === "elderly" ? "secondary" : "outline"}
                  onClick={() => setSelectedCategory("elderly")}
                  className={`cursor-pointer transition-colors rounded-full px-4 py-1 ${
                    selectedCategory === "elderly" 
                      ? "bg-teal-100 text-teal-700 border-teal-200" 
                      : "hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
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
                      : "hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                  }`}
                >
                  {t("community.tags.caregiving")}
                </Badge>
                <Badge 
                  variant={selectedCategory === "health" ? "secondary" : "outline"}
                  onClick={() => setSelectedCategory("health")}
                  className={`cursor-pointer transition-colors rounded-full px-4 py-1 ${
                    selectedCategory === "health" 
                      ? "bg-lime-100 text-lime-700 border-lime-200" 
                      : "hover:bg-lime-50 hover:text-lime-700 hover:border-lime-300"
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
            <div className="lg:col-span-2 bg-gradient-to-br from-primary/5 to-emerald-50/50 rounded-3xl p-6 border border-primary/20">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Pin className="h-5 w-5 text-primary" />
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
                      <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
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
            <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-3xl p-6 border border-emerald-200/50">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Flame className="h-5 w-5 text-emerald-600" />
                {t("community.trendingTopics")}
              </h2>
              <div className="space-y-3">
                {trendingPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    to={`/community/${post.id}`}
                    className="flex gap-3 items-start p-2 hover:bg-white/50 rounded-xl transition-all group"
                  >
                    <span className="text-2xl font-bold text-emerald-400/50">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
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
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-primary/20 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-primary/10 to-emerald-100/50 px-6 py-4 border-b border-primary/20">
              <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-muted-foreground">
                <div className="col-span-7 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {t("community.topics")}
                </div>
                <div className="col-span-2 text-center hidden md:block">{t("community.author")}</div>
                <div className="col-span-2 text-center hidden md:block">{t("community.stats")}</div>
                <div className="col-span-1 text-center hidden lg:block">{t("community.activity")}</div>
              </div>
            </div>

            {/* Posts List */}
            <div className="divide-y divide-primary/10">
              {filteredPosts.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary/30" />
                  <p className="text-lg">{t("community.noResults")}</p>
                  <p className="text-sm">{t("community.tryDifferentSearch")}</p>
                </div>
              ) : (
                filteredPosts.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/community/${post.id}`}
                  className="block px-6 py-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-emerald-50/50 transition-all duration-200 group"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Topic Info */}
                    <div className="col-span-12 md:col-span-7 flex gap-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={post.thumbnail}
                          alt={t(post.titleKey)}
                          className="w-16 h-16 rounded-2xl object-cover shadow-sm border-2 border-white group-hover:border-primary/30 transition-all"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center border-2 border-primary/20">
                          <MessageSquare className="h-3 w-3 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge 
                          variant="secondary" 
                          className="mb-2 text-xs rounded-full px-3 py-0.5 bg-gradient-to-r from-primary/10 to-emerald-100 text-primary border-primary/20"
                        >
                          {t(post.tagKey)}
                        </Badge>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
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
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-emerald-200 text-primary">
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
                        <Calendar className="h-3 w-3 text-primary" />
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
