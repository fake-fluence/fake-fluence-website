import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "framer-motion";
import type { GeneratedPost, PostVariation } from "@/pages/BookCreator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  Image,
  MessageSquare,
  Type,
  RefreshCw,
  Pencil,
  MessageCircle,
  X,
  Check,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableVariationsProps {
  posts: GeneratedPost[];
  onSelectVariation: (postId: string, variationIndex: number) => void;
  onUpdateCaption: (postId: string, variationIndex: number, newCaption: string) => void;
  onRegenerateVariation: (postId: string, variationIndex: number, feedback: string) => void;
  onRegenerateAll: (postId: string, feedback: string) => void;
  isRegenerating: Record<string, boolean>;
}

const platformColors: Record<string, string> = {
  LinkedIn: "bg-blue-500/10 text-blue-600 border-blue-200",
  Instagram: "bg-pink-500/10 text-pink-600 border-pink-200",
  Both: "bg-purple-500/10 text-purple-600 border-purple-200",
};

const SwipeableVariations = ({
  posts,
  onSelectVariation,
  onUpdateCaption,
  onRegenerateVariation,
  onRegenerateAll,
  isRegenerating,
}: SwipeableVariationsProps) => {
  const [postFeedback, setPostFeedback] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});

  const handleRegenerateAll = (postId: string) => {
    const feedback = postFeedback[postId] || "";
    onRegenerateAll(postId, feedback);
    setPostFeedback((prev) => ({ ...prev, [postId]: "" }));
    setShowFeedback((prev) => ({ ...prev, [postId]: false }));
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-display font-semibold text-foreground">
          Review Variations
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Swipe right to like, left to pass. Edit captions or regenerate with feedback.
        </p>
      </div>

      {posts.map((post, postIndex) => {
        const postKey = post.id;
        const isPostRegenerating = isRegenerating[postKey];

        return (
          <div key={post.id} className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                  {postIndex + 1}
                </span>
                <div>
                  <h3 className="font-medium text-foreground">
                    {post.planEntry.postType}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className={platformColors[post.planEntry.platform]}
                    >
                      {post.planEntry.platform}
                    </Badge>
                    {post.planEntry.constraints && (
                      <span className="text-xs text-muted-foreground">
                        {post.planEntry.constraints}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!showFeedback[postKey] ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFeedback((prev) => ({ ...prev, [postKey]: true }))}
                    disabled={isPostRegenerating}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Provide Feedback
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFeedback((prev) => ({ ...prev, [postKey]: false }))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {showFeedback[postKey] && (
              <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
                <p className="text-sm font-medium text-foreground">
                  What would you like to change?
                </p>
                <Textarea
                  placeholder="e.g., Make the tone more professional, add a stronger CTA, use different emojis..."
                  value={postFeedback[postKey] || ""}
                  onChange={(e) =>
                    setPostFeedback((prev) => ({ ...prev, [postKey]: e.target.value }))
                  }
                  rows={2}
                  className="resize-none"
                />
                <Button
                  size="sm"
                  onClick={() => handleRegenerateAll(postKey)}
                  disabled={isPostRegenerating}
                >
                  {isPostRegenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate All Variations
                    </>
                  )}
                </Button>
              </div>
            )}

            <SwipeableCardStack
              post={post}
              onSelectVariation={(varIndex) => onSelectVariation(post.id, varIndex)}
              onUpdateCaption={(varIndex, caption) => onUpdateCaption(post.id, varIndex, caption)}
              onRegenerate={(varIndex, feedback) => onRegenerateVariation(post.id, varIndex, feedback)}
              isRegenerating={isRegenerating}
            />
          </div>
        );
      })}
    </div>
  );
};

interface SwipeableCardStackProps {
  post: GeneratedPost;
  onSelectVariation: (variationIndex: number) => void;
  onUpdateCaption: (variationIndex: number, newCaption: string) => void;
  onRegenerate: (variationIndex: number, feedback: string) => void;
  isRegenerating: Record<string, boolean>;
}

const SwipeableCardStack = ({
  post,
  onSelectVariation,
  onUpdateCaption,
  onRegenerate,
  isRegenerating,
}: SwipeableCardStackProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<number, "liked" | "passed">>({});
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);

  const currentVariation = post.variations[currentIndex];
  const isCurrentRegenerating = isRegenerating[`${post.id}-${currentIndex}`];

  const handleSwipe = (direction: "left" | "right") => {
    setExitDirection(direction);
    
    if (direction === "right") {
      setDecisions((prev) => ({ ...prev, [currentIndex]: "liked" }));
      onSelectVariation(currentIndex);
    } else {
      setDecisions((prev) => ({ ...prev, [currentIndex]: "passed" }));
    }

    setTimeout(() => {
      if (currentIndex < post.variations.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
      setExitDirection(null);
    }, 200);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setDecisions((prev) => {
        const updated = { ...prev };
        delete updated[newIndex];
        return updated;
      });
    }
  };

  const goToCard = (index: number) => {
    setCurrentIndex(index);
  };

  const allReviewed = Object.keys(decisions).length === post.variations.length;
  const likedVariations = Object.entries(decisions)
    .filter(([_, decision]) => decision === "liked")
    .map(([index]) => parseInt(index));

  return (
    <div className="space-y-4">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {post.variations.map((_, index) => (
          <button
            key={index}
            onClick={() => goToCard(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              currentIndex === index
                ? "bg-primary scale-125"
                : decisions[index] === "liked"
                ? "bg-green-500"
                : decisions[index] === "passed"
                ? "bg-red-400"
                : "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>

      {/* Card Stack Container */}
      <div className="relative h-[520px] flex items-center justify-center">
        {/* Background cards for depth effect */}
        {post.variations.map((variation, index) => {
          if (index < currentIndex || index > currentIndex + 2) return null;
          const offset = index - currentIndex;
          if (offset === 0) return null;

          return (
            <div
              key={variation.id}
              className="absolute w-full max-w-sm"
              style={{
                transform: `scale(${1 - offset * 0.05}) translateY(${offset * 10}px)`,
                zIndex: 10 - offset,
                opacity: 1 - offset * 0.3,
              }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="aspect-square bg-muted rounded-lg" />
                </CardContent>
              </Card>
            </div>
          );
        })}

        {/* Active Swipeable Card */}
        {currentVariation && !exitDirection && (
          <SwipeableCard
            key={currentVariation.id}
            variation={currentVariation}
            variationNumber={currentIndex + 1}
            isSelected={post.selectedVariation === currentIndex}
            onSwipe={handleSwipe}
            onUpdateCaption={(caption) => onUpdateCaption(currentIndex, caption)}
            onRegenerate={(feedback) => onRegenerate(currentIndex, feedback)}
            isRegenerating={isCurrentRegenerating}
            decision={decisions[currentIndex]}
          />
        )}

        {/* Exit Animation Card */}
        <AnimatePresence>
          {exitDirection && currentVariation && (
            <motion.div
              key={`exit-${currentVariation.id}`}
              className="absolute w-full max-w-sm z-20"
              initial={{ x: 0, rotate: 0, opacity: 1 }}
              animate={{
                x: exitDirection === "right" ? 400 : -400,
                rotate: exitDirection === "right" ? 20 : -20,
                opacity: 0,
              }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        {/* Swipe Hint Overlays */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
            <ThumbsDown className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
            <ThumbsUp className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          className="w-14 h-14 rounded-full p-0 border-red-300 hover:bg-red-50 hover:border-red-400"
          onClick={() => handleSwipe("left")}
          disabled={!currentVariation || isCurrentRegenerating}
        >
          <ThumbsDown className="w-6 h-6 text-red-500" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={currentIndex === 0}
          className="text-muted-foreground"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Undo
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-14 h-14 rounded-full p-0 border-green-300 hover:bg-green-50 hover:border-green-400"
          onClick={() => handleSwipe("right")}
          disabled={!currentVariation || isCurrentRegenerating}
        >
          <ThumbsUp className="w-6 h-6 text-green-500" />
        </Button>
      </div>

      {/* Summary when all reviewed */}
      {allReviewed && (
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-center">
          <CheckCircle className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">
            All variations reviewed!
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            You liked {likedVariations.length} of {post.variations.length} variations.
            {likedVariations.length > 0 && (
              <span className="block mt-1">
                Selected: Variation {(post.selectedVariation ?? likedVariations[0]) + 1}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

interface SwipeableCardProps {
  variation: PostVariation;
  variationNumber: number;
  isSelected: boolean;
  onSwipe: (direction: "left" | "right") => void;
  onUpdateCaption: (newCaption: string) => void;
  onRegenerate: (feedback: string) => void;
  isRegenerating?: boolean;
  decision?: "liked" | "passed";
}

const SwipeableCard = ({
  variation,
  variationNumber,
  isSelected,
  onSwipe,
  onUpdateCaption,
  onRegenerate,
  isRegenerating,
  decision,
}: SwipeableCardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState(variation.caption);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe("right");
    } else if (info.offset.x < -100) {
      onSwipe("left");
    }
  };

  const handleSaveCaption = () => {
    onUpdateCaption(editedCaption);
    setIsEditingCaption(false);
  };

  const handleRegenerate = () => {
    onRegenerate(feedback);
    setFeedback("");
    setShowFeedbackInput(false);
  };

  return (
    <motion.div
      className="absolute w-full max-w-sm z-20 cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
    >
      {/* Like/Pass Indicators */}
      <motion.div
        className="absolute -top-2 -right-2 z-30 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg"
        style={{ opacity: likeOpacity }}
      >
        LIKE
      </motion.div>
      <motion.div
        className="absolute -top-2 -left-2 z-30 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg"
        style={{ opacity: passOpacity }}
      >
        PASS
      </motion.div>

      <Card
        className={cn(
          "transition-colors relative overflow-hidden",
          isSelected && "ring-2 ring-primary",
          decision === "liked" && "ring-2 ring-green-500",
          decision === "passed" && "ring-2 ring-red-400",
          isRegenerating && "opacity-60 pointer-events-none"
        )}
      >
        {isRegenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Variation {variationNumber}</span>
              <Badge variant="secondary" className="text-xs">
                {variation.tone}
              </Badge>
            </div>
            {decision && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  decision === "liked" ? "border-green-500 text-green-600" : "border-red-400 text-red-500"
                )}
              >
                {decision === "liked" ? "Liked" : "Passed"}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Image Preview */}
          <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex flex-col items-center justify-center p-4 text-center border border-dashed">
            <Image className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {variation.imageDescription}
            </p>
          </div>

          {/* Text Overlay */}
          <div className="flex items-start gap-2 p-2 bg-muted/50 rounded">
            <Type className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-foreground line-clamp-1">
              {variation.textOverlay}
            </p>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Caption</span>
              </div>
              {!isEditingCaption && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingCaption(true);
                  }}
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>

            {isEditingCaption ? (
              <div className="space-y-2" onPointerDownCapture={(e) => e.stopPropagation()}>
                <Textarea
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  rows={3}
                  className="text-xs resize-none"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs" onClick={handleSaveCaption}>
                    <Check className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => {
                      setEditedCaption(variation.caption);
                      setIsEditingCaption(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                {variation.caption}
              </p>
            )}
          </div>

          {/* Regenerate */}
          <div className="pt-2 border-t">
            {!showFeedbackInput ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => setShowFeedbackInput(true)}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Regenerate with Feedback
              </Button>
            ) : (
              <div className="space-y-2" onPointerDownCapture={(e) => e.stopPropagation()}>
                <Input
                  placeholder="What to change..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="h-8 text-xs"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs flex-1" onClick={handleRegenerate}>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Regenerate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => setShowFeedbackInput(false)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SwipeableVariations;
