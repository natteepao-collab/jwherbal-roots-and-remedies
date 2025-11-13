import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { reviews } from "@/data/reviews";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

const Reviews = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as "th" | "en" | "zh";

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{t("sections.customerReviews")} - JWHERBAL</title>
        <meta
          name="description"
          content={t("sections.customerReviews")}
        />
      </Helmet>
      
      <Navbar />

      <main className="flex-1">
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                {t("sections.customerReviews")}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {currentLanguage === "th"
                  ? "ประสบการณ์จริงจากผู้ใช้ V Flow Herbal Drink ที่ได้รับความไว้วางใจจากลูกค้ามากมาย"
                  : currentLanguage === "en"
                  ? "Real experiences from V Flow Herbal Drink users who trust our products"
                  : "来自V Flow草本饮料用户的真实体验，深受众多客户信赖"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <Card
                  key={review.id}
                  className="rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <img
                        src={review.avatarUrl}
                        alt={review.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-border"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {review.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {review.age}{" "}
                          {currentLanguage === "th"
                            ? "ปี"
                            : currentLanguage === "en"
                            ? "years old"
                            : "岁"}{" "}
                          • {review.occupation[currentLanguage]}
                        </p>
                        <div className="mt-1">{renderStars(review.rating)}</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.review[currentLanguage]}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Reviews;
