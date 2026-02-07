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
import { CheckCircle, Calendar, CreditCard } from "lucide-react";
import { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);

  // Calculate total based on selected variations and platforms
  const calculateTotal = () => {
    let total = 0;
    posts.forEach((post) => {
      if (post.selectedVariation !== null) {
        // Base price per post (using post-description pricing)
        const basePrice = creator.pricing["post-description"];
        // Double for both platforms
        const multiplier = post.planEntry.platform === "Both" ? 2 : 1;
        total += basePrice * multiplier;
      }
    });
    return total;
  };

  const total = calculateTotal();
  const selectedCount = posts.filter((p) => p.selectedVariation !== null).length;

  const handleConfirm = () => {
    setIsOpen(false);
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" disabled={disabled}>
          <CreditCard className="w-4 h-4 mr-2" />
          Review & Book (${total})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span>Confirm Booking with {creator.name}</span>
          </DialogTitle>
          <DialogDescription>
            Review your content plan before confirming.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-3">
            {posts.map((post, i) => {
              if (post.selectedVariation === null) return null;
              const variation = post.variations[post.selectedVariation];
              const price = creator.pricing["post-description"];
              const multiplier = post.planEntry.platform === "Both" ? 2 : 1;

              return (
                <div
                  key={post.id}
                  className="flex items-start justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {post.planEntry.postType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {post.planEntry.platform} • {variation.tone} tone
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    ${price * multiplier}
                  </span>
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {selectedCount} post{selectedCount !== 1 ? "s" : ""} scheduled
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-display font-bold text-foreground">
                ${total}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingSummary;
