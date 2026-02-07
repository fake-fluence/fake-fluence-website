import heroBg from "@/assets/hero-bg.jpg";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/20 bg-surface/50 backdrop-blur-sm mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-body text-muted-foreground">
            AI-Powered Influencer Marketing
          </span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-fade-in-up">
          <span className="text-foreground">The Future of</span>
          <br />
          <span className="text-gradient-gold">Influence</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-body leading-relaxed opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Browse our curated AI influencers. Choose your audience. Launch
          sponsored posts that convert — without the drama.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Button
            size="lg"
            className="bg-gradient-gold text-primary-foreground font-body font-semibold text-base px-8 py-6 shadow-gold hover:opacity-90 transition-opacity"
            onClick={() =>
              document.getElementById("browse")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Browse Creators
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-border text-foreground font-body font-medium text-base px-8 py-6 hover:bg-surface-hover transition-colors"
          >
            How It Works
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-20 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          {[
            { value: "500+", label: "AI Creators" },
            { value: "12M+", label: "Total Reach" },
            { value: "98%", label: "Satisfaction" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl md:text-3xl font-display font-bold text-gradient-gold">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground font-body mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
