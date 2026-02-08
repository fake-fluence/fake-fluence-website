import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Image,
  Video,
  MessageSquare,
  RefreshCw,
  Pencil,
  X,
  Check,
  Loader2,
  Sparkles,
  Play,
  Film,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import type { ContentPlanEntry } from "@/components/booking/ContentPlanForm";

interface GeneratedContentCardProps {
  entry: ContentPlanEntry;
  index: number;
  imageBase64: string | null;
  videoBase64: string | null;
  videoStatus: "idle" | "generating" | "completed" | "failed";
  caption: string;
  isGeneratingImage: boolean;
  isEditingImage: boolean;
  isGeneratingVideo: boolean;
  onGenerateImage: (prompt: string) => void;
  onEditImage: (editPrompt: string) => void;
  onGenerateVideo: (prompt: string) => void;
  onUpdateCaption: (caption: string) => void;
  onCheckVideoStatus: () => void;
}

const platformColors: Record<string, string> = {
  LinkedIn: "bg-blue-500/10 text-blue-600 border-blue-200",
  Instagram: "bg-pink-500/10 text-pink-600 border-pink-200",
  TikTok: "bg-foreground/10 text-foreground border-foreground/20",
};

const GeneratedContentCard = ({
  entry,
  index,
  imageBase64,
  videoBase64,
  videoStatus,
  caption,
  isGeneratingImage,
  isEditingImage,
  isGeneratingVideo,
  onGenerateImage,
  onEditImage,
  onGenerateVideo,
  onUpdateCaption,
  onCheckVideoStatus,
}: GeneratedContentCardProps) => {
  const { t } = useLanguage();
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState(caption);
  const [showImageEdit, setShowImageEdit] = useState(false);
  const [imageEditPrompt, setImageEditPrompt] = useState("");
  const [showVideoPrompt, setShowVideoPrompt] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState("");

  // Update editedCaption when caption prop changes
  useEffect(() => {
    setEditedCaption(caption);
  }, [caption]);

  // Poll for video status when generating
  useEffect(() => {
    if (videoStatus === "generating") {
      const interval = setInterval(() => {
        onCheckVideoStatus();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [videoStatus, onCheckVideoStatus]);

  const handleSaveCaption = () => {
    onUpdateCaption(editedCaption);
    setIsEditingCaption(false);
  };

  const handleCancelEdit = () => {
    setEditedCaption(caption);
    setIsEditingCaption(false);
  };

  const handleEditImage = () => {
    if (imageEditPrompt.trim()) {
      onEditImage(imageEditPrompt);
      setImageEditPrompt("");
      setShowImageEdit(false);
    }
  };

  const handleGenerateVideo = () => {
    const prompt = videoPrompt.trim() || `Animate this image: ${entry.postType}`;
    onGenerateVideo(prompt);
    setVideoPrompt("");
    setShowVideoPrompt(false);
  };

  const buildInitialPrompt = () => {
    const platformStyle = entry.platform === "LinkedIn" 
      ? "Professional, clean business aesthetic" 
      : entry.platform === "TikTok"
      ? "Trendy, vibrant, eye-catching for short-form video"
      : "Modern, engaging social media style";
    
    return `Create a compelling ${entry.platform} post image for: ${entry.postType}. ${platformStyle}. ${entry.designElements || ""} ${entry.constraints || ""}`.trim();
  };

  const isLoading = isGeneratingImage || isEditingImage;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <CardTitle className="text-base font-medium">
                {entry.postType}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={platformColors[entry.platform]}
                >
                  {entry.platform}
                </Badge>
                {entry.constraints && (
                  <span className="text-xs text-muted-foreground">
                    {entry.constraints}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Image/Video Display Area */}
        <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden border">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                {isGeneratingImage ? "Generating image..." : "Editing image..."}
              </p>
            </div>
          )}

          {videoBase64 ? (
            <video
              src={`data:video/mp4;base64,${videoBase64}`}
              controls
              className="w-full h-full object-cover"
            />
          ) : imageBase64 ? (
            <img
              src={`data:image/png;base64,${imageBase64}`}
              alt="Generated content"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <Image className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                Generate an AI image for this post
              </p>
              <Button
                onClick={() => onGenerateImage(buildInitialPrompt())}
                disabled={isLoading}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Image
              </Button>
            </div>
          )}
        </div>

        {/* Image Actions */}
        {imageBase64 && !videoBase64 && (
          <div className="space-y-3">
            {/* Edit Image */}
            {!showImageEdit ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowImageEdit(true)}
                disabled={isLoading}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Image with AI
              </Button>
            ) : (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                <p className="text-xs font-medium text-foreground">
                  Describe what to change:
                </p>
                <Input
                  placeholder="e.g., Make it more colorful, add a sunset background..."
                  value={imageEditPrompt}
                  onChange={(e) => setImageEditPrompt(e.target.value)}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleEditImage}
                    disabled={!imageEditPrompt.trim() || isLoading}
                  >
                    {isEditingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Editing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Apply Edit
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowImageEdit(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Upgrade to Video */}
            <div className="pt-2 border-t">
              {videoStatus === "idle" && !showVideoPrompt && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowVideoPrompt(true)}
                  disabled={isLoading}
                >
                  <Film className="w-4 h-4 mr-2" />
                  Upgrade to Video
                </Button>
              )}

              {showVideoPrompt && videoStatus === "idle" && (
                <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                  <p className="text-xs font-medium text-foreground">
                    Describe the video motion (optional):
                  </p>
                  <Input
                    placeholder="e.g., Slow zoom in, particles floating..."
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleGenerateVideo}
                      disabled={isGeneratingVideo}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Generate Video
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowVideoPrompt(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {videoStatus === "generating" && (
                <div className="flex items-center justify-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-primary">
                    Generating video... This may take a few minutes
                  </span>
                </div>
              )}

              {videoStatus === "failed" && (
                <div className="flex items-center justify-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <span className="text-sm text-destructive">
                    Video generation failed. Please try again.
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowVideoPrompt(true)}
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video actions */}
        {videoBase64 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Play className="w-3 h-3" />
              Video Ready
            </Badge>
          </div>
        )}

        {/* Caption Section */}
        {imageBase64 && (
          <div className="space-y-2 pt-2 border-t">
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
                  onClick={() => setIsEditingCaption(true)}
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>

            {isEditingCaption ? (
              <div className="space-y-2">
                <Textarea
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  rows={4}
                  className="text-sm resize-none"
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
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {caption || "Add a caption for this post..."}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneratedContentCard;
