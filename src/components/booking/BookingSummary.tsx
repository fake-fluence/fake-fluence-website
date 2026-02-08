import type { Influencer } from "@/data/influencers";
import type { GeneratedPost } from "@/pages/BookCreator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Calendar, CreditCard, Image, Film } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

interface BookingSummaryProps {
  creator: Influencer;
  posts: GeneratedPost[];
  onConfirm: () => void;
  disabled: boolean;
}

const BookingSummary = ({
  creator,
  posts,
  onConfirm,
  disabled,
}: BookingSummaryProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Calculate total based on images + video upgrades
  const calculateTotal = () => {
    let total = 0;
    posts.forEach((post) => {
      if (post.imageBase64) {
        // Get the platform-specific pricing
        const platform = post.planEntry.platform.toLowerCase() as "instagram" | "linkedin" | "tiktok";
        const pricing = creator.platforms[platform].pricing;
        
        // Base image price
        total += pricing.image;
        
        // Add video upgrade if video was generated
        if (post.videoBase64) {
          total += pricing.videoUpgrade;
        }
      }
    });
    return total;
  };

  const total = calculateTotal();
  const imageCount = posts.filter((p) => p.imageBase64).length;
  const videoCount = posts.filter((p) => p.videoBase64).length;

  const handleConfirm = () => {
    setIsOpen(false);
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" disabled={disabled}>
          <CreditCard className="w-4 h-4 mr-2" />
          {t.booking.summary.confirmBooking} (${total})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img
              src={creator.platforms.instagram.avatar}
              alt={creator.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span>{t.booking.book} {creator.name}</span>
          </DialogTitle>
          <DialogDescription>
            {t.booking.summary.title}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-3">
            {posts.map((post) => {
              if (!post.imageBase64) return null;
              const platform = post.planEntry.platform.toLowerCase() as "instagram" | "linkedin" | "tiktok";
              const pricing = creator.platforms[platform].pricing;
              const hasVideo = !!post.videoBase64;

              return (
                <div
                  key={post.id}
                  className="p-3 bg-muted/50 rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {post.planEntry.postType}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {post.planEntry.platform}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pricing breakdown */}
                  <div className="ml-7 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Image className="w-3 h-3" />
                        AI Image
                      </span>
                      <span className="font-medium">${pricing.image}</span>
                    </div>
                    {hasVideo && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Film className="w-3 h-3" />
                          Video Upgrade
                        </span>
                        <span className="font-medium">+${pricing.videoUpgrade}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {imageCount} image{imageCount !== 1 ? "s" : ""}
                {videoCount > 0 && `, ${videoCount} video${videoCount !== 1 ? "s" : ""}`}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{t.booking.summary.estimatedCost}</p>
              <p className="text-xl font-display font-bold text-foreground">
                ${total}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t.booking.variations.cancel}
          </Button>
          <Button onClick={handleConfirm}>
            <CheckCircle className="w-4 h-4 mr-2" />
            {t.booking.summary.confirmBooking}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingSummary;