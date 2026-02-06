import { Mail, Phone, Facebook, Instagram, MapPin, MessageCircle } from "lucide-react";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Contact = () => {
  const { t } = useTranslation();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["contact-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_settings")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t("contact.sent"));
  };

  return (
    <PageTransition>
    <div className="min-h-screen flex flex-col">

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">ติดต่อเรา</h1>
          <p className="text-muted-foreground mb-12">
            หากคุณมีคำถามหรือข้อสงสัย อย่าลังเลที่จะติดต่อเรา
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6">ส่งข้อความถึงเรา</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                    <Input id="name" placeholder="กรุณากรอกชื่อของคุณ" required />
                  </div>
                  <div>
                    <Label htmlFor="email">อีเมล</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <Input id="phone" type="tel" placeholder="08x-xxx-xxxx" />
                  </div>
                  <div>
                    <Label htmlFor="message">ข้อความ</Label>
                    <Textarea
                      id="message"
                      placeholder="พิมพ์ข้อความของคุณที่นี่..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    ส่งข้อความ
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">ช่องทางการติดต่อ</h2>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <div className="font-medium">โทรศัพท์</div>
                          <div className="text-muted-foreground">{settings?.phone || "08x-xxx-xxxx"}</div>
                          <div className="text-sm text-muted-foreground">
                            {settings?.phone_hours || "จันทร์-ศุกร์ 9:00-18:00 น."}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <div className="font-medium">อีเมล</div>
                          <div className="text-muted-foreground">{settings?.email || "info@jwherbal.com"}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <div className="font-medium">ที่อยู่</div>
                          <div className="text-muted-foreground whitespace-pre-line">
                            {settings?.address || "123 ถนนสุขภาพ แขวงสุขใจ\nเขตธรรมชาติ กรุงเทพฯ 10100"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">ติดตามเรา</h2>
                  {isLoading ? (
                    <Skeleton className="h-12 w-32" />
                  ) : (
                    <>
                      <div className="flex gap-4">
                        {settings?.facebook_url && (
                          <a
                            href={settings.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Facebook className="h-5 w-5" />
                          </a>
                        )}
                        {settings?.instagram_url && (
                          <a
                            href={settings.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Instagram className="h-5 w-5" />
                          </a>
                        )}
                        {settings?.line_url && (
                          <a
                            href={settings.line_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <MessageCircle className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                      {settings?.line_id && (
                        <div className="mt-4 text-sm text-muted-foreground">
                          Line ID: {settings.line_id}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">เวลาทำการ</h2>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">จันทร์ - ศุกร์</span>
                        <span className="font-medium">{settings?.weekday_hours || "9:00 - 18:00 น."}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">เสาร์ - อาทิตย์</span>
                        <span className="font-medium">{settings?.weekend_hours || "10:00 - 16:00 น."}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </PageTransition>
  );
};

export default Contact;