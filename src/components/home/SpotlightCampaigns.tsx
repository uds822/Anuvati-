import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import childRightsImg from "@/assets/campaigns/child-rights.jpg";
import digitalYouthImg from "@/assets/campaigns/digital-youth.jpg";
import youthChangemakersImg from "@/assets/campaigns/youth-changemakers.jpg";

const campaigns = [
  {
    tag: "Upcoming Campaign",
    title: "Rights of Every Child",
    description: "We will advocate for the fundamental rights of children across underserved communities in India.",
    link: "/campaigns",
    image: childRightsImg,
  },
  {
    tag: "Planned Initiative",
    title: "Digital India for Youth",
    description: "We aim to bridge the digital divide by equipping young people with future-ready tech skills.",
    link: "/programs",
    image: digitalYouthImg,
  },
  {
    tag: "Coming Soon",
    title: "Youth Changemakers Network",
    description: "A platform we are building for young leaders to drive grassroots change and community transformation.",
    link: "/get-involved",
    image: youthChangemakersImg,
  },
];

const SpotlightCampaigns = () => {
  return (
    <section className="py-20 bg-section-light">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-xl">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">
              Spotlight
            </p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
              Campaigns & Initiatives
            </h2>
            <p className="font-body text-muted-foreground">
              Explore key ANUVATI campaigns driving change across communities.
            </p>
          </div>
          <Link to="/campaigns">
            <Button variant="outline" className="font-heading font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              All Campaigns <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campaigns.map((item, i) => (
            <Link
              key={i}
              to={item.link}
              className="group bg-card rounded-lg overflow-hidden border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute top-3 left-3 text-[10px] font-heading font-bold uppercase tracking-wider text-white bg-primary/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  {item.tag}
                </span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-heading font-semibold text-foreground text-lg leading-snug mb-3 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed flex-1 mb-5">
                  {item.description}
                </p>
                <span className="flex items-center gap-1 text-primary text-sm font-heading font-semibold group-hover:gap-2 transition-all">
                  Learn more <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpotlightCampaigns;
