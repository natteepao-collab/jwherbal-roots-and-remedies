// Square article images mapping
import article01 from "@/assets/articles/article-01-sq.jpg";
import article02 from "@/assets/articles/article-02-sq.jpg";
import article03 from "@/assets/articles/article-03-sq.jpg";
import article04 from "@/assets/articles/article-04-sq.jpg";
import article05 from "@/assets/articles/article-05-sq.jpg";
import article06 from "@/assets/articles/article-06-sq.jpg";
import article07 from "@/assets/articles/article-07-sq.jpg";
import article08 from "@/assets/articles/article-08-sq.jpg";
import article09 from "@/assets/articles/article-09-sq.jpg";
import article10 from "@/assets/articles/article-10-sq.jpg";
import article11 from "@/assets/articles/article-11-sq.jpg";
import article12 from "@/assets/articles/article-12-sq.jpg";
import article13 from "@/assets/articles/article-13-sq.jpg";
import article14 from "@/assets/articles/article-14-sq.jpg";
import article15 from "@/assets/articles/article-15-sq.jpg";

export const articleSquareImages: Record<string, string> = {
  "/src/assets/articles/article-01.jpg": article01,
  "/src/assets/articles/article-01-sq.jpg": article01,
  "/src/assets/articles/article-02.jpg": article02,
  "/src/assets/articles/article-02-sq.jpg": article02,
  "/src/assets/articles/article-03.jpg": article03,
  "/src/assets/articles/article-03-sq.jpg": article03,
  "/src/assets/articles/article-04.jpg": article04,
  "/src/assets/articles/article-04-sq.jpg": article04,
  "/src/assets/articles/article-05.jpg": article05,
  "/src/assets/articles/article-05-sq.jpg": article05,
  "/src/assets/articles/article-06.jpg": article06,
  "/src/assets/articles/article-06-sq.jpg": article06,
  "/src/assets/articles/article-07.jpg": article07,
  "/src/assets/articles/article-07-sq.jpg": article07,
  "/src/assets/articles/article-08.jpg": article08,
  "/src/assets/articles/article-08-sq.jpg": article08,
  "/src/assets/articles/article-09.jpg": article09,
  "/src/assets/articles/article-09-sq.jpg": article09,
  "/src/assets/articles/article-10.jpg": article10,
  "/src/assets/articles/article-10-sq.jpg": article10,
  "/src/assets/articles/article-11.jpg": article11,
  "/src/assets/articles/article-11-sq.jpg": article11,
  "/src/assets/articles/article-12.jpg": article12,
  "/src/assets/articles/article-12-sq.jpg": article12,
  "/src/assets/articles/article-13.jpg": article13,
  "/src/assets/articles/article-13-sq.jpg": article13,
  "/src/assets/articles/article-14.jpg": article14,
  "/src/assets/articles/article-14-sq.jpg": article14,
  "/src/assets/articles/article-15.jpg": article15,
  "/src/assets/articles/article-15-sq.jpg": article15,
};

export const getArticleImage = (imageUrl: string): string => {
  return articleSquareImages[imageUrl] || imageUrl;
};
