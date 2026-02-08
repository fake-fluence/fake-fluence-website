import { Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    if (!isHome) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-display text-xl font-bold text-gradient-gold">
            FakeFluence
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 font-body text-sm text-muted-foreground">
          <Link
            to="/browse"
            className="hover:text-foreground transition-colors"
          >
            {t.nav.browseCreators}
          </Link>
          {isHome ? (
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-foreground transition-colors"
            >
              {t.nav.howItWorks}
            </button>
          ) : (
            <Link to="/#how-it-works" className="hover:text-foreground transition-colors">
              {t.nav.howItWorks}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            to="/get-started"
            className="px-5 py-2 rounded-full bg-gradient-gold text-primary-foreground font-body text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {t.nav.getStarted}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
