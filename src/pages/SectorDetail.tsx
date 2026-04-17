import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { getSectorBySlug, themeColors } from "@/data/sectors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, MapPin, Clock, Users, Target, CheckCircle } from "lucide-react";
import NotFound from "./NotFound";

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-800 border-green-200",
  Upcoming: "bg-blue-100 text-blue-800 border-blue-200",
  Completed: "bg-muted text-muted-foreground border-border",
};

const SectorDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const sector = getSectorBySlug(slug || "");

  if (!sector) return <NotFound />;

  const Icon = sector.icon;

  return (
    <Layout>
      {/* Hero */}
      {/* Hero with image */}
      <section className="relative">
        <div className="h-64 md:h-80 overflow-hidden">
          <img src={sector.image} alt={sector.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
        <div className="absolute inset-0 flex items-end">
          <div className="container pb-8">
            <Link to="/our-work" className="inline-flex items-center gap-1.5 text-sm font-heading text-white/70 hover:text-white transition-colors mb-4">
              <ArrowLeft size={14} /> Back to All Sectors
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 font-heading text-[10px] uppercase tracking-wider">{sector.theme}</Badge>
            </div>
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-white mb-3">{sector.title}</h1>
            <p className="font-body text-white/80 text-lg max-w-3xl leading-relaxed">{sector.description}</p>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-12 bg-background border-b border-border/50">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-5">
                <p className="text-[10px] font-heading uppercase tracking-wider text-muted-foreground mb-1">The Problem</p>
                <p className="font-body text-sm text-foreground">{sector.problem}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <p className="text-[10px] font-heading uppercase tracking-wider text-muted-foreground mb-1">What We Do</p>
                <p className="font-body text-sm text-foreground">{sector.activities}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <p className="text-[10px] font-heading uppercase tracking-wider text-muted-foreground mb-1">Who Benefits</p>
                <p className="font-body text-sm text-foreground">{sector.beneficiaries}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <p className="text-[10px] font-heading uppercase tracking-wider text-muted-foreground mb-1">Outcomes</p>
                <p className="font-body text-sm text-foreground">{sector.outcomes}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-16 bg-background">
        <div className="container max-w-5xl">
          <div className="mb-10">
            <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-2">Programs</p>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
              Programs in {sector.title}
            </h2>
            <p className="font-body text-muted-foreground mt-2">
              {sector.programs.length} program{sector.programs.length !== 1 ? "s" : ""} currently under this sector.
            </p>
          </div>

          <div className="space-y-6">
            {sector.programs.map((p) => (
              <div key={p.name} className="bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                    <h3 className="font-heading font-bold text-lg text-foreground">{p.name}</h3>
                    <Badge className={`${statusColors[p.status]} border font-heading text-xs shrink-0`}>
                      {p.status === "Active" && <CheckCircle size={10} className="mr-1" />}
                      {p.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-primary mt-1 shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">Location</p>
                        <p className="text-sm font-body text-foreground">{p.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock size={14} className="text-primary mt-1 shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">Duration</p>
                        <p className="text-sm font-body text-foreground">{p.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users size={14} className="text-primary mt-1 shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">Partners</p>
                        <p className="text-sm font-body text-foreground">{p.partners}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Target size={14} className="text-secondary mt-1 shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">Outputs</p>
                        <p className="text-sm font-body text-foreground">{p.outputs}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider mb-1">Objectives</p>
                    <p className="font-body text-foreground text-sm leading-relaxed">{p.objectives}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/partner">
              <Button className="font-heading font-semibold">
                Partner on {sector.title} <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link to="/get-involved">
              <Button variant="outline" className="font-heading font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Volunteer for {sector.title} <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SectorDetail;
