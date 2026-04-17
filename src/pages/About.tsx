import Layout from "@/components/layout/Layout";
import { Check, ArrowRight, Target, Eye, Heart, Users, Building, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import communityImg from "@/assets/community-impact.jpg";

const values = [
  { icon: Users, label: "People-centered development" },
  { icon: Heart, label: "Youth leadership and agency" },
  { icon: Eye, label: "Transparency and accountability" },
  { icon: Target, label: "Evidence-based approach" },
  { icon: Check, label: "Inclusivity and equity" },
  { icon: Check, label: "Sustainability and resilience" },
  { icon: Check, label: "Collaborative partnerships" },
  { icon: Check, label: "Innovation with purpose" },
];

const goals = [
  "Reach 10,000+ youth across multiple states",
  "Build 50+ institutional partnerships",
  "Establish presence in 5+ Indian states",
  "Create replicable, scalable development models",
  "Achieve full financial transparency and annual reporting",
  "Expand to international collaboration and funding readiness",
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
        <div className="container relative z-10">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">About</p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6 leading-tight">
            About ANUVATI
          </h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl leading-relaxed">
            A Youth-Led Global Development Initiative committed to advancing inclusive, resilient, and sustainable societies through community-driven action and evidence-based programs.
          </p>
        </div>
      </section>

      {/* Story + Image */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Our Story</p>
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-6">
                From Grassroots Vision to Global Movement
              </h2>
              <p className="font-body text-muted-foreground leading-relaxed mb-4">
                Founded in 2026, ANUVATI was built on a fundamental belief: the greatest untapped resource for global development is the energy, creativity, and commitment of young people. Rather than treating communities as beneficiaries, we see them as partners and protagonists of their own transformation.
              </p>
              <p className="font-body text-muted-foreground leading-relaxed mb-6">
                Born from conversations between young development practitioners, educators, and community leaders, ANUVATI emerged to bridge the gap between grassroots reality and institutional capacity — creating a platform where youth-led action meets evidence-based planning.
              </p>
              <Link to="/our-story">
                <Button variant="outline" className="font-heading font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Read Our Full Story <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img
                src={communityImg}
                alt="ANUVATI community engagement"
                className="w-full rounded-lg shadow-lg object-cover aspect-[4/3]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Name Meaning */}
      <section className="py-16 md:py-20 bg-section-light">
        <div className="container max-w-4xl text-center">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">The Name</p>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-6">The Meaning of "Anuvati"</h2>
          <p className="font-body text-muted-foreground leading-relaxed mb-4 max-w-2xl mx-auto">
            <strong className="text-foreground">Anu</strong> signifies continuity, and <strong className="text-foreground">Vati</strong> means to embody or carry forward. Together, Anuvati represents the continuous embodiment of collective progress.
          </p>
          <div className="inline-block bg-card rounded-lg px-8 py-5 border border-border/50 mt-2">
            <p className="font-heading font-bold text-primary text-sm tracking-wide">
              Accelerating Nurturing Unified Vision & Action Towards Impact
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl p-8 border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center mb-5">
                <Eye className="text-primary" size={24} />
              </div>
              <h2 className="font-heading font-bold text-xl text-foreground mb-4">Our Vision</h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                A world where every community is inclusive, resilient, and future-ready — where development is driven by participation, not charity, and measured by lasting impact.
              </p>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border/50">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-5">
                <Target className="text-secondary" size={24} />
              </div>
              <h2 className="font-heading font-bold text-xl text-foreground mb-4">Our Mission</h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                To advance inclusive and sustainable development through youth-led action, multi-sector programming, strategic partnerships, and evidence-based impact across India and beyond.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 md:py-20 bg-section-light">
        <div className="container max-w-5xl">
          <div className="text-center mb-10">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Principles</p>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((v) => (
              <div key={v.label} className="flex items-center gap-3 bg-card rounded-lg p-4 border border-border/50">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <v.icon size={14} className="text-secondary" />
                </div>
                <span className="font-body text-foreground text-sm">{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Goals */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-4xl">
          <div className="text-center mb-10">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Ambition</p>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">Long-Term Strategic Goals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g, i) => (
              <div key={i} className="flex items-start gap-4 bg-card rounded-lg p-5 border border-border/50 hover:border-primary/20 transition-colors">
                <span className="font-heading font-bold text-primary text-lg shrink-0">0{i + 1}</span>
                <span className="font-body text-foreground text-sm">{g}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal & Compliance Link */}
      <section className="py-12 md:py-16 bg-section-light">
        <div className="container max-w-4xl text-center">
          <div className="bg-card rounded-xl p-8 border border-border/50">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center">
                <Scale className="text-primary" size={20} />
              </div>
              <h2 className="font-heading font-bold text-xl text-foreground">Legal & Compliance</h2>
            </div>
            <p className="font-body text-muted-foreground text-sm mb-5 max-w-lg mx-auto">
              ANUVATI is a Section 8 (Not-for-Profit) Company registered under the Companies Act, 2013. Access registration details, statutory documents, and organizational policies.
            </p>
            <Link to="/legal">
              <Button className="font-heading font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                View Legal & Compliance <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Founder + Advisory */}
      <section className="py-16 md:py-20 bg-section-light">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Leadership</p>
              <h2 className="font-heading font-bold text-2xl text-foreground mb-5">Founder's Message</h2>
              <div className="bg-card rounded-xl p-7 border border-border/50">
                <p className="font-body text-muted-foreground leading-relaxed italic mb-4">
                  "Development begins with people and returns to people. ANUVATI exists to prove that youth-led action, guided by evidence and ethics, can transform communities at scale."
                </p>
                <p className="font-heading font-semibold text-foreground text-sm">— Founder, ANUVATI</p>
              </div>
            </div>
            <div>
              <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Governance</p>
              <h2 className="font-heading font-bold text-2xl text-foreground mb-5">Advisory Board</h2>
              <div className="space-y-3">
                {["Advisor — Sustainable Development", "Advisor — Youth Policy & Advocacy", "Advisor — Education & Research", "Advisor — Public Health"].map((m) => (
                  <div key={m} className="bg-card rounded-lg p-4 border border-border/50">
                    <p className="font-heading font-semibold text-foreground text-sm">{m}</p>
                    <p className="text-xs text-muted-foreground font-body">Role / Designation</p>
                  </div>
                ))}
              </div>
              <Link to="/our-team" className="inline-flex items-center gap-1 text-primary text-sm font-heading font-semibold mt-4 hover:gap-2 transition-all">
                Meet the Full Team <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="container text-center">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary-foreground mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="font-body text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Join ANUVATI as a volunteer, partner, or supporter and be part of a movement that's changing communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/get-involved">
              <Button size="lg" className="font-heading font-semibold px-8 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                Get Involved <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link to="/partners">
              <Button size="lg" variant="outline" className="font-heading font-semibold px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Partner With Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
