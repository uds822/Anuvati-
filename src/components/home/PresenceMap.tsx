import { useRef } from "react";
import { MapPin, Users, BookOpen, Handshake, Building, TrendingUp, Globe } from "lucide-react";
import MapVisualization from "./MapVisualization";

const impactStats = [
  { icon: Users, value: "Growing", label: "Youth Network" },
  { icon: BookOpen, value: "26+", label: "Planned Sectors" },
  { icon: Handshake, value: "Building", label: "Partnerships" },
  { icon: MapPin, value: "Lucknow", label: "Starting Base" },
];

const infoCards = [
  { icon: Building, title: "Headquarters", desc: "Lucknow, Uttar Pradesh — our central hub for operations and strategy." },
  { icon: MapPin, title: "Planned Regions", desc: "Preparing to launch programs across multiple districts in UP." },
  { icon: TrendingUp, title: "Expansion Roadmap", desc: "Upcoming phases: Delhi, Varanasi, and more states." },
  { icon: Globe, title: "Global Vision", desc: "Working towards an international youth changemaker network." },
];

const PresenceMap = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="py-20 md:py-28 bg-background overflow-hidden">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            Where We Work
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
            Our Impact Across Communities
          </h2>
          <p className="font-body text-muted-foreground leading-relaxed">
            ANUVATI is headquartered in Lucknow and preparing to expand its community programs across Uttar Pradesh and beyond.
            Click on the map to explore our planned areas of operation.
          </p>
        </div>

        {/* Impact stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-3xl mx-auto">
          {impactStats.map((s) => (
            <div key={s.label} className="bg-card rounded-xl p-4 border border-border/50 text-center">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <s.icon className="text-primary" size={18} />
              </div>
              <p className="font-heading font-bold text-foreground text-lg">{s.value}</p>
              <p className="font-body text-muted-foreground text-[11px]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Interactive Map */}
        <div className="mb-12">
          <MapVisualization />
          <p className="text-center mt-5 font-body text-muted-foreground text-sm italic">
            Starting in Lucknow, expanding across India.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {infoCards.map((item) => (
            <div
              key={item.title}
              className="bg-card rounded-xl p-5 border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                <item.icon className="text-primary" size={20} />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-1.5 text-sm">{item.title}</h3>
              <p className="font-body text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PresenceMap;
