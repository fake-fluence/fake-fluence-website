import { Instagram } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <Instagram className="w-6 h-6 text-primary" />
          <span className="font-display text-xl font-bold text-gradient-gold">
            FakeInfluence
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 font-body text-sm text-muted-foreground">
          <a
            href="#browse"
            className="hover:text-foreground transition-colors"
          >
            Browse
          </a>
          <a
            href="#pricing"
            className="hover:text-foreground transition-colors"
          >
            Pricing
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            How It Works
          </a>
        </div>

        <button className="px-5 py-2 rounded-full bg-gradient-gold text-primary-foreground font-body text-sm font-semibold hover:opacity-90 transition-opacity">
          Get Started
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
