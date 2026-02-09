import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminSidebar } from "./AdminSidebar";
import { Loader2 } from "lucide-react";

export const AdminLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (!session) {
          navigate("/auth", { replace: true });
          return;
        }

        // Check if user is admin
        const { data: roleData, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .single();

        if (!isMounted) return;

        if (error || !roleData) {
          toast({
            title: "ไม่มีสิทธิ์เข้าถึง",
            description: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
            variant: "destructive",
          });
          navigate("/", { replace: true });
          return;
        }

        setIsAdmin(true);
        setLoading(false);
      } catch (err) {
        console.error("Auth check error:", err);
        if (isMounted) {
          navigate("/auth", { replace: true });
        }
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && isMounted) {
        navigate("/auth", { replace: true });
      }
    });
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
