import Layout from "@/components/layout/Layout";

const orgLevels = [
  { title: "Governing Board", description: "Strategic oversight and policy direction", members: ["Board Member 1 — Chairperson", "Board Member 2 — Secretary", "Board Member 3 — Treasurer", "Board Member 4 — Member"] },
  { title: "Advisory Council", description: "Expert guidance on programs and strategy", members: ["Advisor 1 — Education", "Advisor 2 — Public Health", "Advisor 3 — Digital & Technology", "Advisor 4 — Finance & Governance"] },
  { title: "Executive Team", description: "Day-to-day management and operations", members: ["Executive Director", "Program Director", "Operations Manager", "Communications Lead"] },
  { title: "Program Leads", description: "Sector-wise program management", members: ["Education Lead", "Health & Nutrition Lead", "Digital Inclusion Lead", "Livelihood & Skills Lead"] },
  { title: "District/Block Coordinators", description: "Field-level implementation", members: ["Coordinator — District 1", "Coordinator — District 2", "Coordinator — District 3"] },
  { title: "Volunteer Network", description: "Community-level engagement and support", members: ["Youth volunteers across multiple districts and institutions"] },
];

const Governance = () => {
  return (
    <Layout>
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <p className="font-heading text-secondary font-semibold text-sm uppercase tracking-widest mb-3">Structure</p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6">Governance</h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl">Our organizational structure ensures accountability, effectiveness, and ethical leadership at every level.</p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container max-w-4xl">
          <div className="space-y-8">
            {orgLevels.map((level, i) => (
              <div key={level.title} className="bg-card rounded-lg p-6 border border-border">
                <div className="flex items-start gap-4">
                  <span className="font-heading font-bold text-primary text-2xl">0{i + 1}</span>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-lg text-foreground mb-1">{level.title}</h3>
                    <p className="font-body text-muted-foreground text-sm mb-4">{level.description}</p>
                    <div className="space-y-2">
                      {level.members.map((m, j) => (
                        <div key={j} className="bg-section-light rounded-md px-4 py-2">
                          <p className="font-body text-foreground text-sm">{m}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Governance;
