import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: "th", label: "TH" },
    { code: "en", label: "EN" },
    { code: "zh", label: "中文" },
    { code: "ja", label: "JP" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-foreground/70 hover:text-foreground transition-colors focus:outline-none">
          <Languages className="h-4 w-4" />
          <span className="tracking-wide">{currentLanguage.label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[100px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              "text-sm font-medium tracking-wide justify-center",
              i18n.language === lang.code && "bg-accent text-accent-foreground"
            )}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
