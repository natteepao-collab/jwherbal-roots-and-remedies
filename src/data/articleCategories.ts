// Recommended article categories for SEO grouping and admin selection.
// Articles in DB may still use legacy values (e.g. "สุขภาพ", "สมุนไพร") — those will
// appear as "อื่น ๆ" in filters but still render correctly.

export interface ArticleCategory {
  value: string; // exact string stored in articles.category
  label_th: string;
  label_en: string;
  label_zh: string;
}

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  {
    value: "สมุนไพรไทย",
    label_th: "สมุนไพรไทย",
    label_en: "Thai Herbs",
    label_zh: "泰国草药",
  },
  {
    value: "สุขภาพวัยทำงาน",
    label_th: "การดูแลสุขภาพวัยทำงาน",
    label_en: "Working-Age Wellness",
    label_zh: "上班族保健",
  },
  {
    value: "ดูแลผู้สูงอายุ",
    label_th: "การดูแลผู้สูงอายุ",
    label_en: "Senior Care",
    label_zh: "老年护理",
  },
  {
    value: "ส่วนประกอบ V Flow",
    label_th: "ส่วนประกอบ V FLOW",
    label_en: "V FLOW Ingredients",
    label_zh: "V FLOW 成分",
  },
  {
    value: "เลือกผลิตภัณฑ์เสริมอาหาร",
    label_th: "คำถามก่อนเลือกผลิตภัณฑ์เสริมอาหาร",
    label_en: "Choosing Supplements",
    label_zh: "如何选择保健品",
  },
  {
    value: "งานวิจัย",
    label_th: "งานวิจัย",
    label_en: "Research",
    label_zh: "研究",
  },
  {
    value: "สูตรสมุนไพร",
    label_th: "สูตรสมุนไพร",
    label_en: "Herbal Recipes",
    label_zh: "草药配方",
  },
];

export const getCategoryLabel = (
  value: string,
  lang: "th" | "en" | "zh" = "th"
): string => {
  const found = ARTICLE_CATEGORIES.find((c) => c.value === value);
  if (!found) return value;
  return lang === "en" ? found.label_en : lang === "zh" ? found.label_zh : found.label_th;
};
