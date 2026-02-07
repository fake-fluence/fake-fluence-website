import type { GeneratedPost, PostVariation } from "@/pages/BookCreator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Image, MessageSquare, Type } from "lucide-react";
import { cn } from "@/lib/utils";

interface GeneratedVariationsProps {
  posts: GeneratedPost[];
  onSelectVariation: (postId: string, variationIndex: number) => void;
}

const platformColors: Record<string, string> = {
  LinkedIn: "bg-blue-500/10 text-blue-600 border-blue-200",
  Instagram: "bg-pink-500/10 text-pink-600 border-pink-200",
  Both: "bg-purple-500/10 text-purple-600 border-purple-200",
};

const GeneratedVariations = ({
  posts,
  onSelectVariation,
}: GeneratedVariationsProps) => {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-display font-semibold text-foreground">
          Generated Variations
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select one variation for each post. Each variation is optimized for different tones and styles.
        </p>
      </div>

      {posts.map((post, postIndex) => (
        <div key={post.id} className="space-y-4">
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

          <div className="grid md:grid-cols-3 gap-4">
            {post.variations.map((variation, varIndex) => (
              <VariationCard
                key={variation.id}
                variation={variation}
                isSelected={post.selectedVariation === varIndex}
                onSelect={() => onSelectVariation(post.id, varIndex)}
                variationNumber={varIndex + 1}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

interface VariationCardProps {
  variation: PostVariation;
  isSelected: boolean;
  onSelect: () => void;
  variationNumber: number;
}

const VariationCard = ({
  variation,
  isSelected,
  onSelect,
  variationNumber,
}: VariationCardProps) => {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md relative",
        isSelected
          ? "ring-2 ring-primary border-primary bg-primary/5"
          : "hover:border-primary/50"
      )}
      onClick={onSelect}
    >
      {isSelected && (
        <div className="absolute top-3 right-3">
          <CheckCircle className="w-5 h-5 text-primary fill-primary/20" />
        </div>
      )}

      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="text-muted-foreground">Variation {variationNumber}</span>
          <Badge variant="secondary" className="text-xs">
            {variation.tone}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mock Image Preview */}
        <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg flex flex-col items-center justify-center p-4 text-center border border-dashed">
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

        {/* Caption Preview */}
        <div className="flex items-start gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed">
            {variation.caption}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneratedVariations;
