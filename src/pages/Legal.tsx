import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Building, FileText, Shield, Download, ExternalLink, Scale, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const registrationDetails = [
  { label: "Legal Name", value: "Anuvati Global Development Foundation" },
  { label: "Type", value: "Section 8 Company (Not-for-Profit)" },
  { label: "CIN", value: "UXXXXX​XX2024NPL​XXXXXX" },
  { label: "Date of Incorporation", value: "XXXX" },
  { label: "Registered Office", value: "Lucknow, Uttar Pradesh, India" },
];

const taxDetails = [
  { label: "12A Registration", value: "XXXXXXXXXXXXX" },
  { label: "80G Registration", value: "XXXXXXXXXXXXX" },
  { label: "PAN", value: "XXXXXXXXXX" },
  { label: "NITI Aayog Darpan ID", value: "UP/2024/XXXXXXX" },
  { label: "FCRA Status", value: "Application in progress" },
];

const policyList = [
  { title: "Safeguarding & PSEAH Policy", description: "Protection from Sexual Exploitation, Abuse and Harassment" },
  { title: "Child Protection Policy", description: "Measures to safeguard children in all programs" },
  { title: "POSH Policy", description: "Prevention of Sexual Harassment at Workplace" },
  { title: "Whistleblower Policy", description: "Confidential reporting of concerns and grievances" },
  { title: "Anti-Fraud & Anti-Corruption Policy", description: "Zero tolerance towards fraud and corrupt practices" },
  { title: "Code of Conduct", description: "Ethical standards for all staff and associates" },
  { title: "Data Protection & Privacy Policy", description: "Handling of personal and sensitive data" },
  { title: "Conflict of Interest Policy", description: "Disclosure and management of conflicts" },
];

const Legal = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
        <div className="container relative z-10">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">About</p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6 leading-tight">
            Legal & Compliance
          </h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl leading-relaxed">
            ANUVATI operates with full transparency and accountability. Access our registration details, statutory documents, and organizational policies here.
          </p>
        </div>
      </section>

      {/* Registration & Tax */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-10">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Legal Status</p>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">Registration & Compliance</h2>
            <p className="font-body text-muted-foreground mt-3 max-w-2xl mx-auto">
              ANUVATI is a Section 8 (Not-for-Profit) Company registered under the Companies Act, 2013, Government of India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                  <Building className="text-primary" size={20} />
                </div>
                <h3 className="font-heading font-semibold text-foreground">Company Information</h3>
              </div>
              <div className="space-y-3">
                {registrationDetails.map((item) => (
                  <div key={item.label} className="flex justify-between items-start gap-4">
                    <span className="font-body text-muted-foreground text-sm shrink-0">{item.label}</span>
                    <span className="font-body text-foreground text-sm text-right font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                  <FileText className="text-secondary" size={20} />
                </div>
                <h3 className="font-heading font-semibold text-foreground">Tax & Registration</h3>
              </div>
              <div className="space-y-3">
                {taxDetails.map((item) => (
                  <div key={item.label} className="flex justify-between items-start gap-4">
                    <span className="font-body text-muted-foreground text-sm shrink-0">{item.label}</span>
                    <span className="font-body text-foreground text-sm text-right font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-accent/50 rounded-xl p-5 text-center">
            <p className="font-body text-muted-foreground text-sm">
              All donations to ANUVATI are eligible for tax exemption under <strong className="text-foreground">Section 80G</strong> of the Income Tax Act, 1961.
              For copies of registration certificates, please{" "}
              <Link to="/contact" className="text-primary font-semibold hover:underline">contact us</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="py-16 md:py-20 bg-section-light">
        <div className="container max-w-5xl">
          <div className="text-center mb-10">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Documents</p>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">Statutory Documents</h2>
            <p className="font-body text-muted-foreground mt-3 max-w-2xl mx-auto">
              Download key registration and compliance documents.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Certificate of Incorporation", icon: Building },
              { title: "12A Registration Certificate", icon: FileText },
              { title: "80G Registration Certificate", icon: FileText },
              { title: "PAN Card", icon: FileText },
              { title: "NITI Aayog Darpan Certificate", icon: FileText },
              { title: "Memorandum of Association", icon: Scale },
            ].map((doc) => (
              <div key={doc.title} className="bg-card rounded-lg p-5 border border-border/50 flex items-start gap-3 hover:border-primary/20 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
                  <doc.icon className="text-primary" size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-heading font-semibold text-foreground text-sm mb-1">{doc.title}</p>
                  <p className="text-xs text-muted-foreground font-body">PDF — Coming soon</p>
                </div>
                <Download size={14} className="text-muted-foreground/50 mt-1 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Policies */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-10">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Governance</p>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">Organizational Policies</h2>
            <p className="font-body text-muted-foreground mt-3 max-w-2xl mx-auto">
              Our policies ensure ethical conduct, safeguarding, and accountability across all operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {policyList.map((policy) => (
              <div key={policy.title} className="bg-card rounded-lg p-5 border border-border/50 hover:border-primary/20 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="text-secondary" size={14} />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-foreground text-sm">{policy.title}</p>
                    <p className="text-xs text-muted-foreground font-body mt-1">{policy.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/docs/ANUVATI_Policy_Manual.docx" download>
              <Button className="font-heading font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                <Download size={16} className="mr-2" /> Download Full Policy Manual
              </Button>
            </a>
            <Link to="/policies">
              <Button variant="outline" className="font-heading font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View All Policies <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Reporting */}
      <section className="py-16 bg-primary">
        <div className="container text-center max-w-3xl">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary-foreground mb-4">
            Report a Concern
          </h2>
          <p className="font-body text-primary-foreground/80 max-w-xl mx-auto mb-6">
            ANUVATI maintains confidential reporting channels for safeguarding, ethics, and grievance concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:safeguarding@anuvati.org">
              <Button size="lg" className="font-heading font-semibold px-8 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                safeguarding@anuvati.org
              </Button>
            </a>
            <a href="mailto:concerns@anuvati.org">
              <Button size="lg" variant="outline" className="font-heading font-semibold px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                concerns@anuvati.org
              </Button>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Legal;
