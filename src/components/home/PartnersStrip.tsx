import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Handshake } from "lucide-react";

import partnershipSigning from "@/assets/partnerships/partnership-signing.jpg";
import communityCollab from "@/assets/partnerships/community-collab.jpg";
import workshopCollab from "@/assets/partnerships/workshop-collab.jpg";
import awardCeremony from "@/assets/partnerships/award-ceremony.jpg";

const partnerTypes = [
  "CSR Partners",
  "Government Bodies",
  "Academic Institutions",
  "Community Organizations",
  "International Agencies",
];

const bgImages = [partnershipSigning, communityCollab, workshopCollab, awardCeremony];

const PartnersStrip = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % bgImages.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background slideshow */}
      {bgImages.map((img, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${img})`,
            opacity: i === current ? 1 : 0,
          }}
        />
      ))}
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/65" />

      <div className="container relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-5">
            <Handshake className="text-white" size={26} />
          </div>
          <p className="font-heading text-white/80 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            Partnerships
          </p>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-4">
            Seeking Partners for Greater Impact
          </h2>
          <p className="font-body text-white/75 mb-8">
            We are actively seeking partnerships with organizations across sectors to launch and scale our upcoming programs.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {partnerTypes.map((type) => (
              <span key={type} className="text-xs font-heading font-medium text-white bg-white/10 border border-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                {type}
              </span>
            ))}
          </div>
          <Link to="/partners">
            <Button className="font-heading font-semibold bg-white text-foreground hover:bg-white/90">
              Explore Partnerships <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PartnersStrip;
