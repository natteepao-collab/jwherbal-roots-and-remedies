import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { SecondaryNavbar } from "./SecondaryNavbar";
import { useIsMobile } from "@/hooks/use-mobile";

const SIDEBAR_COOKIE_NAME = "sidebar:state";

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

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  
  // Read cookie state synchronously - SidebarProvider handles persistence internally
  const defaultOpen = isMobile ? false : getSidebarStateFromCookie();
  
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
