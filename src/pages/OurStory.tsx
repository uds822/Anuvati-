import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const timeline = [
  { year: "Foundation", title: "The Spark", description: "A group of passionate young development practitioners, educators, and community leaders came together to bridge the gap between grassroots reality and institutional capacity." },
  { year: "Vision", title: "Building the Framework", description: "ANUVATI developed its multi-sector approach, comprehensive policy framework, and governance structure — laying the foundation for scalable, ethical development work." },
  { year: "Growth", title: "Programs Take Shape", description: "Launch of flagship programs in education, digital literacy, health, and community development across multiple districts in Uttar Pradesh." },
  { year: "Impact", title: "Expanding Reach", description: "Building strategic partnerships with CSR bodies, academic institutions, and government agencies to amplify community impact across India." },
  { year: "Future", title: "Global Ambition", description: "Multi-state expansion, international collaboration readiness, and a vision to reach 10,000+ youth across inclusive, resilient communities worldwide." },
];

const OurStory = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Origin</p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6">Our Story</h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl leading-relaxed">
            From a grassroots idea to a growing global movement — the journey of ANUVATI is rooted in the belief that youth-led action can drive lasting community transformation.
          </p>
        </div>
      </section>

      {/* Narrative */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              ANUVATI was born from a simple yet powerful belief — that young people, when given the right tools, mentorship, and platforms, can drive meaningful and lasting change in communities across the world.
            </p>
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              Founded in 2026 by a group of passionate young leaders, ANUVATI began as a grassroots initiative focused on bridging the gap between vision and action in sustainable development. What started as local community projects is now growing into a structured, multi-sector organization uniting youth from diverse backgrounds under a shared commitment to impact.
            </p>
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              Our name — <strong className="text-foreground">A</strong>ccelerating <strong className="text-foreground">N</strong>urturing <strong className="text-foreground">U</strong>nified <strong className="text-foreground">V</strong>ision & <strong className="text-foreground">A</strong>ction <strong className="text-foreground">T</strong>owards <strong className="text-foreground">I</strong>mpact — reflects our core philosophy: that real progress happens when vision is paired with purposeful, collective action.
            </p>
            <p className="font-body text-muted-foreground leading-relaxed">
              Today, ANUVATI works across 26+ development sectors including education, health, climate action, gender equality, digital inclusion, and community resilience — always with youth at the forefront of every initiative.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-20 bg-section-light">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Journey</p>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">Our Journey</h2>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <div key={item.year} className={`flex flex-col md:flex-row gap-6 md:gap-12 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                  <div className={`flex-1 ${i % 2 === 1 ? "md:text-right" : ""}`}>
                    <div className="bg-card rounded-xl p-6 border border-border/50 hover:border-primary/20 transition-colors">
                      <span className="text-xs font-heading font-bold text-primary uppercase tracking-wider">{item.year}</span>
                      <h3 className="font-heading font-bold text-foreground text-lg mt-2 mb-2">{item.title}</h3>
                      <p className="font-body text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-primary border-4 border-background" />
                  </div>
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container text-center max-w-2xl">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-4">
            Be Part of Our Story
          </h2>
          <p className="font-body text-muted-foreground mb-8">
            Whether as a volunteer, partner, or supporter — your contribution helps write the next chapter.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/get-involved">
              <Button className="font-heading font-semibold bg-primary hover:bg-primary/90 px-8">
                Join the Movement <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" className="font-heading font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8">
                About ANUVATI
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OurStory;
