import { useState } from "react";
import { categories, influencers, type Category } from "@/data/influencers";
import InfluencerCard from "./InfluencerCard";

const BrowseSection = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filtered =
    activeCategory === "all"
      ? influencers
      : influencers.filter((i) => i.category === activeCategory);

  return (
    <section id="browse" className="py-24 bg-gradient-dark">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Meet Our <span className="text-gradient-gold">Creators</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
            AI-generated personas with real engagement metrics. Pick one that
            fits your brand.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full font-body text-sm font-medium transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-gradient-gold text-primary-foreground shadow-gold"
                  : "bg-surface text-muted-foreground hover:bg-surface-hover border border-border"
              }`}
            >
              <span className="mr-2">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((influencer, i) => (
            <InfluencerCard key={influencer.id} influencer={influencer} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrowseSection;
