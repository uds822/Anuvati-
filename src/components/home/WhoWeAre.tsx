import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import communityImg from "@/assets/community-impact.jpg";

const WhoWeAre = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">
              Who We Are
            </p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-6 leading-tight">
              People-First Development,
              <br />Powered by Youth.
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-4">
              ANUVATI — <strong className="text-foreground">Accelerating Nurturing Unified Vision & Action Towards Impact</strong> — is a newly launched youth-led development initiative committed to advancing inclusive, resilient, and sustainable societies.
            </p>
            <p className="font-body text-muted-foreground leading-relaxed mb-8">
              We believe in participation, not charity. In measurable outcomes over intentions. We are preparing to launch multi-sector programs spanning education, health, digital inclusion, child protection, and 26+ other development areas in the coming months.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {["Youth-Led", "Community-Driven", "Transparent", "Multi-Sector", "SDG-Aligned"].map((tag) => (
                <span key={tag} className="text-xs font-heading font-semibold uppercase tracking-wider text-primary bg-accent px-4 py-2 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <Link to="/about">
              <Button variant="outline" className="font-heading font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Learn More About Us <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
          <div className="relative">
            <img
              src={communityImg}
              alt="ANUVATI youth volunteers collaborating in community development"
              className="w-full rounded-lg shadow-lg object-cover aspect-[4/3]"
              loading="lazy"
            />
            <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground rounded-lg p-5 shadow-lg hidden md:block">
              <p className="font-heading font-bold text-2xl">26+</p>
              <p className="font-body text-primary-foreground/80 text-xs">Development Sectors</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
