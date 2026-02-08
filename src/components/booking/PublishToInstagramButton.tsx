import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Instagram, Loader2, CheckCircle, ExternalLink } from "lucide-react";

interface PublishToInstagramButtonProps {
  influencerId: string;
  imageBase64: string | null;
  caption: string;
  disabled?: boolean;
}

const callInstagramApi = async (action: string, body: Record<string, unknown>) => {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/instagram-api?action=${action}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Instagram API error: ${response.status}`);
  }
  return data;
};

const PublishToInstagramButton = ({
  influencerId,
  imageBase64,
  caption,
  disabled = false,
}: PublishToInstagramButtonProps) => {
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const handlePublish = async () => {
    if (!imageBase64) return;

    setIsPublishing(true);
    try {
      // First check if credentials exist
      const creds = await callInstagramApi("get-credentials", { influencerId });
      if (!creds.connected) {
        toast({
          title: "Instagram not connected",
          description: "This influencer's Instagram account has not been connected yet. Please contact the admin.",
          variant: "destructive",
        });
        return;
      }

      // Publish
      const result = await callInstagramApi("publish-image", {
        influencerId,
        imageBase64,
        caption,
      });

      setPublished(true);
      toast({
        title: "Published to Instagram! 🎉",
        description: `Post ID: ${result.postId}`,
      });
    } catch (error) {
      console.error("Error publishing to Instagram:", error);
      toast({
        title: "Publishing failed",
        description: error instanceof Error ? error.message : "Failed to publish to Instagram",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (published) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2 text-primary">
        <CheckCircle className="w-4 h-4" />
        Published to Instagram
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handlePublish}
      disabled={disabled || isPublishing || !imageBase64}
      className="gap-2"
    >
      {isPublishing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Instagram className="w-4 h-4" />
      )}
      {isPublishing ? "Publishing..." : "Publish to Instagram"}
    </Button>
  );
};

export default PublishToInstagramButton;
