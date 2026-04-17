import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { getTodaySocialDays, getUpcomingSocialDays, getCategoryColor, type SocialDay } from "@/data/socialDays";

const SocialDayBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const [todayDays, setTodayDays] = useState<SocialDay[]>([]);
  const [nextDay, setNextDay] = useState<(SocialDay & { actualDate?: Date }) | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const today = getTodaySocialDays();
    setTodayDays(today);

    if (today.length === 0) {
      const upcoming = getUpcomingSocialDays(1);
      if (upcoming.length > 0) {
        setNextDay(upcoming[0]);
      }
    }
  }, []);

  // Auto-cycle if multiple today
  useEffect(() => {
    if (todayDays.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % todayDays.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [todayDays.length]);

  if (dismissed) return null;

  // If there's a social day today
  if (todayDays.length > 0) {
    const day = todayDays[activeIndex];
    const color = getCategoryColor(day.category);

    return (
      <div
        className="relative overflow-hidden transition-all duration-500"
        style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)` }}
      >
        {/* Decorative sparkles */}
        <div className="absolute top-2 left-8 opacity-20">
          <Sparkles size={20} style={{ color }} />
        </div>
        <div className="absolute bottom-2 right-20 opacity-15">
          <Sparkles size={16} style={{ color }} />
        </div>

        <div className="container py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-2xl shrink-0 animate-[pulse_2s_ease-in-out_infinite]">{day.emoji}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-heading font-bold text-sm text-foreground">
                  {day.name}
                </span>
                {todayDays.length > 1 && (
                  <span className="text-[10px] font-heading text-muted-foreground">
                    ({activeIndex + 1}/{todayDays.length})
                  </span>
                )}
              </div>
              <p className="font-body text-xs text-muted-foreground truncate">
                {day.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/social-days"
              className="hidden sm:flex items-center gap-1 text-xs font-heading font-semibold hover:underline transition-colors"
              style={{ color }}
            >
              All Days <ArrowRight size={12} />
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-full hover:bg-foreground/5 transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>
        {/* Colored bottom border */}
        <div className="h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      </div>
    );
  }

  // If no social day today, show a subtle "upcoming" teaser
  if (nextDay) {
    const color = getCategoryColor(nextDay.category);
    const [mm, dd] = nextDay.date.split("-").map(Number);
    const now = new Date();
    const year = new Date(now.getFullYear(), mm - 1, dd) >= now ? now.getFullYear() : now.getFullYear() + 1;
    const target = new Date(year, mm - 1, dd);
    const daysUntil = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return (
      <div className="bg-muted/30">
        <div className="container py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Calendar size={14} className="text-muted-foreground shrink-0" />
            <p className="font-body text-xs text-muted-foreground truncate">
              <span className="font-heading font-semibold text-foreground">{nextDay.emoji} {nextDay.name}</span>
              {" "}— coming up in {daysUntil} day{daysUntil !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/social-days"
              className="hidden sm:flex items-center gap-1 text-xs font-heading font-semibold text-primary hover:underline"
            >
              View Calendar <ArrowRight size={12} />
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-full hover:bg-foreground/5 transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SocialDayBanner;
