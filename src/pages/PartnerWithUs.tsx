import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const models = [
  { title: "CSR Project Partnership", description: "Collaborate on SDG-aligned projects with measurable outcomes and transparent reporting." },
  { title: "Institutional Collaboration", description: "Co-create programs with academic institutions, think tanks, and development organizations." },
  { title: "Government Program Support", description: "Support government schemes with grassroots implementation capacity." },
  { title: "International Funding Readiness", description: "Structured proposals, compliance frameworks, and impact reporting for global donors." },
  { title: "Campus & Volunteer Partnership", description: "Engage student volunteers and campus ambassadors in development programs." },
];

const whyPartner = [
  "SDG-aligned, multi-sector programming",
  "Transparent governance and reporting",
  "Scalable, replicable project models",
  "Grassroots implementation capacity",
  "Data-driven monitoring and evaluation",
  "Youth volunteer network for execution",
  "Strong safeguarding and ethics framework",
];

const PartnerWithUs = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", organization: "", email: "", type: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Inquiry Submitted", description: "Thank you for your interest. We will respond within 48 hours." });
    setFormData({ name: "", organization: "", email: "", type: "", message: "" });
  };

  return (
    <Layout>
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <p className="font-heading text-secondary font-semibold text-sm uppercase tracking-widest mb-3">Collaborate</p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6">Partner With ANUVATI</h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl">Strategic partnerships that create measurable, lasting impact.</p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container max-w-4xl">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-8">Why Partner With Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {whyPartner.map((p) => (
              <div key={p} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <Check size={14} className="text-secondary" />
                </div>
                <span className="font-body text-foreground text-sm">{p}</span>
              </div>
            ))}
          </div>

          <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-8">Partnership Models</h2>
          <div className="space-y-4 mb-12">
            {models.map((m) => (
              <div key={m.title} className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-heading font-semibold text-foreground mb-2">{m.title}</h3>
                <p className="font-body text-muted-foreground text-sm">{m.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-section-light rounded-lg p-8">
            <h2 className="font-heading font-bold text-2xl text-foreground mb-6">Partnership Inquiry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input placeholder="Organization Name" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} required maxLength={100} />
                <Input placeholder="Contact Person" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required maxLength={100} />
              </div>
              <Input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required maxLength={255} />
              <Textarea placeholder="Tell us about your partnership interest..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required maxLength={1000} rows={5} />
              <Button type="submit" className="font-heading font-semibold bg-gradient-to-r from-primary to-primary/80">Submit Inquiry</Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PartnerWithUs;
