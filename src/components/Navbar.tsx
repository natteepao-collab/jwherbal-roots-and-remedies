import { Link } from "react-router-dom";
import { ShoppingCart, Menu, User, Home, Info, ShoppingBag, BookOpen, Users, Star, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import jwGroupLogo from "@/assets/jwgroup-logo.png";

const Navbar = () => {
  const { items } = useCart();
  const { t } = useTranslation();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { to: "/", label: t("nav.home"), icon: Home },
    { to: "/about", label: t("nav.about"), icon: Info },
    { to: "/shop", label: t("nav.shop"), icon: ShoppingBag },
    { to: "/articles", label: t("nav.articles"), icon: BookOpen },
    { to: "/community", label: t("nav.community"), icon: Users },
    { to: "/reviews", label: t("nav.reviews"), icon: Star },
    { to: "/contact", label: t("nav.contact"), icon: Phone },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-3">
          <img 
            src={jwGroupLogo} 
            alt="JW Group Logo" 
            className="h-10 w-auto object-contain"
          />
          <span className="font-prompt font-semibold text-lg text-foreground hidden sm:inline-block tracking-wide">
            JWHERBAL BY JWGROUP
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="font-prompt text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-300 relative group flex items-center gap-1.5"
              >
                <IconComponent className="h-4 w-4 group-hover:scale-110 transition-transform" />
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center space-x-2">
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" asChild>
            <Link to="/auth">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="font-prompt text-lg font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-3"
                    >
                      <IconComponent className="h-5 w-5" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
