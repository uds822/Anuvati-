import Layout from "@/components/layout/Layout";

const AdvisoryBoard = () => {
  return (
    <Layout>
      <section className="py-20">
        <div className="container max-w-5xl">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary mb-4">Advisory Board</h1>
          <p className="text-lg text-muted-foreground font-body leading-relaxed mb-12">
            Our Advisory Board comprises distinguished experts and thought leaders who guide ANUVATI's strategic direction and ensure our work remains impactful and aligned with global development goals.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              { name: "Coming Soon", expertise: "Sustainable Development" },
              { name: "Coming Soon", expertise: "Youth Policy & Advocacy" },
            ].map((advisor, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-xl text-primary font-heading font-bold shrink-0">
                    {advisor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-lg">{advisor.name}</h3>
                    <p className="text-sm text-muted-foreground font-body">{advisor.expertise}</p>
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

export default AdvisoryBoard;
