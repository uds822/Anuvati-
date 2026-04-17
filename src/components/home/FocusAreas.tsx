import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { sectors } from "@/data/sectors";

// Show a curated subset on the homepage
const HOMEPAGE_SLUGS = ["education", "digital-transformation", "livelihood-entrepreneurship", "gender-inclusion", "healthcare", "environment-clean-energy", "child-protection", "wash", "mental-health"];

const areas = sectors.filter((s) => HOMEPAGE_SLUGS.includes(s.slug));

const FocusAreas = () => {
  return (
    <section className="py-20 bg-section-light">
      <div className="container">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            Multi-Sector Impact
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
            Our Focus Areas
          </h2>
          <p className="font-body text-muted-foreground">
            We are gearing up to work across 26+ development sectors to create holistic, sustainable change in communities.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {areas.map((area) => (
            <Link
              key={area.slug}
              to={`/sector/${area.slug}`}
              className="bg-card rounded-lg border border-border/50 hover:border-primary/20 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
            >
              <div className="relative h-32 overflow-hidden">
                <img src={area.image} alt={area.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <h3 className="font-heading font-semibold text-base text-white">{area.title}</h3>
                </div>
              </div>
              <div className="p-5">
                <p className="font-body text-muted-foreground text-sm leading-relaxed mb-2">{area.description}</p>
                <span className="inline-flex items-center gap-1 text-xs font-heading text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  View Programs <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/our-work">
            <Button variant="outline" className="font-heading font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Explore All Sectors <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FocusAreas;
