import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BrowseSection from "@/components/BrowseSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <BrowseSection />
      <div id="pricing">
        <PricingSection />
      </div>
      <Footer />
    </main>
  );
};

export default Index;
