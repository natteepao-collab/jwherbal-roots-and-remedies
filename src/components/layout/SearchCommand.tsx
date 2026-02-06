import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBag, BookOpen, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "product" | "article";
  url: string;
  image?: string;
}

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const currentLang = i18n.language as "th" | "en" | "zh";

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const searchProducts = async (searchQuery: string) => {
    const nameField = `name_${currentLang}` as const;
    const descField = `description_${currentLang}` as const;
    
    const { data } = await supabase
      .from("products")
      .select("id, name_th, name_en, name_zh, description_th, description_en, description_zh, image_url")
      .eq("is_active", true)
      .or(`name_th.ilike.%${searchQuery}%,name_en.ilike.%${searchQuery}%,name_zh.ilike.%${searchQuery}%,description_th.ilike.%${searchQuery}%`)
      .limit(5);

    return (data || []).map((product) => ({
      id: product.id,
      title: product[nameField] || product.name_th,
      description: (product[descField] || product.description_th)?.substring(0, 80) + "...",
      type: "product" as const,
      url: `/shop?product=${product.id}`,
      image: product.image_url,
    }));
  };

  const searchArticles = async (searchQuery: string) => {
    const titleField = `title_${currentLang}` as const;
    const excerptField = `excerpt_${currentLang}` as const;
    
    const { data } = await supabase
      .from("articles")
      .select("id, slug, title_th, title_en, title_zh, excerpt_th, excerpt_en, excerpt_zh, image_url")
      .or(`title_th.ilike.%${searchQuery}%,title_en.ilike.%${searchQuery}%,title_zh.ilike.%${searchQuery}%,excerpt_th.ilike.%${searchQuery}%`)
      .limit(5);

    return (data || []).map((article) => ({
      id: article.id,
      title: article[titleField] || article.title_th,
      description: (article[excerptField] || article.excerpt_th)?.substring(0, 80) + "...",
      type: "article" as const,
      url: `/articles/${article.slug}`,
      image: article.image_url,
    }));
  };

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const [products, articles] = await Promise.all([
        searchProducts(searchQuery),
        searchArticles(searchQuery),
      ]);

      setResults([...products, ...articles]);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentLang]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, handleSearch]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    navigate(result.url);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "product":
        return <ShoppingBag className="h-4 w-4 text-primary" />;
      case "article":
        return <BookOpen className="h-4 w-4 text-primary" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "product":
        return "สินค้า";
      case "article":
        return "บทความ";
      default:
        return "";
    }
  };

  return (
    <>
      {/* Search Trigger Button */}
      <div className="relative w-full max-w-lg">
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="w-full justify-start text-muted-foreground h-9 px-3 bg-muted/50 border-0 rounded-full hover:bg-muted"
        >
          <Search className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">ค้นหาสินค้า, บทความ...</span>
          <span className="sm:hidden">ค้นหา...</span>
          <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      {/* Search Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="ค้นหาสินค้า, บทความ..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {!isLoading && query && results.length === 0 && (
            <CommandEmpty>
              <div className="text-center py-6">
                <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">ไม่พบผลลัพธ์สำหรับ "{query}"</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  ลองค้นหาด้วยคำอื่น
                </p>
              </div>
            </CommandEmpty>
          )}

          {!isLoading && results.filter(r => r.type === "product").length > 0 && (
            <CommandGroup heading="สินค้า">
              {results
                .filter((r) => r.type === "product")
                .map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3 w-full">
                      {result.image ? (
                        <img
                          src={result.image}
                          alt={result.title}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                          {getTypeIcon(result.type)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.description}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}

          {!isLoading && results.filter(r => r.type === "article").length > 0 && (
            <CommandGroup heading="บทความ">
              {results
                .filter((r) => r.type === "article")
                .map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3 w-full">
                      {result.image ? (
                        <img
                          src={result.image}
                          alt={result.title}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                          {getTypeIcon(result.type)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.description}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}

          {!isLoading && !query && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p>พิมพ์เพื่อค้นหาสินค้าหรือบทความ</p>
              <p className="text-xs mt-1 opacity-70">
                กด <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘K</kbd> เพื่อเปิดค้นหาได้ทุกเมื่อ
              </p>
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
