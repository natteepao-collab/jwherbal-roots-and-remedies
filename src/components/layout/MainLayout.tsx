import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { SecondaryNavbar } from "./SecondaryNavbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
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
