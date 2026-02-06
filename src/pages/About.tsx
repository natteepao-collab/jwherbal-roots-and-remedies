import { useState, useEffect } from "react";
import { Award, Users, Heart, Leaf, Target, CheckCircle, Shield, Eye, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

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
      if (missionRes.data) setMissionItems(missionRes.data);
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

  // Default vision image if none uploaded
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

      {/* Vision Section - New Design based on screenshot */}
      {settings && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left - Image */}
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                  <img
                    src={settings.vision_image_url || defaultVisionImage}
                    alt="V Flow Products"
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </div>

              {/* Right - Vision Content */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-primary">
                      {getLocalizedText(settings.vision_title_th, settings.vision_title_en, settings.vision_title_zh)}
                    </h2>
                    <p className="text-sm text-muted-foreground">Vision</p>
                  </div>
                </div>

                <div className="relative pl-6 border-l-4 border-primary/30">
                  <Quote className="absolute -left-3 -top-1 h-6 w-6 text-primary/50" />
                  <p className="text-lg text-primary font-medium italic">
                    {getLocalizedText(settings.vision_quote_th, settings.vision_quote_en, settings.vision_quote_zh)}
                  </p>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  {getLocalizedText(settings.vision_subtitle_th, settings.vision_subtitle_en, settings.vision_subtitle_zh)}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Mission Section - Accordion Design based on screenshots */}
      {missionItems.length > 0 && (
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("about.mission.title")}</h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {missionItems.map((item, index) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="border rounded-lg bg-card shadow-sm overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-primary/5">
                      <div className="flex items-center gap-4 text-left">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="font-semibold text-primary">
                          {getLocalizedText(item.title_th, item.title_en, item.title_zh)}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
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
        </section>
      )}

      {/* Story Section */}
      {settings && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="h-8 w-8 text-primary" />
                    <h2 className="text-3xl font-bold">
                      {getLocalizedText(settings.story_title_th, settings.story_title_en, settings.story_title_zh)}
                    </h2>
                  </div>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>{getLocalizedText(settings.story_paragraph1_th, settings.story_paragraph1_en, settings.story_paragraph1_zh)}</p>
                    <p>{getLocalizedText(settings.story_paragraph2_th, settings.story_paragraph2_en, settings.story_paragraph2_zh)}</p>
                    <p>{getLocalizedText(settings.story_paragraph3_th, settings.story_paragraph3_en, settings.story_paragraph3_zh)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

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
      {settings && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("about.achievements.title")}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {settings.achievement_years}
                </div>
                <div className="text-muted-foreground">
                  {getLocalizedText(settings.achievement_years_label_th, settings.achievement_years_label_en, settings.achievement_years_label_zh)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {settings.achievement_customers}
                </div>
                <div className="text-muted-foreground">
                  {getLocalizedText(settings.achievement_customers_label_th, settings.achievement_customers_label_en, settings.achievement_customers_label_zh)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {settings.achievement_products}
                </div>
                <div className="text-muted-foreground">
                  {getLocalizedText(settings.achievement_products_label_th, settings.achievement_products_label_en, settings.achievement_products_label_zh)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {settings.achievement_satisfaction}
                </div>
                <div className="text-muted-foreground">
                  {getLocalizedText(settings.achievement_satisfaction_label_th, settings.achievement_satisfaction_label_en, settings.achievement_satisfaction_label_zh)}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

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

      <Footer />
    </div>
  );
};

export default About;
