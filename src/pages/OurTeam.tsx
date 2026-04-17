import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { ChevronDown, ChevronUp, Linkedin } from "lucide-react";
import ScrollReveal, { StaggerContainer } from "@/components/motion/ScrollReveal";
import teamHero from "@/assets/team-hero.jpg";

interface TeamMember {
  name: string;
  role: string;
  initials: string;
  bio: string;
  linkedin?: string;
}

interface TeamSection {
  title: string;
  members: TeamMember[];
}

const teamData: TeamSection[] = [
  {
    title: "Founder",
    members: [
      {
        name: "Founder Name",
        role: "Founder & Chairperson",
        initials: "FN",
        bio: "A visionary leader who founded ANUVATI in 2026 with the belief that youth-led action can drive sustainable development across the globe. With a deep commitment to community empowerment, education, and social equity, they have built ANUVATI from a grassroots initiative into a growing global movement.",
      },
    ],
  },
  {
    title: "Leadership Team",
    members: [
      { name: "Director of Programs", role: "Director of Programs", initials: "DP", bio: "Leads the design, implementation, and evaluation of all ANUVATI programs across education, health, climate action, and gender equality." },
      { name: "Head of Partnerships", role: "Head of Partnerships & Outreach", initials: "HP", bio: "Drives strategic partnerships with CSR bodies, academic institutions, government agencies, and international organizations." },
      { name: "Head of Communications", role: "Head of Communications & Advocacy", initials: "HC", bio: "Oversees ANUVATI's brand, digital presence, and public advocacy efforts." },
      { name: "Head of Operations", role: "Head of Operations", initials: "HO", bio: "Manages organizational operations, volunteer coordination, and resource allocation." },
    ],
  },
  {
    title: "Advisory Board",
    members: [
      { name: "Advisor — Sustainable Development", role: "Advisor, Sustainable Development", initials: "SD", bio: "An expert in sustainable development policy with over two decades of experience working with international organizations." },
      { name: "Advisor — Youth Policy & Advocacy", role: "Advisor, Youth Policy", initials: "YP", bio: "A leading advocate for youth inclusion in policy-making processes across South Asia and Africa." },
      { name: "Advisor — Education & Research", role: "Advisor, Education", initials: "ER", bio: "A distinguished academic specializing in education equity and learning outcomes." },
      { name: "Advisor — Public Health", role: "Advisor, Public Health", initials: "PH", bio: "Brings deep expertise in community health systems and public health innovation." },
    ],
  },
  {
    title: "Core Team",
    members: [
      { name: "Program Coordinator", role: "Program Coordinator", initials: "PC", bio: "Coordinates field-level programs and ensures smooth execution of initiatives across multiple geographies." },
      { name: "Research & Impact Lead", role: "Research & Impact", initials: "RI", bio: "Leads ANUVATI's monitoring, evaluation, and learning efforts." },
      { name: "Digital & Design Lead", role: "Digital & Creative", initials: "DD", bio: "Manages ANUVATI's digital platforms, design assets, and creative campaigns." },
      { name: "Volunteer Engagement Lead", role: "Volunteer Engagement", initials: "VE", bio: "Oversees volunteer recruitment, training, and retention." },
      { name: "Finance & Compliance", role: "Finance & Compliance", initials: "FC", bio: "Ensures financial transparency, regulatory compliance, and responsible resource management." },
      { name: "Campus Ambassador Lead", role: "Campus Ambassador Program", initials: "CA", bio: "Manages the Campus Ambassador network across universities and colleges." },
    ],
  },
];

const MemberCard = ({ member }: { member: TeamMember }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden motion-card group">
      {/* Avatar area */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/40 p-8 flex justify-center">
        <div className="w-28 h-28 rounded-full bg-primary/15 border-4 border-card flex items-center justify-center text-3xl font-heading font-bold text-primary shadow-md transition-transform duration-300 group-hover:scale-105">
          {member.initials}
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-heading font-semibold text-lg text-foreground">{member.name}</h3>
        <p className="text-sm text-primary font-body font-medium mt-0.5">{member.role}</p>

        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-2 transition-colors opacity-0 group-hover:opacity-100 duration-200"
          >
            <Linkedin size={14} /> LinkedIn
          </a>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 mt-3 transition-colors"
        >
          {expanded ? "Read less" : "Read more"}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <div
          className="overflow-hidden transition-all duration-400"
          style={{
            maxHeight: expanded ? "200px" : "0px",
            opacity: expanded ? 1 : 0,
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <p className="text-sm text-muted-foreground font-body leading-relaxed mt-3">
            {member.bio}
          </p>
        </div>
      </div>
    </div>
  );
};

const OurTeam = () => {
  return (
    <Layout>
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[360px] max-h-[520px] overflow-hidden">
        <img
          src={teamHero}
          alt="ANUVATI team"
          className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-[1.2s] hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-card drop-shadow-lg opacity-0 animate-[hero-text_0.8s_cubic-bezier(0.16,1,0.3,1)_0.2s_forwards]">
            Our Team
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-12 md:py-16">
        <div className="container max-w-3xl text-center">
          <ScrollReveal>
            <p className="text-lg md:text-xl text-muted-foreground font-body leading-relaxed">
              ANUVATI is powered by a passionate, youth-led team of changemakers, strategists, and development professionals committed to creating lasting impact across communities worldwide.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Team Sections */}
      {teamData.map((section) => (
        <section key={section.title} className="pb-16">
          <div className="container">
            <ScrollReveal>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground whitespace-nowrap">
                  {section.title}
                </h2>
                <div className="flex-1 h-px bg-border" />
              </div>
            </ScrollReveal>

            <StaggerContainer
              className={`grid gap-6 ${
                section.members.length === 1
                  ? "grid-cols-1 max-w-md mx-auto"
                  : section.members.length === 2
                  ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }`}
              staggerDelay={100}
            >
              {section.members.map((member) => (
                <MemberCard key={member.name} member={member} />
              ))}
            </StaggerContainer>
          </div>
        </section>
      ))}

      {/* Join CTA */}
      <section className="py-16 bg-primary/5">
        <div className="container text-center max-w-2xl">
          <ScrollReveal variant="scale-up">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
              Join Our Team
            </h2>
            <p className="text-muted-foreground font-body mb-6">
              We're always looking for passionate individuals who want to make a difference. Explore volunteer, internship, and collaboration opportunities with ANUVATI.
            </p>
            <a
              href="/get-involved"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/90 transition-colors motion-button"
            >
              Get Involved →
            </a>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default OurTeam;
