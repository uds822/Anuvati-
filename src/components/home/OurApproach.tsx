import { useEffect, useRef, useState } from "react";
import { Users, Network, Handshake, Eye, ArrowRight } from "lucide-react";

const pillars = [
  { icon: Users, title: "Community-Led Design", description: "Programs shaped by the communities they serve, ensuring relevance and ownership.", color: "hsl(350, 65%, 42%)" },
  { icon: Network, title: "Youth Volunteer Network", description: "Harnessing the energy and innovation of young leaders across India.", color: "hsl(28, 85%, 55%)" },
  { icon: Handshake, title: "Partnerships for Scale", description: "Strategic alliances with CSR, government, academic, and institutional partners.", color: "hsl(280, 45%, 35%)" },
  { icon: Eye, title: "Transparency & Evidence", description: "Data-driven impact measurement and full accountability to stakeholders.", color: "hsl(170, 55%, 40%)" },
];

const OurApproach = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Observe section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-cycle through steps
  useEffect(() => {
    if (!isVisible) return;
    const cycleDuration = 4000;
    const tickInterval = 30;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += tickInterval;
      setProgress((elapsed / cycleDuration) * 100);

      if (elapsed >= cycleDuration) {
        elapsed = 0;
        setActiveIndex((prev) => (prev + 1) % pillars.length);
        setProgress(0);
      }
    }, tickInterval);

    return () => clearInterval(timer);
  }, [isVisible, activeIndex]);

  const handleClick = (index: number) => {
    setActiveIndex(index);
    setProgress(0);
  };

  return (
    <section ref={sectionRef} className="py-20 md:py-28 bg-background overflow-hidden">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Our Methodology</p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">How We Work</h2>
          <p className="font-body text-muted-foreground">
            Our planned framework combining grassroots action with institutional partnerships for lasting change.
          </p>
        </div>

        {/* Connected Steps - Desktop */}
        <div className="hidden lg:block">
          {/* Flow connector line */}
          <div className="relative max-w-4xl mx-auto mb-12">
            <div className="flex items-center justify-between relative">
              {/* Background track */}
              <div className="absolute top-6 left-[8%] right-[8%] h-1 bg-border rounded-full" />
              {/* Animated progress line */}
              <div
                className="absolute top-6 left-[8%] h-1 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${(activeIndex / (pillars.length - 1)) * 84}%`,
                  background: pillars[activeIndex].color,
                }}
              />

              {pillars.map((pillar, index) => (
                <button
                  key={pillar.title}
                  onClick={() => handleClick(index)}
                  className="relative z-10 flex flex-col items-center group cursor-pointer"
                  style={{ width: "25%" }}
                >
                  {/* Circle node */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-md"
                    style={{
                      background: index <= activeIndex ? pillar.color : "hsl(var(--muted))",
                      transform: index === activeIndex ? "scale(1.2)" : "scale(1)",
                    }}
                  >
                    <pillar.icon size={22} className="text-white" />
                  </div>
                  {/* Step number */}
                  <span
                    className="mt-3 text-xs font-heading font-bold uppercase tracking-wider transition-colors duration-300"
                    style={{ color: index <= activeIndex ? pillar.color : "hsl(var(--muted-foreground))" }}
                  >
                    Step {index + 1}
                  </span>
                  {/* Title */}
                  <span
                    className="text-sm font-heading font-semibold mt-1 transition-colors duration-300"
                    style={{ color: index === activeIndex ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
                  >
                    {pillar.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active step detail card */}
          <div className="max-w-3xl mx-auto">
            <div
              className="relative rounded-2xl p-10 transition-all duration-500 overflow-hidden"
              style={{ background: `${pillars[activeIndex].color}10` }}
            >
              {/* Animated accent bar */}
              <div
                className="absolute top-0 left-0 h-1 transition-all duration-100"
                style={{
                  width: `${progress}%`,
                  background: pillars[activeIndex].color,
                }}
              />

              <div className="flex items-start gap-8">
                {/* Large icon */}
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500"
                  style={{ background: pillars[activeIndex].color }}
                >
                  {(() => {
                    const Icon = pillars[activeIndex].icon;
                    return <Icon size={36} className="text-white" />;
                  })()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-xs font-heading font-bold uppercase tracking-wider"
                      style={{ color: pillars[activeIndex].color }}
                    >
                      {pillars[activeIndex].title}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-2xl text-foreground mb-3">
                    {pillars[activeIndex].title}
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed text-base">
                    {pillars[activeIndex].description}
                  </p>
                </div>
              </div>

              {/* Step navigation dots */}
              <div className="flex gap-2 mt-6 justify-center">
                {pillars.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleClick(i)}
                    className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                    style={{
                      background: i === activeIndex ? pillars[activeIndex].color : "hsl(var(--border))",
                      transform: i === activeIndex ? "scale(1.3)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Vertical connected timeline */}
        <div className="lg:hidden">
          <div className="relative pl-10">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div
              className="absolute left-4 top-0 w-0.5 transition-all duration-700 ease-out"
              style={{
                height: `${((activeIndex + 1) / pillars.length) * 100}%`,
                background: pillars[activeIndex].color,
              }}
            />

            <div className="space-y-6">
              {pillars.map((pillar, index) => (
                <button
                  key={pillar.title}
                  onClick={() => handleClick(index)}
                  className="relative w-full text-left"
                >
                  {/* Node dot */}
                  <div
                    className="absolute -left-10 top-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm"
                    style={{
                      background: index <= activeIndex ? pillar.color : "hsl(var(--muted))",
                      transform: index === activeIndex ? "scale(1.15)" : "scale(1)",
                    }}
                  >
                    <pillar.icon size={14} className="text-white" />
                  </div>

                  <div
                    className="rounded-xl p-5 border transition-all duration-300"
                    style={{
                      background: index === activeIndex ? `${pillar.color}10` : "hsl(var(--card))",
                      borderColor: index === activeIndex ? `${pillar.color}30` : "hsl(var(--border) / 0.5)",
                    }}
                  >
                    <span
                      className="text-[10px] font-heading font-bold uppercase tracking-wider"
                      style={{ color: index <= activeIndex ? pillar.color : "hsl(var(--muted-foreground))" }}
                    >
                      Step {index + 1}
                    </span>
                    <h3 className="font-heading font-semibold text-foreground mt-1 mb-1.5 text-sm">{pillar.title}</h3>
                    {index === activeIndex && (
                      <div className="overflow-hidden animate-fade-in">
                        <p className="font-body text-muted-foreground text-xs leading-relaxed">
                          {pillar.description}
                        </p>
                        {/* Mini progress bar */}
                        <div className="mt-3 h-0.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-100"
                            style={{ width: `${progress}%`, background: pillar.color }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurApproach;
