import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

interface GeneratedVariationsProps {
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

const GeneratedVariations = ({
  posts,
  onSelectVariation,
  onUpdateCaption,
  onRegenerateVariation,
  onRegenerateAll,
  isRegenerating,
}: GeneratedVariationsProps) => {
  const { t } = useLanguage();
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
          {t.booking.variations.title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t.booking.variations.selectBest}
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

              {/* Regenerate All Button */}
              <div className="flex items-center gap-2">
                {!showFeedback[postKey] ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFeedback((prev) => ({ ...prev, [postKey]: true }))}
                    disabled={isPostRegenerating}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t.booking.variations.provideFeedback}
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

            {/* Feedback Input for All Variations */}
            {showFeedback[postKey] && (
              <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
                <p className="text-sm font-medium text-foreground">
                  {t.booking.variations.provideFeedback}
                </p>
                <Textarea
                  placeholder={t.booking.variations.feedbackPlaceholder}
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
                      {t.booking.variations.regenerating}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {t.booking.variations.regenerateAll}
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              {post.variations.map((variation, varIndex) => (
                <VariationCard
                  key={variation.id}
                  variation={variation}
                  isSelected={post.selectedVariation === varIndex}
                  onSelect={() => onSelectVariation(post.id, varIndex)}
                  onUpdateCaption={(newCaption) =>
                    onUpdateCaption(post.id, varIndex, newCaption)
                  }
                  onRegenerate={(feedback) =>
                    onRegenerateVariation(post.id, varIndex, feedback)
                  }
                  variationNumber={varIndex + 1}
                  isRegenerating={isRegenerating[`${post.id}-${varIndex}`]}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface VariationCardProps {
  variation: PostVariation;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateCaption: (newCaption: string) => void;
  onRegenerate: (feedback: string) => void;
  variationNumber: number;
  isRegenerating?: boolean;
}

const VariationCard = ({
  variation,
  isSelected,
  onSelect,
  onUpdateCaption,
  onRegenerate,
  variationNumber,
  isRegenerating,
}: VariationCardProps) => {
  const { t } = useLanguage();
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState(variation.caption);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleSaveCaption = () => {
    onUpdateCaption(editedCaption);
    setIsEditingCaption(false);
  };

  const handleCancelEdit = () => {
    setEditedCaption(variation.caption);
    setIsEditingCaption(false);
  };

  const handleRegenerate = () => {
    onRegenerate(feedback);
    setFeedback("");
    setShowFeedbackInput(false);
  };

  return (
    <Card
      className={cn(
        "transition-all relative",
        isSelected
          ? "ring-2 ring-primary border-primary bg-primary/5"
          : "hover:border-primary/50",
        isRegenerating && "opacity-60 pointer-events-none"
      )}
    >
      {isRegenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 rounded-lg">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {isSelected && (
        <div className="absolute top-3 right-3 z-20">
          <CheckCircle className="w-5 h-5 text-primary fill-primary/20" />
        </div>
      )}

      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="text-muted-foreground">{t.booking.variations.variation} {variationNumber}</span>
          <Badge variant="secondary" className="text-xs">
            {t.variationTones[variation.tone as keyof typeof t.variationTones] || variation.tone}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mock Image Preview */}
        <div
          className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg flex flex-col items-center justify-center p-4 text-center border border-dashed cursor-pointer hover:bg-muted/70 transition-colors"
          onClick={onSelect}
        >
          <Image className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {variation.imageDescription}
          </p>
        </div>

        {/* Text Overlay Preview */}
        <div className="flex items-start gap-2 p-2 bg-muted/50 rounded">
          <Type className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-foreground">
            {variation.textOverlay}
          </p>
        </div>

        {/* Caption - Editable */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{t.booking.variations.caption}</span>
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
                {t.booking.variations.edit}
              </Button>
            )}
          </div>

          {isEditingCaption ? (
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
              <Textarea
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                rows={4}
                className="text-xs resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs" onClick={handleSaveCaption}>
                  <Check className="w-3 h-3 mr-1" />
                  {t.booking.variations.save}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={handleCancelEdit}
                >
                  {t.booking.variations.cancel}
                </Button>
              </div>
            </div>
          ) : (
            <p
              className="text-xs text-muted-foreground line-clamp-4 leading-relaxed cursor-pointer hover:text-foreground transition-colors"
              onClick={onSelect}
            >
              {variation.caption}
            </p>
          )}
        </div>

        {/* Regenerate Single Variation */}
        <div className="pt-2 border-t space-y-2">
          {!showFeedbackInput ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setShowFeedbackInput(true);
              }}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              {t.booking.variations.regenerate}
            </Button>
          ) : (
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
              <Input
                placeholder={t.booking.variations.feedbackPlaceholder}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="h-8 text-xs"
              />
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs flex-1" onClick={handleRegenerate}>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  {t.booking.variations.regenerate}
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

        {/* Select Button */}
        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className="w-full"
          onClick={onSelect}
        >
          {isSelected ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              {t.booking.variations.selected}
            </>
          ) : (
            t.booking.variations.select
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GeneratedVariations;
