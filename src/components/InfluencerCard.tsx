import { type Influencer, contentTypeLabels, type ContentType } from "@/data/influencers";
import { BadgeCheck, Heart, Users, Eye, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";

interface InfluencerCardProps {
  influencer: Influencer;
  index: number;
  showFullPricing?: boolean;
}

const InfluencerCard = ({ influencer, index, showFullPricing = false }: InfluencerCardProps) => {
  const [selectedType, setSelectedType] = useState<ContentType>("post");

  return (
    <div
      className="group relative rounded-xl overflow-hidden bg-card border border-border hover:border-gold/30 transition-all duration-500 hover:glow-gold opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={influencer.avatar}
          alt={influencer.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />

        {/* Price badge */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-surface/80 backdrop-blur-sm border border-border text-sm font-body font-semibold text-foreground">
          from ${influencer.pricing.post}
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {influencer.name}
          </h3>
          {influencer.verified && (
            <BadgeCheck className="w-4 h-4 text-primary" />
          )}
        </div>
        <p className="text-sm text-muted-foreground font-body mb-3">
          {influencer.handle}
        </p>
        <p className="text-xs text-primary font-body font-medium mb-4">
          {influencer.niche}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs font-body">{influencer.followers}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Heart className="w-3.5 h-3.5" />
            <span className="text-xs font-body">{influencer.engagement} eng.</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-xs font-body">{influencer.avgViews} views</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="text-xs font-body">{influencer.conversionRate} conv.</span>
          </div>
        </div>

        {/* Content type pricing */}
        {showFullPricing && (
          <div className="mb-4 space-y-2">
            <p className="text-xs text-muted-foreground font-body font-medium uppercase tracking-wider">Content Type</p>
            <div className="flex flex-col gap-1.5">
              {(Object.keys(contentTypeLabels) as ContentType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-body transition-all ${
                    selectedType === type
                      ? "bg-primary/10 border border-primary/30 text-foreground"
                      : "bg-surface border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{contentTypeLabels[type]}</span>
                  <span className="font-semibold">${influencer.pricing[type]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!showFullPricing && (
          <div className="mb-4 text-center py-2 rounded-lg bg-surface border border-border">
            <span className="text-xs text-muted-foreground font-body">Starting at </span>
            <span className="text-sm font-display font-bold text-gradient-gold">${influencer.pricing.post}</span>
          </div>
        )}

        <Link to={`/browse?creator=${influencer.id}`}>
          <Button
            className="w-full bg-gradient-gold text-primary-foreground font-body font-semibold text-sm hover:opacity-90 transition-opacity"
            size="sm"
          >
            {showFullPricing ? `Book for $${influencer.pricing[selectedType]}` : "View Pricing"}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default InfluencerCard;
