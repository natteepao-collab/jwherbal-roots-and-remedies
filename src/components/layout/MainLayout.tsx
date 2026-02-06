import { SecondaryNavbar } from "./SecondaryNavbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <SecondaryNavbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
