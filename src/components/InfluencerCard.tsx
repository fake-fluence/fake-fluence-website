import { type Influencer, contentTypeLabels, type ContentType, type Platform, platformLabels } from "@/data/influencers";
import { BadgeCheck, Heart, Users, Eye, ShoppingCart, Instagram, Linkedin, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InfluencerCardProps {
  influencer: Influencer;
  index: number;
  showFullPricing?: boolean;
}

const InfluencerCard = ({ influencer, index, showFullPricing = false }: InfluencerCardProps) => {
  const [selectedType, setSelectedType] = useState<ContentType>("post");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("instagram");
  const { t } = useLanguage();

  const platformData = influencer.platforms[selectedPlatform];

  const getPricingLabel = (type: ContentType): string => {
    const labels: Record<ContentType, string> = {
      post: t.influencer.pricing.photoPost,
      "post-description": t.influencer.pricing.postCaption,
      video: t.influencer.pricing.fullVideo,
    };
    return labels[type];
  };

  const PlatformIcon = ({ platform, className }: { platform: Platform; className?: string }) => {
    switch (platform) {
      case "instagram": return <Instagram className={className} />;
      case "linkedin": return <Linkedin className={className} />;
      case "tiktok": return <Music className={className} />; // Music icon often used for TikTok in icon sets lacking it, or custom SVG
    }
  };

  return (
    <div
      className="group relative rounded-xl overflow-hidden bg-card border border-border hover:border-gold/30 transition-all duration-500 hover:glow-gold opacity-0 animate-fade-in-up flex flex-col h-full"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={platformData.avatar}
          alt={`${influencer.name} - ${platformLabels[selectedPlatform]}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />

        {/* Price badge */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-surface/80 backdrop-blur-sm border border-border text-sm font-body font-semibold text-foreground">
          {t.common.from} ${platformData.pricing.post}
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold text-foreground">
              {influencer.name}
            </h3>
            {influencer.verified && (
              <BadgeCheck className="w-4 h-4 text-primary" />
            )}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground font-body mb-3">
          {influencer.handle}
        </p>
        <p className="text-xs text-primary font-body font-medium mb-4">
          {t.niches[influencer.niche] || influencer.niche}
        </p>

        {/* Platform Toggles */}
        <div className="mb-4">
          <Tabs defaultValue="instagram" value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v as Platform)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-surface/50">
              <TabsTrigger value="instagram" className="text-xs data-[state=active]:bg-background">
                <Instagram className="w-3.5 h-3.5 mr-1.5" /> IG
              </TabsTrigger>
              <TabsTrigger value="linkedin" className="text-xs data-[state=active]:bg-background">
                <Linkedin className="w-3.5 h-3.5 mr-1.5" /> LI
              </TabsTrigger>
              <TabsTrigger value="tiktok" className="text-xs data-[state=active]:bg-background">
                <Music className="w-3.5 h-3.5 mr-1.5" /> TT
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs font-body">{platformData.followers}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Heart className="w-3.5 h-3.5" />
            <span className="text-xs font-body">{platformData.engagement} {t.influencer.engagement.toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-xs font-body">{platformData.avgViews}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="text-xs font-body">{platformData.conversionRate}</span>
          </div>
        </div>

        {/* Content type pricing */}
        {showFullPricing && (
          <div className="mb-4 space-y-2 mt-auto">
            <p className="text-xs text-muted-foreground font-body font-medium uppercase tracking-wider">
              {t.booking.contentPlan.postType.split(" / ")[0]}
            </p>
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
                  <span>{getPricingLabel(type)}</span>
                  <span className="font-semibold">${platformData.pricing[type]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!showFullPricing && (
          <div className="mb-4 text-center py-2 rounded-lg bg-surface border border-border mt-auto">
            <span className="text-xs text-muted-foreground font-body">{t.common.from} </span>
            <span className="text-sm font-display font-bold text-gradient-gold">${platformData.pricing.post}</span>
          </div>
        )}

        {showFullPricing ? (
          <div className="flex gap-2">
            <Link to={`/browse?creator=${influencer.id}`} className="flex-1">
              <Button
                variant="outline"
                className="w-full font-body font-semibold text-sm"
                size="sm"
              >
                {t.influencer.viewProfile}
              </Button>
            </Link>
            <Link to={`/book/${influencer.id}`} className="flex-1">
              <Button
                className="w-full bg-gradient-gold text-primary-foreground font-body font-semibold text-sm hover:opacity-90 transition-opacity"
                size="sm"
              >
                {t.influencer.bookCreator}
              </Button>
            </Link>
          </div>
        ) : (
          <Link to={`/browse?creator=${influencer.id}`} className="mt-auto">
            <Button
              className="w-full bg-gradient-gold text-primary-foreground font-body font-semibold text-sm hover:opacity-90 transition-opacity"
              size="sm"
            >
              {t.influencer.viewProfile}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default InfluencerCard;