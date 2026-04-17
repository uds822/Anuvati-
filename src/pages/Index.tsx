import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import SocialDayBanner from "@/components/home/SocialDayBanner";
import WhoWeAre from "@/components/home/WhoWeAre";
import ImpactVision from "@/components/home/ImpactVision";
import FocusAreas from "@/components/home/FocusAreas";
import OurApproach from "@/components/home/OurApproach";
import SpotlightCampaigns from "@/components/home/SpotlightCampaigns";
import Testimonials from "@/components/home/Testimonials";
import PresenceMap from "@/components/home/PresenceMap";
import LatestNews from "@/components/home/LatestNews";
import PartnersStrip from "@/components/home/PartnersStrip";
import Newsletter from "@/components/home/Newsletter";
import SafeguardingBanner from "@/components/home/SafeguardingBanner";
import CallToAction from "@/components/home/CallToAction";

const Index = () => {
  return (
    <Layout>
      <SocialDayBanner />
      <Hero />
      <WhoWeAre />
      <ImpactVision />
      <FocusAreas />
      <OurApproach />
      <SpotlightCampaigns />
      <Testimonials />
      <PresenceMap />
      <LatestNews />
      <PartnersStrip />
      <Newsletter />
      <SafeguardingBanner />
      <CallToAction />
    </Layout>
  );
};

export default Index;
