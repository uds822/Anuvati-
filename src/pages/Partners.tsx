import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Building, GraduationCap, Landmark, Users, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const partnerCategories = [
  { icon: Building, name: "CSR Partners", description: "Corporate partners fulfilling CSR mandates through impactful, SDG-aligned programs with measurable outcomes." },
  { icon: Landmark, name: "Government Partners", description: "Government bodies collaborating on development schemes with grassroots implementation capacity." },
  { icon: GraduationCap, name: "Academic Partners", description: "Universities and educational institutions for research, student volunteering, and internship partnerships." },
  { icon: Users, name: "Community Partners", description: "Grassroots organizations and community-based groups co-creating local development solutions." },
  { icon: Globe, name: "International Agencies", description: "Global development organizations for knowledge exchange, funding, and joint programming." },
];

const models = [
  { title: "CSR Project Partnership", description: "SDG-aligned projects with transparent reporting and measurable outcomes." },
  { title: "Institutional Collaboration", description: "Co-create programs with academic institutions and development organizations." },
  { title: "Government Program Support", description: "Grassroots implementation support for government development schemes." },
  { title: "Campus & Volunteer Partnership", description: "Engage student volunteers and campus ambassadors in development programs." },
  { title: "Global Donor Partnership", description: "Structured proposals, compliance frameworks, and impact reporting." },
];

const Partners = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", organization: "", email: "", type: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Inquiry Submitted", description: "Thank you for your interest. We will respond within 48 hours." });
    setFormData({ name: "", organization: "", email: "", type: "", message: "" });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Network</p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6">Our Partners</h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl leading-relaxed">
            Strategic alliances across sectors that amplify our impact and drive sustainable development outcomes.
          </p>
        </div>
      </section>

      {/* Why Partner With ANUVATI */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-10">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Why Us</p>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-4">Why Partner With ANUVATI?</h2>
            <p className="font-body text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Whether you are a corporate house fulfilling CSR mandates, a government body seeking grassroots implementation support, an academic institution looking for meaningful field engagement, a community organization scaling local solutions, or an international agency driving global development goals — ANUVATI offers a partnership built on trust, transparency, and measurable impact.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "SDG-Aligned Programming", desc: "Every project maps directly to the UN Sustainable Development Goals with clear indicators and outcomes." },
              { title: "Transparent Governance", desc: "Rigorous financial reporting, compliance frameworks, and open documentation ensure full accountability." },
              { title: "Grassroots Reach", desc: "Deep community networks across Uttar Pradesh enable authentic, ground-level implementation at scale." },
              { title: "Youth-Powered Execution", desc: "A dedicated volunteer and campus ambassador network brings energy, innovation, and local knowledge to every initiative." },
              { title: "Data-Driven Impact", desc: "Robust monitoring and evaluation systems provide real-time insights and evidence-based reporting to all stakeholders." },
              { title: "Scalable & Replicable Models", desc: "Our program frameworks are designed to be adapted, scaled, and replicated across geographies and sectors." },
            ].map((item) => (
              <div key={item.title} className="bg-card rounded-xl p-6 border border-border/50">
                <h3 className="font-heading font-semibold text-foreground text-sm mb-2">{item.title}</h3>
                <p className="font-body text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Categories */}
      <section className="py-16 md:py-20 bg-section-light">
        <div className="container">
          <div className="text-center mb-12">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Categories</p>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">Partnership Ecosystem</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerCategories.map((cat) => (
              <div key={cat.name} className="bg-card rounded-xl p-7 border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center mb-5">
                  <cat.icon className="text-primary" size={24} />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-2">{cat.name}</h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Models */}
      <section className="py-16 bg-section-light">
        <div className="container max-w-5xl">
          <div className="text-center mb-10">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Collaborate</p>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">Partnership Models</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {models.map((m) => (
              <div key={m.title} className="bg-card rounded-xl p-6 border border-border/50 text-center">
                <h3 className="font-heading font-semibold text-foreground text-sm mb-2">{m.title}</h3>
                <p className="font-body text-muted-foreground text-xs leading-relaxed">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Inquiry Form */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-4xl">
          <div className="bg-section-light rounded-xl p-8 md:p-10">
            <div className="text-center mb-8">
              <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Get Started</p>
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-2">Partnership Inquiry</h2>
              <p className="font-body text-muted-foreground text-sm">Interested in collaborating? Fill out the form and our team will get back to you within 48 hours.</p>
            </div>
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

export default Partners;
