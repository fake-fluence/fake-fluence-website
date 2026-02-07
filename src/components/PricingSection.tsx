import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: 99,
    description: "Perfect for testing the waters",
    features: [
      "1 sponsored post per month",
      "Basic audience targeting",
      "48-hour delivery",
      "Performance report",
    ],
    popular: false,
  },
  {
    name: "Growth",
    price: 299,
    description: "Scale your brand reach",
    features: [
      "5 sponsored posts per month",
      "Advanced audience targeting",
      "24-hour delivery",
      "Detailed analytics dashboard",
      "A/B testing support",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 799,
    description: "Full-scale campaigns",
    features: [
      "Unlimited sponsored posts",
      "Custom audience segments",
      "Same-day delivery",
      "Real-time analytics",
      "Dedicated account manager",
      "Custom AI persona creation",
    ],
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple <span className="text-gradient-gold">Pricing</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
            Choose the plan that fits your marketing goals. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl p-8 border transition-all duration-300 ${
                plan.popular
                  ? "bg-card border-gold/40 glow-gold scale-105"
                  : "bg-card border-border hover:border-gold/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-gold text-primary-foreground text-xs font-body font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                {plan.name}
              </h3>
              <p className="text-sm text-muted-foreground font-body mb-6">
                {plan.description}
              </p>

              <div className="mb-6">
                <span className="text-4xl font-display font-bold text-gradient-gold">
                  ${plan.price}
                </span>
                <span className="text-muted-foreground font-body text-sm">
                  /month
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm font-body text-secondary-foreground"
                  >
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full font-body font-semibold ${
                  plan.popular
                    ? "bg-gradient-gold text-primary-foreground hover:opacity-90"
                    : "bg-surface text-foreground border border-border hover:bg-surface-hover"
                } transition-all`}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
