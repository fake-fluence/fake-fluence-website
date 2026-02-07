import { useState, useMemo } from "react";
import { categories, influencers, niches, type Category } from "@/data/influencers";
import InfluencerCard from "@/components/InfluencerCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/i18n/LanguageContext";

type SortOption = "popular" | "price-low" | "price-high" | "engagement" | "conversion";

const Browse = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiche, setSelectedNiche] = useState(t.browsePage.filters.allNiches);
  const [sortBy, setSortBy] = useState<SortOption>("popular");

  const sortLabels: Record<SortOption, string> = {
    popular: t.browsePage.filters.followers,
    "price-low": `${t.browsePage.filters.price}: Low`,
    "price-high": `${t.browsePage.filters.price}: High`,
    engagement: t.browsePage.filters.engagement,
    conversion: t.influencer.conversionRate,
  };

  const getCategoryLabel = (id: Category): string => {
    const labels: Record<Category, string> = {
      all: t.browse.categories.all,
      women: t.browse.categories.women,
      men: t.browse.categories.men,
      pets: t.browse.categories.pets,
      other: t.browse.categories.other,
    };
    return labels[id];
  };

  const filtered = useMemo(() => {
    let result = influencers;

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((i) => i.category === activeCategory);
    }

    // Niche filter
    if (selectedNiche !== t.browsePage.filters.allNiches && selectedNiche !== "All Niches") {
      result = result.filter((i) => i.niche === selectedNiche);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.handle.toLowerCase().includes(q) ||
          i.niche.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case "popular":
        result = [...result].sort((a, b) => b.followersNum - a.followersNum);
        break;
      case "price-low":
        result = [...result].sort((a, b) => a.pricing.post - b.pricing.post);
        break;
      case "price-high":
        result = [...result].sort((a, b) => b.pricing.post - a.pricing.post);
        break;
      case "engagement":
        result = [...result].sort(
          (a, b) => parseFloat(b.engagement) - parseFloat(a.engagement)
        );
        break;
      case "conversion":
        result = [...result].sort(
          (a, b) => parseFloat(b.conversionRate) - parseFloat(a.conversionRate)
        );
        break;
    }

    return result;
  }, [activeCategory, searchQuery, selectedNiche, sortBy, t.browsePage.filters.allNiches]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-8 bg-gradient-dark">
        <div className="container mx-auto px-6">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
            {t.browsePage.title} <span className="text-gradient-gold">{t.browsePage.titleHighlight}</span>
          </h1>
          <p className="text-muted-foreground font-body text-lg max-w-2xl">
            {t.browsePage.description}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-40 border-b border-border bg-background/90 backdrop-blur-xl py-4">
        <div className="container mx-auto px-6">
          {/* Category tabs */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full font-body text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-gradient-gold text-primary-foreground shadow-gold"
                    : "bg-surface text-muted-foreground hover:bg-surface-hover border border-border"
                }`}
              >
                <span className="mr-2">{cat.emoji}</span>
                {getCategoryLabel(cat.id)}
              </button>
            ))}
          </div>

          {/* Search + Filters row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t.browsePage.filters.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-surface border-border font-body text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                <SelectTrigger className="w-[200px] bg-surface border-border font-body text-sm">
                  <SlidersHorizontal className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={t.browsePage.filters.allNiches}>
                    {t.browsePage.filters.allNiches}
                  </SelectItem>
                  {niches.filter(n => n !== "All Niches").map((niche) => (
                    <SelectItem key={niche} value={niche}>
                      {niche}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[200px] bg-surface border-border font-body text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(sortLabels) as [SortOption, string][]).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 bg-gradient-dark">
        <div className="container mx-auto px-6">
          <p className="text-sm text-muted-foreground font-body mb-6">
            {filtered.length} {filtered.length !== 1 ? t.browse.categories.all.toLowerCase().split(" ")[0] + "s" : t.browse.categories.all.toLowerCase().split(" ")[0]}
          </p>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((influencer, i) => (
                <InfluencerCard
                  key={influencer.id}
                  influencer={influencer}
                  index={i}
                  showFullPricing
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-body text-lg">
                {t.browsePage.noResults}
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Browse;
