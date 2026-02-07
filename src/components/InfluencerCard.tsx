import { type Influencer } from "@/data/influencers";
import { BadgeCheck, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InfluencerCardProps {
  influencer: Influencer;
  index: number;
}

const InfluencerCard = ({ influencer, index }: InfluencerCardProps) => {
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
          ${influencer.pricePerPost}
          <span className="text-muted-foreground text-xs">/post</span>
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
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs font-body">{influencer.followers}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Heart className="w-3.5 h-3.5" />
            <span className="text-xs font-body">{influencer.engagement} eng.</span>
          </div>
        </div>

        <Button
          className="w-full bg-gradient-gold text-primary-foreground font-body font-semibold text-sm hover:opacity-90 transition-opacity"
          size="sm"
        >
          Book Sponsored Post
        </Button>
      </div>
    </div>
  );
};

export default InfluencerCard;
