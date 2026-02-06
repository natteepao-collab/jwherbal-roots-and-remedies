import { useCallback, useMemo } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { SecondaryNavbar } from "./SecondaryNavbar";
import { useIsMobile } from "@/hooks/use-mobile";

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Module-level state to persist across component remounts
let cachedSidebarState: boolean | null = null;

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

function getInitialSidebarState(): boolean {
  // Use cached state if available (persists across remounts)
  if (cachedSidebarState !== null) {
    return cachedSidebarState;
  }
  // Otherwise read from cookie
  cachedSidebarState = getSidebarStateFromCookie();
  return cachedSidebarState;
}

function setSidebarStateToCookie(open: boolean): void {
  cachedSidebarState = open;
  document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  
  // Get initial state - uses cached value or reads from cookie once
  const initialOpen = useMemo(() => getInitialSidebarState(), []);
  
  // Handle state changes - update cache and cookie
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setSidebarStateToCookie(newOpen);
  }, []);
  
  // On mobile, always start closed (uses openMobile internally)
  const defaultOpen = isMobile ? false : initialOpen;
  
  return (
    <SidebarProvider 
      defaultOpen={defaultOpen}
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
