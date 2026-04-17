import Layout from "@/components/layout/Layout";
import { useState } from "react";
import { Calendar, ArrowRight } from "lucide-react";
import ShareButtons from "@/components/shared/ShareButtons";

const categories = ["All", "Education", "Youth Leadership", "Community", "Digital", "Sustainability"];

const posts = [
  { title: "Reimagining Education for the 21st Century", category: "Education", date: "Feb 15, 2026", excerpt: "How ANUVATI is working to transform foundational learning in rural India through community-driven approaches and evidence-based methods.", tags: ["education", "rural", "innovation"] },
  { title: "Youth as Architects of Change", category: "Youth Leadership", date: "Jan 28, 2026", excerpt: "Young leaders are not the future — they are the present. Exploring how youth-led initiatives drive measurable community transformation.", tags: ["youth", "leadership", "impact"] },
  { title: "Digital Inclusion: Beyond Connectivity", category: "Digital", date: "Jan 10, 2026", excerpt: "True digital inclusion requires literacy, relevant content, and supportive ecosystems — not just internet access.", tags: ["digital", "inclusion", "technology"] },
  { title: "Building Climate-Resilient Communities", category: "Sustainability", date: "Dec 20, 2025", excerpt: "Community-based adaptation strategies that protect livelihoods and build long-term resilience to climate change.", tags: ["climate", "environment", "resilience"] },
  { title: "The Power of Community-Led Development", category: "Community", date: "Dec 5, 2025", excerpt: "When communities design their own solutions, outcomes are more sustainable and impactful.", tags: ["community", "development", "participation"] },
  { title: "Safeguarding in Development Practice", category: "Community", date: "Nov 18, 2025", excerpt: "Why robust safeguarding policies are essential for ethical, effective development work.", tags: ["safeguarding", "ethics", "policy"] },
];

const Blog = () => {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? posts : posts.filter((p) => p.category === filter);
  const featured = posts[0];

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Insights</p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6">Blog & Insights</h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl leading-relaxed">
            Perspectives on development, youth leadership, and social transformation from the ANUVATI community.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12 bg-background">
        <div className="container">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="h-64 md:h-auto bg-gradient-to-br from-primary/10 to-secondary/10" />
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-primary bg-accent px-3 py-1 rounded-full w-fit mb-4">Featured</span>
                <h2 className="font-heading font-bold text-xl md:text-2xl text-foreground mb-3">{featured.title}</h2>
                <p className="font-body text-muted-foreground text-sm leading-relaxed mb-4">{featured.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                  <Calendar size={12} /> {featured.date}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-12 pb-16 bg-background">
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
            {filtered.map((post) => (
              <article key={post.title} className="bg-card rounded-xl border border-border/50 overflow-hidden hover:border-primary/20 hover:shadow-md transition-all duration-300 group">
                <div className="h-44 bg-gradient-to-br from-primary/8 to-secondary/8" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-heading font-bold text-secondary uppercase tracking-wider">{post.category}</span>
                    <span className="text-muted-foreground text-[10px]">•</span>
                    <span className="text-xs text-muted-foreground font-body flex items-center gap-1"><Calendar size={10} />{post.date}</span>
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed mb-4">{post.excerpt}</p>
                  <span className="flex items-center gap-1 text-primary text-sm font-heading font-semibold group-hover:gap-2 transition-all">
                    Read more <ArrowRight size={14} />
                  </span>
                </div>
              </article>
            ))}
          </div>
          <ShareButtons title="ANUVATI Blog & Insights" />
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
