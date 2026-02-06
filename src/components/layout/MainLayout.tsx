import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { SecondaryNavbar } from "./SecondaryNavbar";
import { useIsMobile } from "@/hooks/use-mobile";

const SIDEBAR_COOKIE_NAME = "sidebar:state";

function getSidebarStateFromCookie(): boolean {
  if (typeof document === "undefined") return false;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === SIDEBAR_COOKIE_NAME) {
      return value === "true";
    }
  }
  return false; // Default to collapsed
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const [defaultOpen, setDefaultOpen] = useState<boolean | undefined>(undefined);
  
  useEffect(() => {
    // Read sidebar state from cookie on mount
    const savedState = getSidebarStateFromCookie();
    setDefaultOpen(isMobile ? false : savedState);
  }, [isMobile]);

  // Wait for cookie state to be read before rendering
  if (defaultOpen === undefined) {
    return null;
  }
  
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col w-full">
          <SecondaryNavbar />
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
