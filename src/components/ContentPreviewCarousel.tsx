import { useState } from "react";
import { type Influencer, contentTypeLabels, type ContentType } from "@/data/influencers";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, ShoppingCart, X, Play } from "lucide-react";
import mockPost1 from "@/assets/mock-post-1.jpg";
import mockPost2 from "@/assets/mock-post-2.jpg";
import mockPost3 from "@/assets/mock-post-3.jpg";
import mockPost4 from "@/assets/mock-post-4.jpg";

interface ContentPreviewCarouselProps {
  influencer: Influencer;
  contentType: ContentType;
  onClose: () => void;
  onPurchase: () => void;
}

interface MockContent {
  id: string;
  image: string;
  type: "image" | "video";
  caption: string;
  style: string;
}

const generateMockContent = (influencer: Influencer, contentType: ContentType): MockContent[] => {
  const isVideo = contentType === "video";
  const hasCaption = contentType !== "post";

  const allMocks = [
    {
      id: "1",
      image: mockPost1,
      type: (isVideo ? "video" : "image") as "image" | "video",
      caption: hasCaption
        ? `✨ Obsessed with this! As someone who values quality, I can't recommend this enough. The results speak for themselves 💫 #sponsored #${influencer.niche.split(" ")[0].toLowerCase()}`
        : "",
      style: "Golden Hour Aesthetic",
    },
    {
      id: "2",
      image: mockPost2,
      type: (isVideo ? "video" : "image") as "image" | "video",
      caption: hasCaption
        ? `New favorite just dropped 🔥 If you know me, you know I only share what I truly love. This one's a game changer! Link in bio 🛒 #ad #${influencer.niche.split(" ")[0].toLowerCase()}`
        : "",
      style: "Minimalist Flat Lay",
    },
    {
      id: "3",
      image: mockPost3,
      type: (isVideo ? "video" : "image") as "image" | "video",
      caption: hasCaption
        ? `POV: You finally find THE product 😍 Trust me on this one — swipe to see why! #partnership #${influencer.niche.split(" ")[0].toLowerCase()}`
        : "",
      style: "Close-Up Reveal",
    },
    {
      id: "4",
      image: mockPost4,
      type: (isVideo ? "video" : "image") as "image" | "video",
      caption: hasCaption
        ? `Been using this for a week and WOW 🙌 The quality is unmatched. Drop a ❤️ if you want a full review! #collab #${influencer.niche.split(" ")[0].toLowerCase()}`
        : "",
      style: "Lifestyle Action Shot",
    },
  ];

  return allMocks;
};

const ContentPreviewCarousel = ({
  influencer,
  contentType,
  onClose,
  onPurchase,
}: ContentPreviewCarouselProps) => {
  const mockContent = generateMockContent(influencer, contentType);
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = mockContent[currentIndex];

  const goNext = () => setCurrentIndex((i) => (i + 1) % mockContent.length);
  const goPrev = () => setCurrentIndex((i) => (i - 1 + mockContent.length) % mockContent.length);

  // Handle swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
    }
    setTouchStart(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-start">
        {/* Image area */}
        <div
          className="relative flex-1 w-full"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation arrows */}
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-surface transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-surface transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="rounded-xl overflow-hidden border border-border aspect-square max-h-[70vh] mx-auto relative">
            <img
              src={current.image}
              alt={`Generated content ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {current.type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/20">
                <div className="w-16 h-16 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center border border-border">
                  <Play className="w-7 h-7 text-foreground ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {mockContent.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex
                    ? "w-6 bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          {/* Creator info */}
          <div className="flex items-center gap-3">
            <img
              src={influencer.avatar}
              alt={influencer.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
            />
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">
                {influencer.name}
              </h3>
              <p className="text-xs text-muted-foreground font-body">
                {influencer.handle}
              </p>
            </div>
          </div>

          {/* Style label */}
          <div className="p-3 rounded-lg bg-surface border border-border">
            <p className="text-xs text-muted-foreground font-body mb-1">Style</p>
            <p className="text-sm text-foreground font-body font-medium">
              {current.style}
            </p>
          </div>

          {/* Content type */}
          <div className="p-3 rounded-lg bg-surface border border-border">
            <p className="text-xs text-muted-foreground font-body mb-1">Content Type</p>
            <p className="text-sm text-foreground font-body font-medium">
              {contentTypeLabels[contentType]}
            </p>
          </div>

          {/* Caption preview */}
          {current.caption && (
            <div className="p-3 rounded-lg bg-surface border border-border">
              <p className="text-xs text-muted-foreground font-body mb-2">
                Caption Preview
              </p>
              <p className="text-sm text-foreground font-body leading-relaxed">
                {current.caption}
              </p>
            </div>
          )}

          {/* Price & actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-body">Total</span>
              <span className="text-2xl font-display font-bold text-gradient-gold">
                ${influencer.pricing[contentType]}
              </span>
            </div>

            <Button
              onClick={onPurchase}
              className="w-full bg-gradient-gold text-primary-foreground font-body font-semibold text-base py-5 shadow-gold hover:opacity-90 transition-opacity"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Purchase This Content
            </Button>

            <Button
              variant="outline"
              className="w-full border-border text-foreground font-body font-medium hover:bg-surface-hover"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPreviewCarousel;
