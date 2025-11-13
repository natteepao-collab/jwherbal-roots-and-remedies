import { useState, useEffect } from "react";
import { Heart, Share2, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface ArticleLikeShareProps {
  articleId: number;
  articleTitle: string;
  articleUrl: string;
  initialLikes?: number;
}

const ArticleLikeShare = ({
  articleId,
  articleTitle,
  articleUrl,
  initialLikes = 0,
}: ArticleLikeShareProps) => {
  const { t } = useTranslation();
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);

  // Load like status from localStorage
  useEffect(() => {
    const likedArticles = JSON.parse(localStorage.getItem("likedArticles") || "{}");
    const articleLikes = parseInt(localStorage.getItem(`article_${articleId}_likes`) || "0");
    
    setHasLiked(likedArticles[articleId] === true);
    if (articleLikes > 0) {
      setLikes(articleLikes);
    }
  }, [articleId]);

  const handleLike = () => {
    const likedArticles = JSON.parse(localStorage.getItem("likedArticles") || "{}");
    
    if (hasLiked) {
      // Unlike
      const newLikes = Math.max(0, likes - 1);
      setLikes(newLikes);
      setHasLiked(false);
      likedArticles[articleId] = false;
      localStorage.setItem(`article_${articleId}_likes`, newLikes.toString());
      toast.success(t("articles.unliked"));
    } else {
      // Like
      const newLikes = likes + 1;
      setLikes(newLikes);
      setHasLiked(true);
      likedArticles[articleId] = true;
      localStorage.setItem(`article_${articleId}_likes`, newLikes.toString());
      toast.success(t("articles.liked"));
    }
    
    localStorage.setItem("likedArticles", JSON.stringify(likedArticles));
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(articleUrl);
    const title = encodeURIComponent(articleTitle);
    
    let shareUrl = "";
    
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case "line":
        shareUrl = `https://line.me/R/msg/text/?${title}%20${url}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
      toast.success(t("articles.shareSuccess"));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={hasLiked ? "default" : "outline"}
        size="sm"
        onClick={handleLike}
        className="gap-2"
      >
        <Heart className={`h-4 w-4 ${hasLiked ? "fill-current" : ""}`} />
        <span>{likes}</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            <span>{t("articles.share")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleShare("facebook")}>
            <Facebook className="h-4 w-4 mr-2" />
            Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("line")}>
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.771.039 1.086l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
            Line
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("twitter")}>
            <Twitter className="h-4 w-4 mr-2" />
            Twitter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ArticleLikeShare;
