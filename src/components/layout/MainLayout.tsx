import { useState, useCallback, useRef, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { SecondaryNavbar } from "./SecondaryNavbar";
import { useIsMobile } from "@/hooks/use-mobile";

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSidebarStateFromCookie(): boolean {
  if (typeof document === "undefined") return true;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === SIDEBAR_COOKIE_NAME) {
      return value === "true";
    }
  }
  return true; // Default to expanded
}

function setSidebarStateToCookie(open: boolean): void {
  document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  
  // Use ref to store the initial cookie value and prevent re-reads
  const initialOpenRef = useRef<boolean | null>(null);
  if (initialOpenRef.current === null) {
    initialOpenRef.current = getSidebarStateFromCookie();
  }
  
  // Initialize state from cookie - only once
  const [open, setOpen] = useState<boolean>(initialOpenRef.current);
  
  // Handle open state change and persist to cookie
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    setSidebarStateToCookie(newOpen);
  }, []);
  
  // On mobile, sidebar is controlled via sheet (openMobile in SidebarProvider)
  // On desktop, use the persisted open state
  const effectiveOpen = isMobile ? false : open;
  
  return (
    <SidebarProvider 
      open={effectiveOpen} 
      onOpenChange={handleOpenChange}
    >
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
