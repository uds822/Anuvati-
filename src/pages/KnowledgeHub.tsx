import Layout from "@/components/layout/Layout";
import { useState } from "react";
import { BookOpen, FileText, Video, MessageCircle, Mic, Calendar, ArrowRight } from "lucide-react";

const categories = ["All", "Blogs", "Articles", "Reports", "Case Studies", "Videos", "Testimonials", "Podcast"];

const resources = [
  { type: "Blogs", title: "Why Youth-Led Development Matters", description: "Exploring the case for young people at the center of community transformation.", tags: ["youth", "development"], date: "Feb 2026" },
  { type: "Articles", title: "Evidence-Based Planning in Rural India", description: "How data-driven approaches improve development outcomes at the grassroots.", tags: ["data", "rural"], date: "Jan 2026" },
  { type: "Reports", title: "ANUVATI Impact Report 2025", description: "Comprehensive overview of programs, outcomes, and financial stewardship.", tags: ["impact", "annual"], date: "Dec 2025" },
  { type: "Case Studies", title: "Digital Literacy for Rural Women", description: "How a 6-month program transformed livelihoods for 200 women.", tags: ["digital", "women"], date: "Nov 2025" },
  { type: "Videos", title: "Community Voices: Stories from the Field", description: "Video testimonials from program participants and community leaders.", tags: ["community", "stories"], date: "Oct 2025" },
  { type: "Testimonials", title: "Partner Perspectives", description: "CSR and institutional partners share their experience working with ANUVATI.", tags: ["partners", "trust"], date: "Sep 2025" },
  { type: "Podcast", title: "The ANUVATI Dialogue Series — Ep. 1", description: "Conversations on development, youth leadership, and community resilience.", tags: ["podcast", "dialogue"], date: "Aug 2025" },
  { type: "Blogs", title: "Safeguarding as Development Practice", description: "Why robust safeguarding policies are essential for ethical work.", tags: ["safeguarding", "ethics"], date: "Jul 2025" },
  { type: "Case Studies", title: "Youth Leadership Academy Results", description: "100+ youth trained, 20 community projects launched in one year.", tags: ["youth", "leadership"], date: "Jun 2025" },
];

const iconMap: Record<string, typeof BookOpen> = {
  Blogs: BookOpen,
  Articles: FileText,
  Reports: FileText,
  "Case Studies": FileText,
  Videos: Video,
  Testimonials: MessageCircle,
  Podcast: Mic,
};

const KnowledgeHub = () => {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? resources : resources.filter((r) => r.type === filter);

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Resources</p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6">Knowledge Hub</h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl leading-relaxed">
            Insights, research, stories, and multimedia resources from ANUVATI's development work.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-background">
        <div className="container">
          {/* Filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-full text-sm font-heading font-semibold transition-colors ${
                  filter === c ? "bg-primary text-primary-foreground" : "bg-accent text-foreground hover:bg-primary/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r, i) => {
              const Icon = iconMap[r.type] || FileText;
              return (
                <div key={i} className="bg-card rounded-xl border border-border/50 p-6 hover:border-primary/20 hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                      <Icon size={14} className="text-primary" />
                    </div>
                    <span className="text-[10px] font-heading font-bold text-secondary uppercase tracking-wider">{r.type}</span>
                    <span className="text-xs text-muted-foreground ml-auto font-body flex items-center gap-1">
                      <Calendar size={10} /> {r.date}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{r.title}</h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed mb-4">{r.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {r.tags.map((t) => (
                      <span key={t} className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full font-body">#{t}</span>
                    ))}
                  </div>
                  <span className="flex items-center gap-1 text-primary text-sm font-heading font-semibold group-hover:gap-2 transition-all">
                    Read more <ArrowRight size={14} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default KnowledgeHub;
