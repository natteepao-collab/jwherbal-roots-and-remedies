import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CountdownTimerProps {
  /** Override target date (ignores DB settings) */
  targetDate?: Date;
}

function getEndOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
}

function getTimeLeft(target: Date) {
  const now = new Date().getTime();
  const diff = target.getTime() - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function CountdownTimer({ targetDate: overrideDate }: CountdownTimerProps) {
  const { data: settings } = useQuery({
    queryKey: ["promotion-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotion_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  const target = overrideDate
    ? overrideDate
    : settings?.is_monthly || !settings?.custom_end_date
      ? getEndOfMonth()
      : new Date(settings.custom_end_date);

  const [time, setTime] = useState(getTimeLeft(target));

  useEffect(() => {
    setTime(getTimeLeft(target));
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target.getTime()]);

  const units = [
    { value: time.days, label: "วัน" },
    { value: time.hours, label: "ชม." },
    { value: time.minutes, label: "นาที" },
    { value: time.seconds, label: "วินาที" },
  ];

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-destructive animate-pulse" />
      <span className="text-xs font-medium text-muted-foreground mr-1">หมดเขตใน</span>
      <div className="flex gap-1">
        {units.map((u) => (
          <div
            key={u.label}
            className="flex flex-col items-center bg-foreground/5 rounded px-1.5 py-0.5 min-w-[36px]"
          >
            <span className="text-sm font-bold tabular-nums text-foreground leading-tight">
              {pad(u.value)}
            </span>
            <span className="text-[9px] text-muted-foreground leading-tight">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
