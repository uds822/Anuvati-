import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Clock, Send, Linkedin, Youtube, Twitter, Instagram, Facebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const socialLinks = [
  { label: "LinkedIn", href: "https://linkedin.com/company/anuvati", icon: Linkedin },
  { label: "Instagram", href: "https://instagram.com/anuvati", icon: Instagram },
  { label: "Facebook", href: "https://facebook.com/anuvati", icon: Facebook },
  { label: "YouTube", href: "https://youtube.com/@anuvati", icon: Youtube },
  { label: "X (Twitter)", href: "https://x.com/anuvati", icon: Twitter },
];

const contactChannels = [
  { icon: Mail, title: "Email", detail: "contact@anuvati.org", href: "mailto:contact@anuvati.org", description: "For general inquiries and information requests." },
  { icon: Phone, title: "WhatsApp", detail: "Connect on WhatsApp", href: "https://wa.me/919999999999", description: "Quick responses during business hours." },
  { icon: MapPin, title: "Location", detail: "Lucknow, Uttar Pradesh, India", href: "", description: "Headquarters and primary operations base." },
  { icon: Clock, title: "Working Hours", detail: "Mon–Fri, 10:00 AM – 6:00 PM IST", href: "", description: "We respond to messages within 24 hours." },
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast({ title: "Message Sent", description: "Thank you. We will respond within 24 hours." });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitting(false);
    }, 500);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Reach Out</p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6">Contact Us</h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl leading-relaxed">
            Have a question, partnership inquiry, or want to get involved? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Channels */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {contactChannels.map((ch) => (
              <div key={ch.title} className="bg-card rounded-xl p-6 border border-border/50 text-center hover:border-primary/20 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center mx-auto mb-4">
                  <ch.icon className="text-primary" size={22} />
                </div>
                <h3 className="font-heading font-semibold text-foreground text-sm mb-1">{ch.title}</h3>
                {ch.href ? (
                  <a href={ch.href} target={ch.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-primary text-sm font-body hover:underline">
                    {ch.detail}
                  </a>
                ) : (
                  <p className="text-foreground text-sm font-body">{ch.detail}</p>
                )}
                <p className="text-muted-foreground text-xs font-body mt-2">{ch.description}</p>
              </div>
            ))}
          </div>

          {/* Form + Info */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-2">Send Us a Message</h2>
              <p className="font-body text-muted-foreground text-sm mb-6">Fill in the form below and we'll get back to you within 24 hours.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-heading font-medium text-foreground mb-1.5 block">Full Name *</label>
                    <Input placeholder="Your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required maxLength={100} />
                  </div>
                  <div>
                    <label className="text-xs font-heading font-medium text-foreground mb-1.5 block">Email Address *</label>
                    <Input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required maxLength={255} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-heading font-medium text-foreground mb-1.5 block">Subject *</label>
                  <Input placeholder="What is this regarding?" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required maxLength={200} />
                </div>
                <div>
                  <label className="text-xs font-heading font-medium text-foreground mb-1.5 block">Message *</label>
                  <Textarea placeholder="Tell us more about your inquiry..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required maxLength={1000} rows={5} />
                </div>
                <Button type="submit" className="font-heading font-semibold bg-primary hover:bg-primary/90" disabled={submitting}>
                  <Send size={16} className="mr-2" />
                  {submitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-8">
              {/* Specific emails */}
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-4">Department Contacts</h3>
                <div className="space-y-3">
                  {[
                    { label: "General Inquiries", email: "contact@anuvati.org" },
                    { label: "Partnerships & CSR", email: "partnerships@anuvati.org" },
                    { label: "Volunteer Program", email: "volunteer@anuvati.org" },
                    { label: "Safeguarding", email: "safeguarding@anuvati.org" },
                  ].map((dept) => (
                    <div key={dept.label} className="bg-section-light rounded-lg p-3">
                      <p className="font-heading text-xs font-semibold text-foreground">{dept.label}</p>
                      <a href={`mailto:${dept.email}`} className="text-primary text-xs font-body hover:underline">{dept.email}</a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-4">Follow Us</h3>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors"
                      aria-label={s.label}
                    >
                      <s.icon size={16} strokeWidth={1.5} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
