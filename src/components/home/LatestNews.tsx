import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const articles = [
  {
    date: "March 2026",
    category: "Announcement",
    title: "ANUVATI Officially Launches as a Youth-Led Development Initiative",
    excerpt: "We are excited to announce the formal launch of ANUVATI, with plans to work across 26+ development sectors.",
    link: "/blog",
  },
  {
    date: "March 2026",
    category: "Planning",
    title: "Preparing Our First Programs for Lucknow Communities",
    excerpt: "Our team is designing community-driven programs in education, WASH, and digital inclusion — launching soon.",
    link: "/blog",
  },
  {
    date: "March 2026",
    category: "Open Call",
    title: "Calling Youth Volunteers & Partners to Join Our Mission",
    excerpt: "We're building our founding team of volunteers and seeking strategic partnerships to kickstart our programs.",
    link: "/get-involved",
  },
];

const LatestNews = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">
              Insights
            </p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground">
              Latest Updates
            </h2>
          </div>
          <Link to="/blog">
            <Button variant="outline" className="font-heading font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              View All <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <Link
              key={i}
              to={article.link}
              className="group bg-card rounded-lg p-7 border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-primary bg-accent px-3 py-1 rounded-full">
                  {article.category}
                </span>
                <span className="flex items-center gap-1 font-body text-muted-foreground text-xs">
                  <Calendar size={11} /> {article.date}
                </span>
              </div>
              <h3 className="font-heading font-semibold text-foreground text-base leading-snug mb-3 group-hover:text-primary transition-colors">
                {article.title}
              </h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed flex-1 mb-5">
                {article.excerpt}
              </p>
              <span className="flex items-center gap-1 text-primary text-sm font-heading font-semibold group-hover:gap-2 transition-all">
                Read more <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
