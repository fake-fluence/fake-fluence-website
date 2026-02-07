import { Image, FileText, Video, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const contentTypes = [
  {
    icon: Image,
    title: "Photo Post",
    description: "A single sponsored image posted to the creator's feed",
    startingPrice: 99,
    includes: ["High-quality AI-generated image", "Product placement", "Hashtag optimization"],
  },
  {
    icon: FileText,
    title: "Post + Caption",
    description: "Sponsored image with an engaging, tailored caption",
    startingPrice: 169,
    includes: ["Everything in Photo Post", "Persuasive AI-written caption", "Call-to-action included", "Story mention"],
    popular: true,
  },
  {
    icon: Video,
    title: "Full Video",
    description: "A short-form video review or product showcase",
    startingPrice: 349,
    includes: ["15-60 second AI video", "Product demonstration", "Background music & effects", "Caption & hashtags", "Reel + Story post"],
  },
];

const PricingSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Content <span className="text-gradient-gold">Pricing</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            Pricing varies per creator based on followers, engagement, audience fit, and conversion history.
            Here's what each content type starts at.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {contentTypes.map((type) => (
            <div
              key={type.title}
              className={`relative rounded-xl p-8 border transition-all duration-300 ${
                type.popular
                  ? "bg-card border-gold/40 glow-gold scale-105"
                  : "bg-card border-border hover:border-gold/20"
              }`}
            >
              {type.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-gold text-primary-foreground text-xs font-body font-bold">
                  Most Popular
                </div>
              )}

              <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center mb-5">
                <type.icon className="w-6 h-6 text-primary" />
              </div>

              <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                {type.title}
              </h3>
              <p className="text-sm text-muted-foreground font-body mb-6">
                {type.description}
              </p>

              <div className="mb-6">
                <span className="text-xs text-muted-foreground font-body">Starting at</span>
                <div>
                  <span className="text-4xl font-display font-bold text-gradient-gold">
                    ${type.startingPrice}
                  </span>
                  <span className="text-muted-foreground font-body text-sm"> /per post</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {type.includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm font-body text-secondary-foreground"
                  >
                    <span className="text-primary mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link to="/browse">
                <Button
                  className={`w-full font-body font-semibold ${
                    type.popular
                      ? "bg-gradient-gold text-primary-foreground hover:opacity-90"
                      : "bg-surface text-foreground border border-border hover:bg-surface-hover"
                  } transition-all`}
                >
                  Browse Creators
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground font-body">
            Final pricing depends on the creator's reach, audience quality, and historical performance.{" "}
            <Link to="/browse" className="text-primary hover:underline">
              Browse all creators →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
