import Layout from "@/components/layout/Layout";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { sectors, themes, themeColors } from "@/data/sectors";

const OurWork = () => {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? sectors : sectors.filter((s) => s.theme === filter);

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Sectors</p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6">Our Work</h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl leading-relaxed">
            We are preparing to launch multi-sector programs across 26+ development areas. These sectors represent our planned areas of intervention in the coming months.
          </p>
        </div>
      </section>

      {/* Sector Grid */}
      <section className="py-16 bg-background">
        <div className="container">
          {/* Filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {themes.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-5 py-2.5 rounded-full text-sm font-heading font-semibold transition-colors ${
                  filter === t
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-accent text-foreground hover:bg-primary/10"
                }`}
              >
                {t} {t !== "All" && <span className="text-xs opacity-60 ml-1">({sectors.filter(s => s.theme === t).length})</span>}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => (
              <Link
                key={s.slug}
                to={`/sector/${s.slug}`}
                className="bg-card rounded-xl border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300 overflow-hidden group"
              >
                <div className="relative h-36 overflow-hidden">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-white/80">{s.theme}</span>
                    <h3 className="font-heading font-semibold text-white text-lg">{s.title}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="font-body text-muted-foreground text-sm leading-relaxed mb-3">{s.problem}</p>
                  <div className="flex items-center gap-1 text-xs font-heading text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    View Programs <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="font-body text-muted-foreground mb-4">Interested in collaborating on any of these sectors?</p>
            <Link to="/partner">
              <Button className="font-heading font-semibold bg-primary hover:bg-primary/90">
                Partner With Us <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OurWork;
