import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Check, GraduationCap, Shield, Leaf, Users, BookOpen, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import donateHero from "@/assets/donate-hero.jpg";

const donationAmountsOnce = [
  { amount: 500, label: "Provide school supplies for 1 child" },
  { amount: 1000, label: "Support digital literacy training for a week" },
  { amount: 2500, label: "Fund a health camp for a village" },
  { amount: 5000, label: "Sponsor youth leadership training" },
  { amount: 10000, label: "Support a community development project" },
  { amount: 25000, label: "Enable a full program cycle in a village" },
];

const donationAmountsMonthly = [
  { amount: 250, label: "Monthly nutrition support for 1 child" },
  { amount: 500, label: "Monthly education support for 2 children" },
  { amount: 1000, label: "Sustain a digital learning centre" },
  { amount: 2500, label: "Monthly community volunteer stipend" },
  { amount: 5000, label: "Monthly program operations support" },
  { amount: 10000, label: "Sustain an entire village project monthly" },
];

const impactStats = [
  { icon: GraduationCap, stat: "10,000+", label: "Children to be reached through education programs" },
  { icon: Users, stat: "150+", label: "Villages targeted for community development" },
  { icon: BookOpen, stat: "95%", label: "Target school enrollment in project areas" },
  { icon: Stethoscope, stat: "50+", label: "Health camps planned across rural India" },
  { icon: Shield, stat: "100%", label: "Transparency in fund utilization" },
  { icon: Leaf, stat: "20+", label: "Environmental sustainability initiatives" },
];

const whatSupports = [
  "Educational programs for children and youth",
  "Digital literacy training for rural communities",
  "Health camps and nutrition programs",
  "Youth leadership development",
  "Environmental sustainability initiatives",
  "Community volunteer network operations",
];

const Donate = () => {
  const [donationType, setDonationType] = useState<"once" | "monthly">("once");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(5000);
  const [customAmount, setCustomAmount] = useState("");

  const amounts = donationType === "once" ? donationAmountsOnce : donationAmountsMonthly;

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const activeAmount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src={donateHero}
          alt="Children smiling and raising hands"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        <div className="container relative z-10 h-full flex flex-col justify-center">
          <div className="max-w-xl">
            <p className="font-heading text-secondary font-bold text-sm uppercase tracking-widest mb-3">
              Make a Difference
            </p>
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-4 leading-tight">
              Empower a Child's Future
            </h1>
            <p className="font-body text-primary-foreground/85 text-lg md:text-xl leading-relaxed">
              Your contribution directly supports youth-led, community-driven programs
              that create lasting impact across rural India.
            </p>
          </div>
        </div>
      </section>

      {/* Why Donate */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
              Why <span className="text-primary">Donate?</span>
            </h2>
            <p className="font-body text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
              India's future depends on its youth. Their future depends on <strong className="text-foreground">YOU</strong>.
              Every child deserves access to quality education, healthcare, and a safe environment.
              ANUVATI works to make this possible through community-driven development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-heading font-semibold text-xl text-foreground mb-4">About ANUVATI</h3>
              <p className="font-body text-muted-foreground leading-relaxed mb-4">
                ANUVATI — Accelerating Nurturing Unified Vision & Action Towards Impact — is a youth-led
                global development initiative committed to empowering communities through education,
                digital literacy, health, and sustainable development programs.
              </p>
              <p className="font-body text-muted-foreground leading-relaxed">
                We maintain complete transparency in fund utilization and believe that collective action
                by youth can drive transformative, lasting change in underserved communities.
              </p>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-xl text-foreground mb-4">What Your Support Enables</h3>
              <ul className="space-y-3">
                {whatSupports.map((w) => (
                  <li key={w} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
                      <Check size={14} className="text-secondary" />
                    </div>
                    <span className="font-body text-foreground">{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <h2 className="font-heading font-bold text-3xl text-center mb-12">
            Our <span className="text-secondary">Impact</span> Vision
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {impactStats.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary-foreground/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon size={24} className="text-secondary" />
                </div>
                <p className="font-heading font-bold text-2xl md:text-3xl">{item.stat}</p>
                <p className="font-body text-primary-foreground/70 text-xs mt-1 leading-snug">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Form Section */}
      <section className="py-16 md:py-20 bg-section-light">
        <div className="container max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-2">
              Yes! I'd Like to <span className="text-primary">Help</span>
            </h2>
            <p className="font-body text-muted-foreground">Choose how you'd like to contribute</p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
            {/* Toggle: Once / Monthly */}
            <div className="flex border-b border-border">
              <button
                onClick={() => { setDonationType("once"); setSelectedAmount(5000); setCustomAmount(""); }}
                className={`flex-1 py-4 font-heading font-semibold text-sm transition-colors ${
                  donationType === "once"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                Give Once
              </button>
              <button
                onClick={() => { setDonationType("monthly"); setSelectedAmount(1000); setCustomAmount(""); }}
                className={`flex-1 py-4 font-heading font-semibold text-sm transition-colors ${
                  donationType === "monthly"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                Give Monthly
              </button>
            </div>

            <div className="p-6 md:p-10">
              {/* Amount Grid */}
              <p className="font-heading font-semibold text-foreground mb-4">Choose an amount to donate</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {amounts.map((item) => (
                  <button
                    key={item.amount}
                    onClick={() => handleAmountSelect(item.amount)}
                    className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                      selectedAmount === item.amount
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/40 hover:bg-accent"
                    }`}
                  >
                    {selectedAmount === item.amount && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Heart size={12} className="text-primary-foreground fill-current" />
                      </div>
                    )}
                    <p className="font-heading font-bold text-xl text-foreground">₹{item.amount.toLocaleString("en-IN")}</p>
                    <p className="font-body text-muted-foreground text-xs mt-1 leading-snug">{item.label}</p>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="flex items-center gap-3 mb-8">
                <span className="font-heading font-bold text-lg text-foreground">₹</span>
                <Input
                  type="number"
                  placeholder="Other Amount"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="max-w-[200px] font-heading font-semibold text-lg"
                  min={100}
                />
                <span className="text-xs text-muted-foreground font-body">Min ₹100</span>
              </div>

              {activeAmount > 0 && (
                <div className="bg-secondary/10 rounded-lg p-4 mb-8 text-center">
                  <p className="font-body text-foreground">
                    Your contribution of <strong className="text-primary font-heading">₹{activeAmount.toLocaleString("en-IN")}</strong>{" "}
                    {donationType === "monthly" ? "per month " : ""}
                    will be used towards empowering India's underserved communities.
                  </p>
                </div>
              )}

              {/* Donate CTA */}
              <div className="text-center space-y-4">
                <Button
                  size="lg"
                  className="font-heading font-bold text-lg px-12 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                  disabled={activeAmount < 100}
                >
                  <Heart size={20} className="mr-2" />
                  Donate ₹{activeAmount > 0 ? activeAmount.toLocaleString("en-IN") : "—"} {donationType === "monthly" ? "/ month" : ""}
                </Button>
                <p className="text-xs text-muted-foreground font-body">
                  All donations are eligible for tax benefits under applicable sections of the Income Tax Act.
                </p>
              </div>
            </div>
          </div>

          {/* Alternative Payment Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-heading font-bold text-foreground text-lg mb-3">Donate via UPI / Bank Transfer (India)</h3>
              <p className="font-body text-muted-foreground text-sm mb-4">
                Support via UPI or direct bank transfer. All donations are eligible for tax benefits under applicable sections.
              </p>
              <div className="bg-section-light rounded-lg p-4 space-y-2">
                <p className="text-sm font-body text-foreground"><strong>UPI ID:</strong> donate@anuvati</p>
                <p className="text-sm font-body text-foreground"><strong>Bank:</strong> State Bank of India</p>
                <p className="text-sm font-body text-foreground"><strong>A/C No:</strong> XXXXXXXXXXXX</p>
                <p className="text-sm font-body text-foreground"><strong>IFSC:</strong> SBIN0XXXXXX</p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-heading font-bold text-foreground text-lg mb-3">International Donations</h3>
              <p className="font-body text-muted-foreground text-sm mb-4">
                International donations are facilitated through FCRA-compliant channels. Please contact us for wire transfer details.
              </p>
              <Link to="/contact">
                <Button variant="outline" className="font-heading font-semibold w-full">
                  Contact Us for International Donations
                </Button>
              </Link>
            </div>
          </div>

          {/* Transparency */}
          <div className="mt-10 bg-accent rounded-xl p-6 text-center">
            <p className="font-body text-foreground">
              <strong className="font-heading">100% Transparency:</strong> We publish detailed financial reports and impact assessments.
              View our{" "}
              <Link to="/governance" className="text-primary underline font-semibold">governance</Link>{" "}
              and{" "}
              <Link to="/transparency" className="text-primary underline font-semibold">transparency</Link>{" "}
              pages for complete accountability.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Donate;
