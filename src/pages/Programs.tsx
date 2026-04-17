import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Clock, Users, Target, Calendar, Rocket } from "lucide-react";

const plannedPrograms = [
  { name: "WASH Program – Schools", location: "Lucknow, UP", timeline: "Launching Soon", objectives: "Improve Water, Sanitation & Hygiene (WASH) infrastructure and awareness across government schools through facilitator-led sessions, monitoring, and community engagement.", partners: "Seeking: District Education Dept, UNICEF", status: "In Planning" },
  { name: "Youth Leadership Academy", location: "Lucknow, UP", timeline: "6-month program", objectives: "Build youth leadership capacity in community development through structured training, mentorship, and hands-on project execution.", partners: "Seeking: Local schools, CSR partners", status: "Designing Curriculum" },
  { name: "Digital Literacy for Rural Women", location: "Multiple districts, UP", timeline: "12-month program", objectives: "Equip rural women with digital skills for livelihoods, enabling financial independence and digital participation.", partners: "Seeking: Government, tech companies", status: "In Planning" },
  { name: "Community Health & Nutrition", location: "Block level, UP", timeline: "Ongoing", objectives: "Improve health awareness and nutrition practices in underserved communities through health camps and education.", partners: "Seeking: Health department, NGO partners", status: "In Planning" },
];

const Programs = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Programs</p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6">Planned Programs</h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl leading-relaxed">
            We are currently designing structured, scalable programs for measurable community impact. These programs are planned to launch in the coming months across education, health, digital inclusion, and livelihoods.
          </p>
        </div>
      </section>

      {/* Notice */}
      <section className="py-8 bg-secondary/5 border-y border-secondary/20">
        <div className="container">
          <div className="flex items-center gap-3 max-w-3xl mx-auto">
            <Rocket size={20} className="text-secondary shrink-0" />
            <p className="font-body text-foreground text-sm">
              <strong>Note:</strong> ANUVATI is in its foundational phase. The programs listed below are currently being designed and have not yet been launched. We are actively seeking partners and volunteers to help bring them to life.
            </p>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-5xl">
          <div className="space-y-8">
            {plannedPrograms.map((p) => (
              <div key={p.name} className="bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="font-heading font-bold text-xl text-foreground">{p.name}</h3>
                    <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                      {p.status}
                    </span>
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
                      <Calendar size={14} className="text-primary mt-1 shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">Timeline</p>
                        <p className="text-sm font-body text-foreground">{p.timeline}</p>
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
                        <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">Status</p>
                        <p className="text-sm font-body text-foreground">{p.status}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-section-light rounded-lg p-4">
                    <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider mb-1">Objectives</p>
                    <p className="font-body text-foreground text-sm leading-relaxed">{p.objectives}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="font-body text-muted-foreground mb-4">Want to help launch a program with ANUVATI?</p>
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

export default Programs;
