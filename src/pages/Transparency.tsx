import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, FileText, Download, Eye, BarChart3, Scale } from "lucide-react";

const commitments = [
  { icon: Eye, title: "Full Transparency", description: "Complete disclosure of finances, operations, and governance to all stakeholders." },
  { icon: BarChart3, title: "Impact Measurement", description: "Rigorous monitoring and evaluation of all programs with published outcomes." },
  { icon: Scale, title: "Ethical Governance", description: "Independent oversight, board review, and separation of governance and management." },
  { icon: Shield, title: "Safeguarding", description: "Zero tolerance for exploitation, abuse, or harassment across all operations." },
];

const Transparency = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Trust</p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6">Transparency & Governance</h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl leading-relaxed">
            Accountability and transparency are the foundation of everything we do. We believe our stakeholders deserve complete visibility into how we operate and how resources are utilized.
          </p>
        </div>
      </section>

      {/* Commitments */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {commitments.map((c) => (
              <div key={c.title} className="bg-card rounded-xl p-7 border border-border/50 text-center hover:border-primary/20 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center mx-auto mb-4">
                  <c.icon className="text-primary" size={24} />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2 text-sm">{c.title}</h3>
                <p className="font-body text-muted-foreground text-xs leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="py-16 bg-section-light">
        <div className="container max-w-4xl space-y-10">
          <div>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-4">Legal Registration</h2>
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <p className="font-body text-muted-foreground text-sm leading-relaxed">
                Anuvati Global Development Initiative is registered under applicable laws. Registration details and compliance certificates will be made available here upon publication.
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-4">Governance Commitment</h2>
            <p className="font-body text-muted-foreground leading-relaxed">
              ANUVATI adheres to the highest standards of governance, with clear separation of governance and management, independent oversight, and regular board review. Our governance structure ensures accountability at every level of the organization.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-4">Financial Accountability</h2>
            <p className="font-body text-muted-foreground leading-relaxed">
              All financial transactions are subject to internal controls, external audit, and board-approved budgets. We maintain complete transparency in fund utilization and publish detailed financial reports.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-4">Reporting & Compliance</h2>
            <p className="font-body text-muted-foreground leading-relaxed">
              We publish annual reports, impact assessments, and financial statements. All statutory filings are completed on time. Our commitment to compliance extends across all operational and programmatic activities.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-4">Annual Reports</h2>
            <div className="bg-card rounded-xl p-8 border border-border/50 flex flex-col items-center justify-center text-center">
              <Download size={32} className="text-muted-foreground/30 mb-3" />
              <p className="font-body text-muted-foreground text-sm mb-4">Annual reports will be available for download here once published.</p>
              <Link to="/policies">
                <Button variant="outline" className="font-heading font-semibold text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <FileText size={14} className="mr-1" /> View Policy Library
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-background">
        <div className="container text-center max-w-2xl">
          <p className="font-body text-muted-foreground mb-4">
            Questions about our governance or transparency practices?
          </p>
          <Link to="/contact">
            <Button variant="outline" className="font-heading font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Contact Us <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Transparency;
