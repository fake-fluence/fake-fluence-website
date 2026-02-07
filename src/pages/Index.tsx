import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BrowseSection from "@/components/BrowseSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <BrowseSection />
      <HowItWorksSection />
      <Footer />
    </main>
  );
};

export default Index;
