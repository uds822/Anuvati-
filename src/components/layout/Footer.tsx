import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Linkedin, Youtube, Instagram, Facebook, ArrowRight } from "lucide-react";
import logoFinal from "@/assets/logo-final.png";

const XIcon = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socialLinks = [
  { label: "LinkedIn", href: "https://linkedin.com/company/anuvati", icon: Linkedin },
  { label: "YouTube", href: "https://youtube.com/@anuvati", icon: Youtube },
  { label: "X", href: "https://x.com/anuvati", icon: XIcon as any },
  { label: "Instagram", href: "https://instagram.com/anuvati", icon: Instagram },
  { label: "Facebook", href: "https://facebook.com/anuvati", icon: Facebook },
];

const Footer = () => {
  return (
    <footer className="bg-section-dark text-section-dark-foreground">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand + Registration */}
          <div>
            <div className="mb-4">
              <img
                src={logoFinal}
                alt="ANUVATI - Global Development Initiative"
                className="h-12 sm:h-14 w-auto brightness-0 invert"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
                loading="lazy"
              />
            </div>
            <p className="text-section-dark-foreground/60 text-sm font-body leading-relaxed mb-4">
              A youth-led global development initiative building inclusive, resilient, and future-ready communities.
            </p>
            <div className="flex gap-3 mb-4">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-section-dark-foreground/10 flex items-center justify-center text-section-dark-foreground/60 hover:text-primary hover:bg-section-dark-foreground/20 transition-all duration-200"
                  aria-label={s.label}
                >
                  <s.icon size={18} strokeWidth={1.5} />
                </a>
              ))}
            </div>
            <p className="text-[11px] font-body text-section-dark-foreground/40 border-t border-section-dark-foreground/10 pt-3 leading-relaxed">
              Section 8 (Not-for-Profit) Company registered under the Companies Act, 2013, Government of India.{" "}
              <Link to="/legal" className="text-section-dark-foreground/60 hover:text-section-dark-foreground underline underline-offset-2 transition-colors">
                View Legal & Compliance →
              </Link>
            </p>
          </div>

          {/* Organization */}
          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider mb-5 text-section-dark-foreground/80">Organization</h4>
            <ul className="space-y-2.5">
              {[
                { label: "About ANUVATI", path: "/about" },
                { label: "Our Story", path: "/our-story" },
                { label: "Our Work", path: "/our-work" },
                { label: "Programs", path: "/programs" },
                { label: "Impact", path: "/impact" },
                { label: "Our Team", path: "/our-team" },
                { label: "Governance", path: "/governance" },
                { label: "HR Admin", path: "/hr" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-section-dark-foreground/50 hover:text-section-dark-foreground text-sm font-body transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Engage */}
          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider mb-5 text-section-dark-foreground/80">Engage</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Get Involved", path: "/get-involved" },
                { label: "Donate", path: "/donate" },
                { label: "Partners", path: "/partners" },
                { label: "Events", path: "/events" },
                { label: "Campaigns", path: "/campaigns" },
                { label: "Blog", path: "/blog" },
                { label: "Contact", path: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-section-dark-foreground/50 hover:text-section-dark-foreground text-sm font-body transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider mb-5 text-section-dark-foreground/80">Contact</h4>
            <div className="space-y-3">
              <a href="mailto:contact@anuvati.org" className="flex items-center gap-2 text-section-dark-foreground/50 hover:text-section-dark-foreground text-sm font-body transition-colors">
                <Mail size={14} className="shrink-0" /> contact@anuvati.org
              </a>
              <a href="https://wa.me/919999999999" className="flex items-center gap-2 text-section-dark-foreground/50 hover:text-section-dark-foreground text-sm font-body transition-colors">
                <Phone size={14} className="shrink-0" /> WhatsApp
              </a>
              <div className="flex items-start gap-2 text-section-dark-foreground/50 text-sm font-body">
                <MapPin size={14} className="mt-0.5 shrink-0" /> Lucknow, Uttar Pradesh, India
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <Link to="/policies" className="flex items-center gap-1 text-xs text-section-dark-foreground/40 hover:text-section-dark-foreground/70 transition-colors font-body">
                <ArrowRight size={10} /> Privacy Policy
              </Link>
              <Link to="/governance" className="flex items-center gap-1 text-xs text-section-dark-foreground/40 hover:text-section-dark-foreground/70 transition-colors font-body">
                <ArrowRight size={10} /> Transparency
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-section-dark-foreground/10 mt-6 pt-4 text-center">
          <p className="text-section-dark-foreground/40 text-xs font-body">
            © {new Date().getFullYear()} Anuvati Global Development Initiative. All rights reserved. | Donations eligible for tax exemption under Section 80G.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;