import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="py-20 bg-primary">
      <div className="container text-center">
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary-foreground mb-4 leading-tight">
          Be Part of the Movement.
        </h2>
        <p className="font-body text-primary-foreground/80 max-w-xl mx-auto mb-10 text-lg">
          We are just getting started. Join us as we prepare to build inclusive, resilient, and future-ready communities across India.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/get-involved">
            <Button size="lg" className="font-heading font-semibold px-8 bg-secondary text-secondary-foreground hover:bg-secondary/90 motion-button">
              <ArrowRight size={18} className="mr-2" />
              Get Involved
            </Button>
          </Link>
          <Link to="/partners">
            <Button size="lg" variant="outline" className="font-heading font-semibold px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              Partner With Us
            </Button>
          </Link>
          <Link to="/donate">
            <Button size="lg" variant="outline" className="font-heading font-semibold px-8 border-secondary/50 text-secondary hover:bg-secondary/10">
              <Heart size={16} className="mr-2" />
              Donate
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
