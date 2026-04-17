import Layout from "@/components/layout/Layout";
import { Calendar, ArrowRight } from "lucide-react";
import { socialDays, getTodaySocialDays, getUpcomingSocialDays, getCategoryColor, type SocialDay } from "@/data/socialDays";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const categoryLabels: Record<string, string> = {
  awareness: "Awareness",
  celebration: "Celebration",
  rights: "Rights & Justice",
  environment: "Environment",
  health: "Health",
  education: "Education",
};

const DayCard = ({ day, isToday }: { day: SocialDay; isToday: boolean }) => {
  const color = getCategoryColor(day.category);
  const [mm, dd] = day.date.split("-").map(Number);
  const monthShort = monthNames[mm - 1].slice(0, 3);

  return (
    <div
      className="bg-card rounded-xl border overflow-hidden hover:shadow-md transition-all duration-300 group"
      style={{ borderColor: isToday ? color : "hsl(var(--border) / 0.5)" }}
    >
      {isToday && (
        <div className="h-1" style={{ background: color }} />
      )}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Date badge */}
          <div
            className="w-14 h-14 rounded-lg flex flex-col items-center justify-center shrink-0"
            style={{ background: `${color}12` }}
          >
            <span className="text-[10px] font-heading font-bold uppercase" style={{ color }}>{monthShort}</span>
            <span className="text-lg font-heading font-bold" style={{ color }}>{dd}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xl">{day.emoji}</span>
              <h3 className="font-heading font-semibold text-foreground text-sm">{day.name}</h3>
              {isToday && (
                <span className="text-[9px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white" style={{ background: color }}>
                  Today
                </span>
              )}
            </div>
            <p className="font-body text-muted-foreground text-xs leading-relaxed">{day.description}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className="text-[9px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: `${color}12`, color }}
              >
                {categoryLabels[day.category]}
              </span>
              {day.relevantTo && (
                <span className="text-[9px] font-body text-muted-foreground">
                  • {day.relevantTo}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SocialDaysPage = () => {
  const todayDays = getTodaySocialDays();
  const upcoming = getUpcomingSocialDays(30);
  const todayKey = `${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;

  // Group all days by month for the full calendar view
  const daysByMonth: Record<number, SocialDay[]> = {};
  socialDays.forEach((d) => {
    const month = parseInt(d.date.split("-")[0]);
    if (!daysByMonth[month]) daysByMonth[month] = [];
    daysByMonth[month].push(d);
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-primary" size={28} />
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em]">Awareness Calendar</p>
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6">
            Social & Awareness Days
          </h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl leading-relaxed">
            ANUVATI celebrates and observes important social, cultural, and awareness days throughout the year.
            These occasions remind us of the causes we champion and the communities we serve.
          </p>
        </div>
      </section>

      {/* Today's highlight */}
      {todayDays.length > 0 && (
        <section className="py-12 bg-background">
          <div className="container max-w-4xl">
            <div className="mb-6">
              <p className="font-heading text-primary font-semibold text-xs uppercase tracking-[0.2em] mb-2">🎉 Today</p>
              <h2 className="font-heading font-bold text-2xl text-foreground">Celebrating Today</h2>
            </div>
            <div className="grid gap-4">
              {todayDays.map((d) => (
                <DayCard key={d.date + d.name} day={d} isToday />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming */}
      <section className="py-12 bg-section-light">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-2">Coming Up</p>
            <h2 className="font-heading font-bold text-2xl text-foreground">Upcoming Days</h2>
          </div>
          <div className="grid gap-3">
            {upcoming.map((d) => (
              <DayCard key={d.date + d.name} day={d} isToday={false} />
            ))}
          </div>
        </div>
      </section>

      {/* Full Year Calendar */}
      <section className="py-16 bg-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-2">Full Year</p>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">Complete Calendar</h2>
          </div>
          <div className="space-y-10">
            {Object.entries(daysByMonth)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([month, days]) => (
                <div key={month}>
                  <h3 className="font-heading font-bold text-lg text-foreground mb-4 border-b border-border/50 pb-2">
                    {monthNames[Number(month) - 1]}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {days.map((d) => (
                      <DayCard key={d.date + d.name} day={d} isToday={d.date === todayKey} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-section-light">
        <div className="container text-center max-w-2xl">
          <h2 className="font-heading font-bold text-xl text-foreground mb-3">Join Us in Making Every Day Count</h2>
          <p className="font-body text-muted-foreground text-sm mb-6">
            Volunteer, advocate, or donate to support the causes behind these important days.
          </p>
          <Link to="/get-involved">
            <Button className="font-heading font-semibold bg-primary hover:bg-primary/90">
              Get Involved <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default SocialDaysPage;
