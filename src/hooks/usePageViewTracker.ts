import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "jw_session_id";
const LAST_PATH_KEY = "jw_last_tracked_path";

function getSessionId(): string {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export function usePageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    // Skip admin / auth routes from public traffic analytics
    if (path.startsWith("/admin") || path.startsWith("/auth")) return;

    // Debounce duplicate tracking for same path within same tick
    const lastPath = sessionStorage.getItem(LAST_PATH_KEY);
    const stamp = `${path}|${Math.floor(Date.now() / 2000)}`;
    if (lastPath === stamp) return;
    sessionStorage.setItem(LAST_PATH_KEY, stamp);

    const payload = {
      path,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent.slice(0, 500),
      session_id: getSessionId(),
      country: (navigator.language || "").split("-")[1] || null,
    };

    supabase.from("page_views").insert(payload).then(() => {}, () => {});
  }, [location.pathname]);
}
