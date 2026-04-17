import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Mail, ChevronDown, Linkedin, Youtube, Instagram, Facebook, Heart, Map, ExternalLink } from "lucide-react";

const XIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoFinal from "@/assets/logo-final.png";

interface DropdownItem {
  label: string;
  path: string;
}

interface NavItem {
  label: string;
  path: string;
  children?: DropdownItem[];
}

const navItems: NavItem[] = [
  { label: "Home", path: "/" },
  {
    label: "About",
    path: "/about",
    children: [
      { label: "About ANUVATI", path: "/about" },
      { label: "Our Story", path: "/our-story" },
      { label: "Our Team", path: "/our-team" },
      { label: "Governance", path: "/governance" },
      { label: "Legal & Compliance", path: "/legal" },
    ],
  },
  {
    label: "Our Work",
    path: "/our-work",
    children: [
      { label: "Focus Areas", path: "/our-work" },
      { label: "Programs", path: "/programs" },
      { label: "Impact", path: "/impact" },
      { label: "Campaigns", path: "/campaigns" },
    ],
  },
  {
    label: "Resources",
    path: "/knowledge",
    children: [
      { label: "Blog & Insights", path: "/blog" },
      { label: "Knowledge Hub", path: "/knowledge" },
      { label: "Events", path: "/events" },
      { label: "Podcast", path: "/knowledge?tab=podcast" },
    ],
  },
  
];

// Complete sitemap structure — add new pages here and they appear in the sitemap automatically
const SITEMAP_SECTIONS = [
  {
    title: "About Us",
    links: [
      { label: "About ANUVATI", path: "/about" },
      { label: "Our Story", path: "/our-story" },
      { label: "Our Team", path: "/our-team" },
      { label: "Advisory Board", path: "/advisory-board" },
      { label: "Governance", path: "/governance" },
      { label: "Policies", path: "/policies" },
      { label: "Legal & Compliance", path: "/legal" },
      { label: "Transparency", path: "/transparency" },
    ],
  },
  {
    title: "Our Work",
    links: [
      { label: "Focus Areas", path: "/our-work" },
      { label: "Programs", path: "/programs" },
      { label: "Impact & Reports", path: "/impact" },
      { label: "Campaigns", path: "/campaigns" },
      { label: "Social Days", path: "/social-days" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog & Insights", path: "/blog" },
      { label: "Knowledge Hub", path: "/knowledge" },
      { label: "Events", path: "/events" },
    ],
  },
  {
    title: "Get Involved",
    links: [
      { label: "Volunteer / Intern", path: "/get-involved" },
      { label: "Careers", path: "/careers" },
      { label: "Partner With Us", path: "/partner" },
      { label: "Partners", path: "/partners" },
      { label: "Donate", path: "/donate" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Contact Us", path: "/contact" },
    ],
  },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [sitemapOpen, setSitemapOpen] = useState(false);
  const sitemapRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMobileDropdown(null);
    setSitemapOpen(false);
  }, [location.pathname]);

  // Close sitemap on outside click
  useEffect(() => {
    if (!sitemapOpen) return;
    const handler = (e: MouseEvent) => {
      if (sitemapRef.current && !sitemapRef.current.contains(e.target as Node)) {
        setSitemapOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sitemapOpen]);

  const isActive = (item: NavItem) => {
    if (location.pathname === item.path) return true;
    if (item.children) {
      return item.children.some((c) => location.pathname === c.path || location.pathname === c.path.split("?")[0]);
    }
    return false;
  };

  return (
    <>
      {/* Utility bar */}
      <div className="bg-foreground text-background text-xs py-1.5 hidden md:block relative">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-background/80 hover:text-background transition-colors">
              <Phone size={12} /> WhatsApp
            </a>
            <a href="mailto:contact@anuvati.org" className="flex items-center gap-1 text-background/80 hover:text-background transition-colors">
              <Mail size={12} /> contact@anuvati.org
            </a>
          </div>

          {/* Sitemap button — center */}
          <div ref={sitemapRef} className="absolute left-1/2 -translate-x-1/2">
            <button
              onClick={() => setSitemapOpen(!sitemapOpen)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-0.5 rounded-full transition-colors font-medium tracking-wide",
                sitemapOpen
                  ? "bg-background/20 text-background"
                  : "text-background/80 hover:text-background hover:bg-background/10"
              )}
            >
              <Map size={12} />
              Explore Site
              <ChevronDown size={11} className={cn("transition-transform", sitemapOpen && "rotate-180")} />
            </button>

            {/* Sitemap mega dropdown */}
            {sitemapOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-[680px] max-w-[90vw] bg-card border border-border rounded-xl shadow-2xl p-6 z-[60] animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-bold text-foreground text-sm">Site Directory</h3>
                  <button onClick={() => setSitemapOpen(false)} className="text-muted-foreground hover:text-foreground p-1"><X size={14} /></button>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-5">
                  {SITEMAP_SECTIONS.map((section) => (
                    <div key={section.title}>
                      <h4 className="font-heading font-semibold text-[11px] uppercase tracking-wider text-primary mb-2">{section.title}</h4>
                      <ul className="space-y-1">
                        {section.links.map((link) => (
                          <li key={link.path + link.label}>
                            <Link
                              to={link.path}
                              className={cn(
                                "block text-xs font-body py-0.5 transition-colors hover:text-primary",
                                location.pathname === link.path ? "text-primary font-medium" : "text-foreground/70"
                              )}
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <a href="https://linkedin.com/company/anuvati" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-background/70 hover:text-background transition-colors"><Linkedin size={14} strokeWidth={1.5} /></a>
            <a href="https://x.com/anuvati" target="_blank" rel="noopener noreferrer" aria-label="X" className="text-background/70 hover:text-background transition-colors"><XIcon size={13} /></a>
            <a href="https://youtube.com/@anuvati" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-background/70 hover:text-background transition-colors"><Youtube size={14} strokeWidth={1.5} /></a>
            <a href="https://instagram.com/anuvati" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-background/70 hover:text-background transition-colors"><Instagram size={14} strokeWidth={1.5} /></a>
            <a href="https://facebook.com/anuvati" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-background/70 hover:text-background transition-colors"><Facebook size={14} strokeWidth={1.5} /></a>
          </div>
        </div>
      </div>

      <header className={cn(
        "sticky top-0 z-50 bg-card backdrop-blur-none border-b border-border/50",
        scrolled ? "h-14 md:h-16 shadow-sm" : "h-16 md:h-[72px]"
      )}>
        <div className={cn("container flex items-center justify-between transition-all duration-300", scrolled ? "h-14 md:h-16" : "h-16 md:h-[72px]")}>
          <Link to="/" className="flex items-center select-none">
            <img
              src={logoFinal}
              alt="ANUVATI - Global Development Initiative"
              className={cn(
                "w-auto object-contain transition-all duration-300",
                scrolled ? "h-10 sm:h-11 md:h-12" : "h-12 sm:h-14 md:h-16"
              )}
              style={{ imageRendering: "-webkit-optimize-contrast" }}
              loading="eager"
              decoding="async"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label} className="relative group">
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-[13px] font-medium font-body rounded-md transition-colors hover:text-primary",
                      isActive(item) ? "text-primary" : "text-foreground/70"
                    )}
                  >
                    {item.label}
                    <ChevronDown size={13} className="transition-transform group-hover:rotate-180" />
                  </Link>
                  <div className="absolute left-0 top-full mt-1 bg-card border border-border/50 rounded-lg shadow-lg py-2 min-w-[220px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.path + child.label}
                        to={child.path}
                        className={cn(
                          "block px-4 py-2.5 text-[13px] font-body hover:bg-accent hover:text-primary transition-colors",
                          location.pathname === child.path.split("?")[0] ? "text-primary bg-accent/50" : "text-foreground/70"
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-3 py-2 text-[13px] font-medium font-body rounded-md transition-colors hover:text-primary",
                    isActive(item) ? "text-primary" : "text-foreground/70"
                  )}
                >
                  {item.label}
                </Link>
              )
            )}
            <Link to="/partners">
              <Button size="sm" className="ml-2 font-heading font-semibold text-xs h-9 bg-[hsl(280,45%,35%)] hover:bg-[hsl(280,45%,30%)] text-white">
                Partners
              </Button>
            </Link>
            <Link to="/get-involved">
              <Button size="sm" className="ml-1.5 font-heading font-semibold text-xs bg-primary hover:bg-primary/90 h-9">
                Get Involved
              </Button>
            </Link>
            <Link to="/donate">
              <Button size="sm" className="ml-1.5 font-heading font-semibold text-xs bg-secondary hover:bg-secondary/90 text-secondary-foreground h-9 gap-1">
                <Heart size={13} fill="currentColor" /> Donate
              </Button>
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden bg-card border-b border-border animate-fade-in max-h-[75vh] overflow-y-auto">
            <nav className="container py-4 flex flex-col gap-0.5">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.label}>
                    <button
                      onClick={() =>
                        setOpenMobileDropdown(openMobileDropdown === item.label ? null : item.label)
                      }
                      className={cn(
                        "flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium font-body rounded-md transition-colors hover:bg-accent",
                        isActive(item) ? "text-primary" : "text-foreground/70"
                      )}
                    >
                      {item.label}
                      <ChevronDown
                        size={16}
                        className={cn("transition-transform", openMobileDropdown === item.label && "rotate-180")}
                      />
                    </button>
                    {openMobileDropdown === item.label && (
                      <div className="ml-4 border-l-2 border-accent pl-2 py-1 animate-fade-in">
                        {item.children.map((child) => (
                          <Link
                            key={child.path + child.label}
                            to={child.path}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "block px-4 py-2 text-sm font-body rounded-md hover:bg-accent hover:text-primary transition-colors",
                              location.pathname === child.path.split("?")[0] ? "text-primary" : "text-foreground/60"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "px-4 py-2.5 text-sm font-medium font-body rounded-md transition-colors hover:bg-accent",
                      isActive(item) ? "text-primary" : "text-foreground/70"
                    )}
                  >
                    {item.label}
                  </Link>
                )
              )}

              {/* Mobile sitemap section */}
              <div className="mt-2 border-t border-border pt-2">
                <button
                  onClick={() => setOpenMobileDropdown(openMobileDropdown === "sitemap" ? null : "sitemap")}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium font-body rounded-md transition-colors hover:bg-accent text-foreground/70"
                >
                  <span className="flex items-center gap-2"><Map size={14} /> Explore Full Site</span>
                  <ChevronDown size={16} className={cn("transition-transform", openMobileDropdown === "sitemap" && "rotate-180")} />
                </button>
                {openMobileDropdown === "sitemap" && (
                  <div className="ml-4 border-l-2 border-accent pl-2 py-1 animate-fade-in space-y-3">
                    {SITEMAP_SECTIONS.map((section) => (
                      <div key={section.title}>
                        <p className="px-4 text-[11px] font-heading font-semibold uppercase tracking-wider text-primary mb-1">{section.title}</p>
                        {section.links.map((link) => (
                          <Link
                            key={link.path + link.label}
                            to={link.path}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "block px-4 py-1.5 text-sm font-body rounded-md hover:bg-accent hover:text-primary transition-colors",
                              location.pathname === link.path ? "text-primary" : "text-foreground/60"
                            )}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 mt-3 px-4">
                <div className="flex gap-2">
                  <Link to="/partners" onClick={() => setMobileOpen(false)} className="flex-1">
                    <Button className="w-full font-heading font-semibold text-sm bg-[hsl(280,45%,35%)] hover:bg-[hsl(280,45%,30%)] text-white">
                      Partners
                    </Button>
                  </Link>
                  <Link to="/get-involved" onClick={() => setMobileOpen(false)} className="flex-1">
                    <Button className="w-full font-heading font-semibold text-sm bg-primary hover:bg-primary/90">
                      Get Involved
                    </Button>
                  </Link>
                </div>
                <Link to="/donate" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full font-heading font-semibold text-sm bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-1">
                    <Heart size={15} fill="currentColor" /> Donate
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
