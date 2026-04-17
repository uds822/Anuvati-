import { Quote, Rocket, Users, Target, Heart } from "lucide-react";

const visionPoints = [
  {
    icon: Rocket,
    title: "Just Getting Started",
    description: "ANUVATI is a newly launched initiative. We are in our foundational phase, building systems, teams, and partnerships to deliver real impact.",
  },
  {
    icon: Users,
    title: "Building Our Team",
    description: "We are actively recruiting youth volunteers, advisors, and partners who share our vision for inclusive development.",
  },
  {
    icon: Target,
    title: "Programs Launching Soon",
    description: "Our first programs in education, WASH, digital literacy, and community health are being designed and will launch in the coming months.",
  },
  {
    icon: Heart,
    title: "Your Support Matters",
    description: "As an early-stage organization, every partnership, volunteer, and supporter makes a significant difference in our journey.",
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 md:py-28 bg-background overflow-hidden">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            Our Journey
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground">
            Where We Stand Today
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-2xl mx-auto">
            We believe in honesty and transparency. Here's an honest look at where ANUVATI is right now — and where we're headed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {visionPoints.map((point) => (
            <div
              key={point.title}
              className="bg-card rounded-xl p-7 border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <point.icon size={24} className="text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground text-lg mb-2">{point.title}</h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed">{point.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-start gap-3 bg-secondary/5 border border-secondary/20 rounded-xl p-6 max-w-2xl">
            <Quote size={20} className="text-secondary shrink-0 mt-1" />
            <p className="font-body text-foreground text-sm leading-relaxed italic text-left">
              "We don't have testimonials yet — because we haven't delivered programs yet. But we are committed to earning them through genuine, measurable impact in the communities we will serve."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
