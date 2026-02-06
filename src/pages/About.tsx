import { useState, useEffect } from "react";
import { Award, Users, Heart, Leaf, Target, Shield, Eye, Quote, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

// Import images
import companyStoryImg from "@/assets/about/company-story.jpg";
import valuesNatureImg from "@/assets/about/values-nature.jpg";
import teamExpertsImg from "@/assets/about/team-experts.jpg";

interface AboutSettings {
  id: string;
  vision_title_th: string;
  vision_title_en: string;
  vision_title_zh: string;
  vision_quote_th: string;
  vision_quote_en: string;
  vision_quote_zh: string;
  vision_subtitle_th: string;
  vision_subtitle_en: string;
  vision_subtitle_zh: string;
  vision_image_url: string | null;
  story_title_th: string;
  story_title_en: string;
  story_title_zh: string;
  story_paragraph1_th: string;
  story_paragraph1_en: string;
  story_paragraph1_zh: string;
  story_paragraph2_th: string;
  story_paragraph2_en: string;
  story_paragraph2_zh: string;
  story_paragraph3_th: string;
  story_paragraph3_en: string;
  story_paragraph3_zh: string;
  achievement_years: string;
  achievement_years_label_th: string;
  achievement_years_label_en: string;
  achievement_years_label_zh: string;
  achievement_customers: string;
  achievement_customers_label_th: string;
  achievement_customers_label_en: string;
  achievement_customers_label_zh: string;
  achievement_products: string;
  achievement_products_label_th: string;
  achievement_products_label_en: string;
  achievement_products_label_zh: string;
  achievement_satisfaction: string;
  achievement_satisfaction_label_th: string;
  achievement_satisfaction_label_en: string;
  achievement_satisfaction_label_zh: string;
}

interface MissionItem {
  id: string;
  sort_order: number;
  is_active: boolean;
  title_th: string;
  title_en: string;
  title_zh: string;
  description_th: string;
  description_en: string;
  description_zh: string;
}

const About = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as "th" | "en" | "zh";
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [missionItems, setMissionItems] = useState<MissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, missionRes] = await Promise.all([
        supabase.from("about_settings").select("*").maybeSingle(),
        supabase.from("about_mission_items").select("*").order("sort_order", { ascending: true })
      ]);

      if (settingsRes.data) setSettings(settingsRes.data);
      if (missionRes.data) setMissionItems(missionRes.data.filter(item => item.is_active));
    } catch (error) {
      console.error("Error fetching about data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalizedText = (thText: string, enText: string, zhText: string) => {
    switch (currentLanguage) {
      case "en":
        return enText || thText;
      case "zh":
        return zhText || thText;
      default:
        return thText;
    }
  };

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

  const certifications = [
    { name: "อย. (FDA)", icon: Award },
    { name: "GMP", icon: Award },
    { name: "HALAL", icon: Award },
    { name: "ISO 9001", icon: Award },
  ];

  const defaultVisionImage = "https://guauobzuxgvkluxwfvxt.supabase.co/storage/v1/object/public/product-images/vflow-products.jpg";

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">กำลังโหลด...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{t("about.pageTitle")} - JWHERBAL BY JWGROUP</title>
        <meta name="description" content={t("about.metaDescription")} />
      </Helmet>

      <Navbar />

      {/* Hero Section - Minimal */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-primary font-medium tracking-wider uppercase text-sm mb-4">
              JWHERBAL BY JWGROUP
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              {t("about.hero.title")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("about.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section - Clean Layout */}
      {settings && (
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Image */}
              <div className="order-2 lg:order-1">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-2xl" />
                  <img
                    src={settings.vision_image_url || defaultVisionImage}
                    alt="V Flow Products"
                    className="relative w-full h-auto rounded-2xl shadow-2xl"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2 space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    <Eye className="h-4 w-4" />
                    <span>Vision</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                    {getLocalizedText(settings.vision_title_th, settings.vision_title_en, settings.vision_title_zh)}
                  </h2>
                </div>

                <blockquote className="relative pl-6 border-l-4 border-primary">
                  <Quote className="absolute -left-3 -top-2 h-6 w-6 text-primary/30" />
                  <p className="text-xl md:text-2xl text-primary font-medium italic leading-relaxed">
                    {getLocalizedText(settings.vision_quote_th, settings.vision_quote_en, settings.vision_quote_zh)}
                  </p>
                </blockquote>

                <p className="text-muted-foreground text-lg leading-relaxed">
                  {getLocalizedText(settings.vision_subtitle_th, settings.vision_subtitle_en, settings.vision_subtitle_zh)}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Achievements Section - Floating Stats */}
      {settings && (
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { value: settings.achievement_years, label: getLocalizedText(settings.achievement_years_label_th, settings.achievement_years_label_en, settings.achievement_years_label_zh) },
                { value: settings.achievement_customers, label: getLocalizedText(settings.achievement_customers_label_th, settings.achievement_customers_label_en, settings.achievement_customers_label_zh) },
                { value: settings.achievement_products, label: getLocalizedText(settings.achievement_products_label_th, settings.achievement_products_label_en, settings.achievement_products_label_zh) },
                { value: settings.achievement_satisfaction, label: getLocalizedText(settings.achievement_satisfaction_label_th, settings.achievement_satisfaction_label_en, settings.achievement_satisfaction_label_zh) },
              ].map((stat, index) => (
                <div key={index} className="text-center p-6 bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mission Section - Clean Accordion */}
      {missionItems.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              {/* Left - Header */}
              <div className="lg:sticky lg:top-32">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Target className="h-4 w-4" />
                  <span>Mission</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("about.mission.title")}</h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  พันธกิจที่เรายึดมั่นในการพัฒนาผลิตภัณฑ์สมุนไพรคุณภาพสูงสำหรับทุกครอบครัว
                </p>
                <img
                  src={teamExpertsImg}
                  alt="Our Expert Team"
                  className="rounded-2xl shadow-lg w-full hidden lg:block"
                />
              </div>

              {/* Right - Accordion */}
              <div>
                <Accordion type="single" collapsible className="space-y-4">
                  {missionItems.map((item, index) => (
                    <AccordionItem
                      key={item.id}
                      value={item.id}
                      className="border-none"
                    >
                      <AccordionTrigger className="px-6 py-5 bg-card rounded-xl hover:bg-secondary/50 hover:no-underline transition-colors shadow-sm data-[state=open]:rounded-b-none data-[state=open]:bg-secondary/50">
                        <div className="flex items-center gap-4 text-left">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0 text-lg">
                            {index + 1}
                          </div>
                          <span className="font-semibold text-lg text-foreground">
                            {getLocalizedText(item.title_th, item.title_en, item.title_zh)}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 py-5 bg-secondary/30 rounded-b-xl">
                        <div className="pl-14">
                          <p className="text-muted-foreground leading-relaxed">
                            {getLocalizedText(item.description_th, item.description_en, item.description_zh)}
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Story Section - Side by Side */}
      {settings && (
        <section className="py-20 md:py-28 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Content */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Users className="h-4 w-4" />
                  <span>Our Story</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  {getLocalizedText(settings.story_title_th, settings.story_title_en, settings.story_title_zh)}
                </h2>
                <div className="space-y-5 text-muted-foreground leading-relaxed text-lg">
                  <p>{getLocalizedText(settings.story_paragraph1_th, settings.story_paragraph1_en, settings.story_paragraph1_zh)}</p>
                  <p>{getLocalizedText(settings.story_paragraph2_th, settings.story_paragraph2_en, settings.story_paragraph2_zh)}</p>
                  <p>{getLocalizedText(settings.story_paragraph3_th, settings.story_paragraph3_en, settings.story_paragraph3_zh)}</p>
                </div>
              </div>

              {/* Image */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tl from-primary/20 to-transparent rounded-3xl blur-2xl" />
                <img
                  src={companyStoryImg}
                  alt="Company Story"
                  className="relative w-full rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Values Section - Grid Cards */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Heart className="h-4 w-4" />
              <span>Values</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("about.values.title")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("about.values.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Image */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-2xl" />
              <img
                src={valuesNatureImg}
                alt="Natural Values"
                className="relative w-full rounded-2xl shadow-2xl"
              />
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-none bg-card">
                    <CardContent className="p-6">
                      <div className="w-14 h-14 mb-4 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                        <Icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{t(value.titleKey)}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t(value.descKey)}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications Section - Minimal */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Award className="h-4 w-4" />
              <span>Certifications</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("about.certifications.title")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("about.certifications.subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {certifications.map((cert, index) => {
              const Icon = cert.icon;
              return (
                <div
                  key={index}
                  className="group flex items-center gap-4 px-8 py-5 bg-card rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <span className="font-semibold text-lg">{cert.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
