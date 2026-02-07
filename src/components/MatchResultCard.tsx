import { type Influencer, contentTypeLabels, type ContentType } from "@/data/influencers";
import { BadgeCheck, Users, Eye, ShoppingCart, Heart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
interface MatchResultCardProps {
  influencer: Influencer;
  matchScore: number;
  matchReason: string;
  index: number;
  onSelect: (influencer: Influencer, contentType: ContentType) => void;
}

const MatchResultCard = ({ influencer, matchScore, matchReason, index, onSelect }: MatchResultCardProps) => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<ContentType>("post");

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 75) return "text-primary";
    return "text-muted-foreground";
  };

  return (
    <div
      className="flex flex-col sm:flex-row gap-5 p-5 rounded-xl bg-card border border-border hover:border-gold/30 transition-all duration-300 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      {/* Avatar */}
      <div className="relative w-full sm:w-32 h-48 sm:h-32 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={influencer.avatar}
          alt={influencer.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-background/90 backdrop-blur-sm">
          <span className={`text-xs font-body font-bold ${getScoreColor(matchScore)}`}>
            {matchScore}% match
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display text-lg font-semibold text-foreground truncate">
            {influencer.name}
          </h3>
          {influencer.verified && (
            <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-muted-foreground font-body mb-1">
          {influencer.handle}
        </p>
        <p className="text-xs text-primary font-body font-medium mb-3">
          {influencer.niche}
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs font-body">{influencer.followers}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Heart className="w-3.5 h-3.5" />
            <span className="text-xs font-body">{influencer.engagement}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-xs font-body">{influencer.avgViews}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="text-xs font-body">{influencer.conversionRate}</span>
          </div>
        </div>

        {/* Custom match reason */}
        <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <TrendingUp className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground font-body leading-relaxed">
            {matchReason}
          </p>
        </div>
      </div>

      {/* Pricing + CTA */}
      <div className="sm:w-56 flex-shrink-0 space-y-3">
        <p className="text-xs text-muted-foreground font-body font-medium uppercase tracking-wider">
          Content Type & Price
        </p>
        <div className="space-y-1.5">
          {(Object.keys(contentTypeLabels) as ContentType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-body transition-all ${
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

        <Button
          onClick={() => navigate(`/book/${influencer.id}`)}
          className="w-full bg-gradient-gold text-primary-foreground font-body font-semibold text-sm hover:opacity-90 transition-opacity"
          size="sm"
        >
          Book Now — ${influencer.pricing[selectedType]}
        </Button>
      </div>
    </div>
  );
};

export default MatchResultCard;
