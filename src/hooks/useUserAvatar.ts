import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveAvatar } from "@/lib/avatarUtils";

export const PROFILE_UPDATED_EVENT = "profile-updated";

export function useUserAvatar(userId: string | null | undefined) {
  const [preferred, setPreferred] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setPreferred(null);
      return;
    }
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("preferred_avatar")
        .eq("id", userId)
        .single();
      if (!cancelled) setPreferred(data?.preferred_avatar ?? null);
    };

    load();

    const handler = () => load();
    window.addEventListener(PROFILE_UPDATED_EVENT, handler);
    return () => {
      cancelled = true;
      window.removeEventListener(PROFILE_UPDATED_EVENT, handler);
    };
  }, [userId]);

  return resolveAvatar(preferred);
}
