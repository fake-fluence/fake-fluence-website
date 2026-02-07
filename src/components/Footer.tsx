import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-display text-lg font-bold text-gradient-gold">
              InfluenceAI
            </span>
          </Link>
          <p className="text-sm text-muted-foreground font-body">
            © 2026 InfluenceAI. All AI personas are fictional.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
