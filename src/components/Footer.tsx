import { Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Instagram className="w-5 h-5 text-primary" />
            <span className="font-display text-lg font-bold text-gradient-gold">
              FakeInfluence
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-body">
            © 2026 FakeInfluence. All AI personas are fictional.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
