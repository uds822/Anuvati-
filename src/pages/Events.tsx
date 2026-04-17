import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import ShareButtons from "@/components/shared/ShareButtons";

const events = [
  { title: "Youth Leadership Summit 2026", date: "March 15-16, 2026", location: "Lucknow, UP", description: "Annual gathering of young development leaders, CSR partners, and institutional stakeholders for strategic dialogue and collaboration.", upcoming: true },
  { title: "Digital Literacy Workshop", date: "April 5, 2026", location: "Rural UP", description: "Hands-on digital skills training for rural women and youth, covering digital tools, financial literacy, and online safety.", upcoming: true },
  { title: "Community Health Camp", date: "May 10, 2026", location: "Block Level, UP", description: "Free health checkups, nutrition counseling, mental health awareness, and referral services for underserved communities.", upcoming: true },
  { title: "World Environment Day Campaign", date: "June 5, 2025", location: "Multiple locations", description: "Tree plantation drive and environmental awareness activities engaging 1,000+ youth volunteers across 5 districts.", upcoming: false },
  { title: "International Youth Day Celebration", date: "August 12, 2025", location: "Lucknow", description: "Panel discussions, workshops, and youth-led project showcases celebrating the role of young people in development.", upcoming: false },
];

const upcomingEvents = events.filter(e => e.upcoming);
const pastEvents = events.filter(e => !e.upcoming);

const Events = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Calendar</p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6">Events</h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl leading-relaxed">
            Join us at upcoming events, workshops, and community activities — or explore highlights from past engagements.
          </p>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-background">
        <div className="container max-w-5xl">
          <div className="mb-10">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Coming Up</p>
            <h2 className="font-heading font-bold text-2xl text-foreground">Upcoming Events</h2>
          </div>
          <div className="space-y-5">
            {upcomingEvents.map((e) => (
              <div key={e.title} className="bg-card rounded-xl border border-border/50 overflow-hidden hover:border-primary/20 hover:shadow-md transition-all duration-300">
                <div className="flex flex-col md:flex-row">
                  <div className="bg-primary/5 p-6 md:w-48 flex flex-col items-center justify-center text-center shrink-0">
                    <Calendar size={20} className="text-primary mb-2" />
                    <p className="font-heading font-bold text-foreground text-sm">{e.date}</p>
                  </div>
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-heading font-bold text-foreground mb-2">{e.title}</h3>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground font-body mb-2">
                          <MapPin size={13} /> {e.location}
                        </p>
                        <p className="font-body text-muted-foreground text-sm leading-relaxed">{e.description}</p>
                      </div>
                      <Button size="sm" className="font-heading font-semibold text-xs shrink-0 hidden md:flex">
                        Register <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Events */}
      <section className="py-16 bg-section-light">
        <div className="container max-w-5xl">
          <div className="mb-10">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Archive</p>
            <h2 className="font-heading font-bold text-2xl text-foreground">Past Events</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pastEvents.map((e) => (
              <div key={e.title} className="bg-card rounded-xl p-6 border border-border/50">
                <h3 className="font-heading font-semibold text-foreground mb-2">{e.title}</h3>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-body mb-2">
                  <span className="flex items-center gap-1"><Calendar size={11} /> {e.date}</span>
                  <span className="flex items-center gap-1"><MapPin size={11} /> {e.location}</span>
                </div>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">{e.description}</p>
              </div>
            ))}
          </div>
          <ShareButtons title="ANUVATI Events" />
        </div>
      </section>
    </Layout>
  );
};

export default Events;
