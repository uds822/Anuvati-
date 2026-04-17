import { useState } from "react";
import { ChevronRight, ArrowLeft, MapPin } from "lucide-react";
import worldMap from "@/assets/maps/world-political.jpg";
import indiaMap from "@/assets/maps/india-political.jpg";
import upMap from "@/assets/maps/up-lucknow.jpg";

type MapLevel = "world" | "india" | "up";

const mapData: Record<MapLevel, { image: string; label: string; caption: string }> = {
  world: {
    image: worldMap,
    label: "World",
    caption: "ANUVATI operates from India — click to zoom into India",
  },
  india: {
    image: indiaMap,
    label: "India",
    caption: "Headquartered in Uttar Pradesh — click to zoom in",
  },
  up: {
    image: upMap,
    label: "Uttar Pradesh",
    caption: "Our headquarters is in Lucknow, the capital of Uttar Pradesh",
  },
};

const MapVisualization = () => {
  const [level, setLevel] = useState<MapLevel>("world");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigateTo = (newLevel: MapLevel) => {
    if (newLevel === level) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setLevel(newLevel);
      setIsTransitioning(false);
    }, 300);
  };

  const breadcrumb: { label: string; level: MapLevel }[] = [
    { label: "World", level: "world" },
    ...(level === "india" || level === "up" ? [{ label: "India" as const, level: "india" as MapLevel }] : []),
    ...(level === "up" ? [{ label: "Uttar Pradesh" as const, level: "up" as MapLevel }] : []),
  ];

  const current = mapData[level];

  return (
    <div className="relative">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        {level !== "world" && (
          <button
            onClick={() => navigateTo(level === "up" ? "india" : "world")}
            className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            <ArrowLeft size={14} className="text-primary" />
          </button>
        )}
        {breadcrumb.map((b, i) => (
          <div key={b.level} className="flex items-center gap-2">
            {i > 0 && <ChevronRight size={12} className="text-muted-foreground" />}
            <button
              onClick={() => navigateTo(b.level)}
              className={`font-body text-xs transition-colors ${
                b.level === level ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {b.label}
            </button>
          </div>
        ))}
      </div>

      {/* Map container */}
      <div
        className={`bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm relative cursor-pointer transition-all duration-300 ${
          isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
        onClick={() => {
          if (level === "world") navigateTo("india");
          else if (level === "india") navigateTo("up");
        }}
      >
        <img
          src={current.image}
          alt={`${current.label} map showing ANUVATI presence`}
          className="w-full h-auto max-h-[500px] object-contain"
        />

        {/* Overlay pin for Lucknow on UP map */}
        {level === "up" && (
          <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-primary/20 shadow-lg">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-primary animate-pulse" />
              <div>
                <p className="font-heading font-bold text-foreground text-sm">ANUVATI Headquarters</p>
                <p className="font-body text-muted-foreground text-xs">Lucknow, Uttar Pradesh</p>
              </div>
            </div>
          </div>
        )}

        {/* Click hint */}
        {level !== "up" && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50 shadow-md">
            <p className="font-body text-muted-foreground text-xs flex items-center gap-1.5">
              <MapPin size={12} className="text-primary" />
              {current.caption}
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          <span className="font-body text-muted-foreground text-xs">Active Operations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary/50" />
          <span className="font-body text-muted-foreground text-xs">Expansion Planned</span>
        </div>
      </div>
    </div>
  );
};

export default MapVisualization;
