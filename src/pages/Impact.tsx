import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Rocket, Target, Users, MapPin, Calendar } from "lucide-react";

const plannedMilestones = [
  { icon: Users, label: "Youth volunteers to recruit", target: "100+" },
  { icon: Target, label: "Programs to launch", target: "4+" },
  { icon: MapPin, label: "Starting location", target: "Lucknow, UP" },
  { icon: Calendar, label: "First programs expected", target: "Mid 2026" },
];

const Impact = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Impact</p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6">Our Impact Vision</h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl leading-relaxed">
            ANUVATI is a newly launched initiative. We are currently in our foundational phase — building teams, designing programs, and establishing partnerships. Our impact story is yet to begin, and we are committed to measuring and sharing it transparently.
          </p>
        </div>
      </section>

      {/* Planned Milestones */}
      <section className="py-16 bg-section-dark">
        <div className="container">
          <div className="text-center mb-10">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Roadmap</p>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-section-dark-foreground">What We're Working Towards</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {plannedMilestones.map((s) => (
              <div key={s.label} className="text-center bg-section-dark-foreground/5 rounded-xl p-6">
                <s.icon className="text-secondary mx-auto mb-3" size={24} />
                <p className="font-heading font-bold text-3xl text-section-dark-foreground mb-1">{s.target}</p>
                <p className="font-body text-section-dark-foreground/60 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Honest Status */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Rocket size={28} className="text-primary" />
            </div>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-4">We're Just Getting Started</h2>
            <p className="font-body text-muted-foreground leading-relaxed">
              As an organization founded in 2026, we do not yet have case studies, beneficiary testimonials, or program outcomes to share. We believe in transparency and will only publish real, verified impact data once our programs are operational.
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border/50 p-8 text-center">
            <p className="font-heading font-semibold text-foreground mb-2">What to expect in the coming months:</p>
            <ul className="font-body text-muted-foreground text-sm space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                Launch of first community programs in Lucknow
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                Partnerships with CSR, academic, and government bodies
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                First cohort of youth volunteers onboarded
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                Real impact data published on this page
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Annual Reports */}
      <section className="py-16 bg-section-light">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Transparency</p>
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4">Annual Reports</h2>
              <p className="font-body text-muted-foreground text-sm leading-relaxed mb-6">
                We believe in complete transparency. Annual reports detailing program outcomes, financial stewardship, and future plans will be available for download here once published.
              </p>
              <Link to="/transparency">
                <Button variant="outline" className="font-heading font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  View Transparency Page <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
            <div className="bg-card rounded-xl p-8 flex flex-col items-center justify-center text-center border border-border/50">
              <Download size={32} className="text-muted-foreground/30 mb-3" />
              <p className="font-body text-muted-foreground text-sm">Annual reports will be available once our first operational year concludes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="container text-center">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary-foreground mb-4">
            Help Us Build This From the Ground Up
          </h2>
          <p className="font-body text-primary-foreground/80 max-w-xl mx-auto mb-8">
            As a founding supporter, your involvement will directly shape the impact we create together.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/get-involved">
              <Button size="lg" className="font-heading font-semibold px-8 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                Get Involved <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link to="/donate">
              <Button size="lg" variant="outline" className="font-heading font-semibold px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Support Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Impact;
