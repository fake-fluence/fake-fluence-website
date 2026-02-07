import { Upload, Search, CreditCard, Rocket } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const HowItWorksSection = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Upload,
      title: t.howItWorks.steps.upload.title,
      description: t.howItWorks.steps.upload.description,
    },
    {
      icon: Search,
      title: t.howItWorks.steps.match.title,
      description: t.howItWorks.steps.match.description,
    },
    {
      icon: CreditCard,
      title: t.howItWorks.steps.choose.title,
      description: t.howItWorks.steps.choose.description,
    },
    {
      icon: Rocket,
      title: t.howItWorks.steps.launch.title,
      description: t.howItWorks.steps.launch.description,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t.howItWorks.title} <span className="text-gradient-gold">{t.howItWorks.titleHighlight}</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
            {t.howItWorks.description}
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
