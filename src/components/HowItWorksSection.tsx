import { Upload, Search, CreditCard, Rocket } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Product",
    description: "Share your product photos and a brief description of what you're selling.",
  },
  {
    icon: Search,
    title: "Get Matched",
    description: "Our AI suggests the best creators based on audience fit, engagement, and conversion rates.",
  },
  {
    icon: CreditCard,
    title: "Choose Your Content",
    description: "Select your creator and content type — photo post, post with caption, or full video.",
  },
  {
    icon: Rocket,
    title: "Launch & Track",
    description: "Your sponsored content goes live. Track views, clicks, and conversions in real-time.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It <span className="text-gradient-gold">Works</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
            From product upload to sponsored post — in four simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative text-center p-6 rounded-xl bg-card border border-border hover:border-gold/30 transition-all duration-300 group opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {/* Step number */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-gold text-primary-foreground text-xs font-body font-bold flex items-center justify-center">
                {i + 1}
              </div>

              <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-surface flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <step.icon className="w-7 h-7 text-primary" />
              </div>

              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
