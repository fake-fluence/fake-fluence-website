import { type Influencer, type Platform, platformLabels, getDisplayHandle } from "@/data/influencers";
import { BadgeCheck, Heart, Users, Eye, ShoppingCart, Instagram, Linkedin, Music, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InfluencerProfileDialog from "./InfluencerProfileDialog";

interface InfluencerCardProps {
  influencer: Influencer;
  index: number;
  showFullPricing?: boolean;
}

const InfluencerCard = ({ influencer, index, showFullPricing = false }: InfluencerCardProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("instagram");
  const [profileOpen, setProfileOpen] = useState(false);
  const { t } = useLanguage();

  const platformData = influencer.platforms[selectedPlatform];

  return (
    <>
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
            {t.common.from} ${platformData.pricing.image}
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
            {getDisplayHandle(influencer, selectedPlatform)}
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

          {/* Pricing display */}
          {showFullPricing && (
            <div className="mb-4 space-y-2 mt-auto">
              <p className="text-xs text-muted-foreground font-body font-medium uppercase tracking-wider">
                Pricing
              </p>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 text-foreground text-xs font-body">
                  <span>AI Image</span>
                  <span className="font-semibold">${platformData.pricing.image}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface border border-border text-muted-foreground text-xs font-body">
                  <span>+ Video Upgrade</span>
                  <span className="font-semibold">+${platformData.pricing.videoUpgrade}</span>
                </div>
              </div>
            </div>
          )}

          {!showFullPricing && (
            <div className="mb-4 text-center py-2 rounded-lg bg-surface border border-border mt-auto">
              <span className="text-xs text-muted-foreground font-body">{t.common.from} </span>
              <span className="text-sm font-display font-bold text-gradient-gold">${platformData.pricing.image}</span>
            </div>
          )}

          {/* View Profile button - booking requires search first */}
          <Button
            className="w-full bg-gradient-gold text-primary-foreground font-body font-semibold text-sm hover:opacity-90 transition-opacity mt-auto"
            size="sm"
            onClick={() => setProfileOpen(true)}
          >
            {t.influencer.viewProfile}
          </Button>
        </div>
      </div>

      <InfluencerProfileDialog
        influencer={influencer}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />
    </>
  );
};

export default InfluencerCard;