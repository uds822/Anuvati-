import { useEffect, useRef, useState } from "react";

const stats = [
  { number: 10000, suffix: "+", label: "Youth We Aim to Empower", prefix: "" },
  { number: 500, suffix: "+", label: "Schools We Plan to Reach", prefix: "" },
  { number: 50, suffix: "+", label: "Partnerships We Seek", prefix: "" },
  { number: 26, suffix: "+", label: "Sectors We Will Cover", prefix: "" },
];

const AnimatedCounter = ({ target, suffix, prefix }: { target: number; suffix: string; prefix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return (
    <div ref={ref} className="font-heading font-bold text-4xl md:text-5xl text-primary-foreground">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
};

const ImpactVision = () => {
  return (
    <section className="relative py-20 bg-section-dark overflow-hidden">
      {/* Decorative background graphics */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large radial glow behind stats */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/8 blur-[120px]" />
        {/* Accent circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full border border-primary/10" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full border border-secondary/10" />
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-secondary/5 blur-[60px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Diagonal accent line */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent rotate-12 origin-top-right" />
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-secondary/8 to-transparent -rotate-6 origin-top-left" />
        </div>
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-14">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Our Ambition</p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-section-dark-foreground">
            5-Year Impact Vision
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center relative group">
              <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -m-4" />
              <div className="relative">
                <AnimatedCounter target={stat.number} suffix={stat.suffix} prefix={stat.prefix} />
                <p className="font-body text-section-dark-foreground/60 text-sm mt-2">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactVision;
