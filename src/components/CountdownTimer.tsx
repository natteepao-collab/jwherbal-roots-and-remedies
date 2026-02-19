import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";
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
    <div className="w-full flex flex-col gap-3 sm:gap-4">
      {/* Label */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-destructive animate-pulse flex-shrink-0" />
        <span className="text-sm sm:text-base font-bold text-muted-foreground">หมดเขตใน</span>
      </div>
      {/* Timer boxes */}
      <div className="flex gap-2 sm:gap-3 md:gap-4 justify-center sm:justify-start flex-wrap sm:flex-nowrap">
        {units.map((u) => (
          <motion.div
            key={u.label}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="flex flex-col items-center flex-1 min-w-[60px] sm:min-w-[70px] md:min-w-[80px]"
          >
            <div className="w-full bg-gradient-to-br from-destructive/15 to-destructive/10 hover:from-destructive/20 hover:to-destructive/15 rounded-xl px-3 sm:px-4 py-3 sm:py-4 border-2 border-destructive/25 transition-all duration-300 backdrop-blur-sm shadow-md hover:shadow-lg text-center">
              <span className="block text-xl sm:text-2xl md:text-3xl font-black tabular-nums text-destructive leading-none">
                {pad(u.value)}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground leading-tight font-semibold mt-2">{u.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
