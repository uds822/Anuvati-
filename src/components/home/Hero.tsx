import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroLandscape from "@/assets/hero-landscape.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroLandscape})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/75 to-foreground/40" />

      <div className="relative z-10 container px-4 py-24">
        <div className="max-w-2xl">
          <span className="inline-block font-heading text-secondary font-semibold text-xs uppercase tracking-[0.25em] mb-5 animate-fade-in">
            A Youth-Led Global Development Initiative
          </span>
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-6 leading-[1.1] animate-hero-text">
            Turning Vision
            <br />
            Into <span className="text-secondary">Impact.</span>
          </h1>
          <p className="font-body text-primary-foreground/80 text-lg md:text-xl max-w-xl mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
            A newly launched initiative preparing to build inclusive, resilient, and future-ready communities through youth leadership and multi-sector programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Link to="/get-involved">
              <Button size="lg" className="font-heading font-semibold text-base px-8 bg-secondary text-secondary-foreground hover:bg-secondary/90 motion-button">
                Join the Movement
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link to="/partners">
              <Button size="lg" variant="outline" className="font-heading font-semibold text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Partner With Us
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-24 lg:bottom-auto left-1/2 -translate-x-1/2 z-10 animate-bounce hidden md:block lg:hidden">
        <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-primary-foreground/60 rounded-full" />
        </div>
      </div>

      {/* Floating stat badges */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 -mb-px">
            {[
              { stat: "26+", label: "Planned Sectors" },
              { stat: "2026", label: "Founded" },
              { stat: "Youth-Led", label: "Initiative" },
              { stat: "Lucknow", label: "Headquarters" },
            ].map((item, i) => (
              <div
                key={i}
                className={`py-4 lg:py-5 px-4 lg:px-6 text-center border-t border-primary-foreground/10 ${
                  i === 0 ? "bg-primary" : i === 1 ? "bg-primary/95" : i === 2 ? "bg-primary/90" : "bg-primary/85"
                }`}
              >
                <p className="font-heading font-bold text-lg lg:text-xl text-primary-foreground">{item.stat}</p>
                <p className="font-body text-primary-foreground/70 text-[10px] lg:text-xs mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
