import { useState } from "react";
import { type Influencer, type Platform, platformLabels, getDisplayHandle } from "@/data/influencers";
import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BadgeCheck,
  MapPin,
  Calendar,
  Globe,
  Users,
  Heart,
  Eye,
  ShoppingCart,
  Instagram,
  Linkedin,
  Music,
  Sparkles,
} from "lucide-react";

interface InfluencerProfileDialogProps {
  influencer: Influencer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InfluencerProfileDialog = ({ influencer, open, onOpenChange }: InfluencerProfileDialogProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("instagram");
  const { t } = useLanguage();

  const platformData = influencer.platforms[selectedPlatform];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Hero header with avatar */}
        <div className="relative">
          <div className="aspect-[16/9] overflow-hidden rounded-t-lg">
            <img
              src={platformData.avatar}
              alt={`${influencer.name} - ${platformLabels[selectedPlatform]}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-display font-bold text-foreground drop-shadow-md">
                {influencer.name}
              </h2>
              {influencer.verified && (
                <BadgeCheck className="w-5 h-5 text-primary drop-shadow-md" />
              )}
            </div>
            <p className="text-sm text-muted-foreground font-body drop-shadow-md">
              {getDisplayHandle(influencer, selectedPlatform)}
            </p>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-5">
          {/* Quick info badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="secondary" className="gap-1.5 font-body">
              <MapPin className="w-3 h-3" />
              {influencer.location}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 font-body">
              <Calendar className="w-3 h-3" />
              {influencer.category === "pets"
                ? `${influencer.age} ${influencer.age === 1 ? "year" : "years"}`
                : `${influencer.age} ${t.profile.yearsOld}`
              }
            </Badge>
            <Badge variant="secondary" className="gap-1.5 font-body">
              <Globe className="w-3 h-3" />
              {influencer.languages.join(", ")}
            </Badge>
            <Badge variant="outline" className="gap-1.5 font-body text-primary">
              {t.niches[influencer.niche] || influencer.niche}
            </Badge>
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-sm font-display font-semibold text-foreground mb-1.5">
              {t.profile.bio}
            </h3>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              {influencer.bio}
            </p>
          </div>

          {/* Member since */}
          <p className="text-xs text-muted-foreground font-body">
            {t.profile.memberSince} {influencer.joinedYear}
          </p>

          {/* Platform Toggle */}
          <div>
            <h3 className="text-sm font-display font-semibold text-foreground mb-2">
              {t.profile.stats}
            </h3>
            <Tabs value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v as Platform)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-surface/50">
                <TabsTrigger value="instagram" className="text-xs data-[state=active]:bg-background">
                  <Instagram className="w-3.5 h-3.5 mr-1.5" /> Instagram
                </TabsTrigger>
                <TabsTrigger value="linkedin" className="text-xs data-[state=active]:bg-background">
                  <Linkedin className="w-3.5 h-3.5 mr-1.5" /> LinkedIn
                </TabsTrigger>
                <TabsTrigger value="tiktok" className="text-xs data-[state=active]:bg-background">
                  <Music className="w-3.5 h-3.5 mr-1.5" /> TikTok
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-surface border border-border">
              <Users className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground font-body">{t.influencer.followers}</p>
                <p className="text-sm font-display font-semibold text-foreground">{platformData.followers}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-surface border border-border">
              <Heart className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground font-body">{t.influencer.engagement}</p>
                <p className="text-sm font-display font-semibold text-foreground">{platformData.engagement}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-surface border border-border">
              <Eye className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground font-body">{t.influencer.avgViews}</p>
                <p className="text-sm font-display font-semibold text-foreground">{platformData.avgViews}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-surface border border-border">
              <ShoppingCart className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground font-body">{t.influencer.conversionRate}</p>
                <p className="text-sm font-display font-semibold text-foreground">{platformData.conversionRate}</p>
              </div>
            </div>
          </div>

          {/* Simplified Pricing */}
          <div>
            <h3 className="text-sm font-display font-semibold text-foreground mb-2">
              {t.profile.pricing}
            </h3>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-foreground text-sm font-body">
                <span>AI Image</span>
                <span className="font-semibold">${platformData.pricing.image}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface border border-border text-muted-foreground text-sm font-body">
                <span>+ Video Upgrade</span>
                <span className="font-semibold">+${platformData.pricing.videoUpgrade}</span>
              </div>
            </div>
          </div>

          {/* Actions - prompts user to search for creators first */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              variant="outline"
              className="w-full font-body"
              onClick={() => onOpenChange(false)}
            >
              {t.profile.close}
            </Button>
            <Link to="/get-started" className="w-full">
              <Button className="w-full bg-gradient-gold text-primary-foreground font-body font-semibold hover:opacity-90 transition-opacity gap-2">
                <Sparkles className="w-4 h-4" />
                Find Best Match for My Product
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfluencerProfileDialog;