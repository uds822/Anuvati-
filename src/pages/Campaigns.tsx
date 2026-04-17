import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp } from "lucide-react";
import ShareButtons from "@/components/shared/ShareButtons";
import childRightsImg from "@/assets/campaigns/child-rights.jpg";
import digitalYouthImg from "@/assets/campaigns/digital-youth.jpg";
import cleanWaterImg from "@/assets/campaigns/clean-water.jpg";
import climateActionImg from "@/assets/campaigns/climate-action.jpg";
import antiSubstanceImg from "@/assets/campaigns/anti-substance.jpg";

const activeCampaigns = [
  { title: "Every Child Reads", objective: "Ensure foundational literacy for 1,000 children by 2027", duration: "Jan 2026 – Dec 2027", impact: "500 children enrolled so far", image: childRightsImg, tag: "Education" },
  { title: "Digital India, Digital Youth", objective: "Bridge the digital divide for rural youth across UP", duration: "Mar 2026 – Feb 2027", impact: "200 youth trained in first quarter", image: digitalYouthImg, tag: "Digital Inclusion" },
  { title: "Clean Water, Healthy Communities", objective: "WASH awareness and infrastructure in 50 villages", duration: "Jun 2026 – May 2027", impact: "Launching soon", image: cleanWaterImg, tag: "WASH" },
];

const pastCampaigns = [
  { title: "Youth for Climate Action", summary: "Student-led environmental awareness campaign across 10 colleges.", impact: "5,000+ students reached, 2,000 trees planted.", image: climateActionImg },
  { title: "Say No to Substance Abuse", summary: "Community awareness campaign in partnership with local health authorities.", impact: "3,000+ community members engaged.", image: antiSubstanceImg },
];

const Campaigns = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Action</p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6">Campaigns</h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl leading-relaxed">
            Targeted campaigns driving awareness, participation, and measurable change across communities.
          </p>
        </div>
      </section>

      {/* Active Campaigns */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-5xl">
          <div className="mb-10">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Live</p>
            <h2 className="font-heading font-bold text-2xl text-foreground">Active Campaigns</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeCampaigns.map((c) => (
              <div key={c.title} className="bg-card rounded-xl border border-border/50 overflow-hidden hover:border-primary/20 hover:shadow-md transition-all duration-300 group">
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute top-3 left-3 text-[10px] font-heading font-bold uppercase tracking-wider text-white bg-primary/80 backdrop-blur-sm px-3 py-1 rounded-full">{c.tag}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-heading font-bold text-lg text-foreground mb-2">{c.title}</h3>
                  <p className="font-body text-muted-foreground text-sm mb-2">{c.objective}</p>
                  <p className="font-body text-muted-foreground text-xs mb-3">Duration: {c.duration}</p>
                  <div className="flex items-start gap-2 bg-secondary/5 rounded-lg p-3 mb-4">
                    <TrendingUp size={14} className="text-secondary mt-0.5 shrink-0" />
                    <p className="font-body text-sm text-foreground">{c.impact}</p>
                  </div>
                  <Link to="/donate">
                    <Button size="sm" className="w-full font-heading font-semibold text-xs bg-secondary hover:bg-secondary/90">
                      Support This Campaign
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Campaigns */}
      <section className="py-16 bg-section-light">
        <div className="container max-w-5xl">
          <div className="mb-10">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Archive</p>
            <h2 className="font-heading font-bold text-2xl text-foreground">Past Campaigns</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pastCampaigns.map((c) => (
              <div key={c.title} className="bg-card rounded-xl border border-border/50 overflow-hidden group">
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-foreground mb-2">{c.title}</h3>
                  <p className="font-body text-muted-foreground text-sm mb-2">{c.summary}</p>
                  <div className="flex items-start gap-2">
                    <TrendingUp size={14} className="text-secondary mt-0.5 shrink-0" />
                    <p className="font-body text-sm text-foreground">{c.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ShareButtons title="ANUVATI Campaigns" />
        </div>
      </section>
    </Layout>
  );
};

export default Campaigns;
