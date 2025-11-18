import { Award, Users, Heart, Leaf, Target, CheckCircle, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

const About = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as "th" | "en" | "zh";

  const values = [
    {
      icon: Leaf,
      titleKey: "about.values.natural.title",
      descKey: "about.values.natural.desc",
    },
    {
      icon: Shield,
      titleKey: "about.values.quality.title",
      descKey: "about.values.quality.desc",
    },
    {
      icon: Heart,
      titleKey: "about.values.care.title",
      descKey: "about.values.care.desc",
    },
    {
      icon: Target,
      titleKey: "about.values.innovation.title",
      descKey: "about.values.innovation.desc",
    },
  ];

  const achievements = [
    { number: "10+", labelKey: "about.achievements.years" },
    { number: "50,000+", labelKey: "about.achievements.customers" },
    { number: "100+", labelKey: "about.achievements.products" },
    { number: "98%", labelKey: "about.achievements.satisfaction" },
  ];

  const certifications = [
    { name: "อย. (FDA)", icon: Award },
    { name: "GMP", icon: Award },
    { name: "HALAL", icon: Award },
    { name: "ISO 9001", icon: Award },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{t("about.pageTitle")} - JWHERBAL BY JWGROUP</title>
        <meta name="description" content={t("about.metaDescription")} />
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/5 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground animate-fade-in-up">
              {t("about.hero.title")}
            </h1>
            <p className="text-xl text-muted-foreground animate-fade-in-up animation-delay-200">
              {t("about.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl font-bold">{t("about.story.title")}</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>{t("about.story.paragraph1")}</p>
                  <p>{t("about.story.paragraph2")}</p>
                  <p>{t("about.story.paragraph3")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("about.values.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("about.values.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{t(value.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(value.descKey)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("about.achievements.title")}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {achievement.number}
                </div>
                <div className="text-muted-foreground">{t(achievement.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("about.certifications.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("about.certifications.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {certifications.map((cert, index) => {
              const Icon = cert.icon;
              return (
                <Card key={index} className="w-40 hover:scale-105 transition-transform">
                  <CardContent className="p-6 text-center">
                    <Icon className="h-12 w-12 mx-auto mb-3 text-primary" />
                    <p className="font-semibold">{cert.name}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl font-bold">{t("about.mission.title")}</h2>
                </div>
                <ul className="space-y-4">
                  {[1, 2, 3, 4].map((num) => (
                    <li key={num} className="flex gap-3">
                      <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        {t(`about.mission.point${num}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
