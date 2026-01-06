import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, Phone, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import jwherbalLogo from "@/assets/jwherbal-logo.png";

const Footer = () => {
  const { t } = useTranslation();

  const { data: settings } = useQuery({
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

  return (
    <footer className="bg-secondary mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src={jwherbalLogo} 
                alt="JW Herbal Logo" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("footer.description")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("footer.products")}
                </Link>
              </li>
              <li>
                <Link to="/articles" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("footer.healthArticles")}
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("footer.community")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">{t("footer.customerService")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("footer.contactUs")}
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("footer.privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{settings?.phone || "08x-xxx-xxxx"}</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{settings?.email || "info@jwherbal.com"}</span>
              </li>
              <li className="flex items-center space-x-4 mt-4">
                {settings?.facebook_url && (
                  <a 
                    href={settings.facebook_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {settings?.instagram_url && (
                  <a 
                    href={settings.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {settings?.line_url && (
                  <a 
                    href={settings.line_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} JWHERBAL.com {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;