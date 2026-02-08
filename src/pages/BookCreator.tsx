import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { influencers, type Influencer } from "@/data/influencers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentPlanForm, { type ContentPlanEntry } from "@/components/booking/ContentPlanForm";
import GeneratedContentCard from "@/components/booking/GeneratedContentCard";
import BookingSummary from "@/components/booking/BookingSummary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import InstagramConnectDialog from "@/components/booking/InstagramConnectDialog";

type BookingStep = "plan" | "review" | "confirmed";

export interface GeneratedPost {
  id: string;
  planEntry: ContentPlanEntry;
  imageBase64: string | null;
  videoBase64: string | null;
  videoJobId: string | null;
  videoStatus: "idle" | "generating" | "completed" | "failed";
  caption: string;
  prompt: string;
  selectedVariation: number | null; // Keep for compatibility with BookingSummary
  variations: PostVariation[]; // Keep for compatibility
}

export interface PostVariation {
  id: string;
  caption: string;
  imageDescription: string;
  textOverlay: string;
  tone: string;
}

interface ProductData {
  images: string[];
  name: string;
  description: string;
  categories: string[];
}

const BookCreator = () => {
  const { creatorId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [creator, setCreator] = useState<Influencer | null>(null);
  const [step, setStep] = useState<BookingStep>("plan");
  const [contentPlan, setContentPlan] = useState<ContentPlanEntry[]>([]);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, {
    isGeneratingImage: boolean;
    isEditingImage: boolean;
    isGeneratingVideo: boolean;
  }>>({});

  useEffect(() => {
    const found = influencers.find((i) => i.id === creatorId);
    if (!found) {
      navigate("/browse");
      return;
    }
    setCreator(found);

    // Load product data from localStorage
    try {
      const stored = localStorage.getItem("bookingProductData");
      if (stored) {
        setProductData(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load product data from localStorage");
    }
  }, [creatorId, navigate]);

  const handlePlanSubmit = async (entries: ContentPlanEntry[]) => {
    setContentPlan(entries);
    setIsGenerating(true);

    // Initialize posts without images - user will generate them
    const posts: GeneratedPost[] = entries.map((entry) => ({
      id: `post-${entry.id}`,
      planEntry: entry,
      imageBase64: null,
      videoBase64: null,
      videoJobId: null,
      videoStatus: "idle" as const,
      caption: "",
      prompt: "",
      selectedVariation: 0, // Auto-select for compatibility
      variations: [{
        id: `var-${entry.id}`,
        caption: "",
        imageDescription: "",
        textOverlay: entry.postType,
        tone: "AI Generated",
      }],
    }));

    // Initialize loading states
    const states: Record<string, { isGeneratingImage: boolean; isEditingImage: boolean; isGeneratingVideo: boolean }> = {};
    posts.forEach((p) => {
      states[p.id] = { isGeneratingImage: false, isEditingImage: false, isGeneratingVideo: false };
    });
    setLoadingStates(states);

    setGeneratedPosts(posts);
    setIsGenerating(false);
    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const callGenerateContent = async (action: string, body: Record<string, unknown>) => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content?action=${action}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to ${action}`);
    }

    return response.json();
  };

  const handleGenerateImage = async (postId: string, prompt: string) => {
    setLoadingStates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], isGeneratingImage: true },
    }));

    const post = generatedPosts.find((p) => p.id === postId);

    // Build rich context for the AI
    const influencerContext = creator ? {
      name: creator.name,
      handle: creator.handle,
      niche: creator.niche,
      bio: creator.bio,
      instagramUrl: `https://www.instagram.com/${creator.handle.replace("@", "")}/`,
    } : null;

    const productContext = productData ? {
      name: productData.name,
      description: productData.description,
      categories: productData.categories,
    } : null;

    // Get product image base64 (strip the data:image/...;base64, prefix)
    const productImageBase64 = productData?.images?.[0]
      ? productData.images[0].replace(/^data:image\/[^;]+;base64,/, "")
      : null;

    try {
      const result = await callGenerateContent("generate-image", {
        prompt,
        size: "1024x1024",
        quality: "high",
        influencer: influencerContext,
        product: productContext,
        productImageBase64,
        productUrl: post?.planEntry.productUrl || "",
      });

      setGeneratedPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                imageBase64: result.imageBase64,
                prompt,
                caption: `✨ ${p.planEntry.postType}\n\n${p.planEntry.constraints || ""}`.trim(),
                variations: [{
                  ...p.variations[0],
                  caption: `✨ ${p.planEntry.postType}`,
                  imageDescription: prompt,
                }],
              }
            : p
        )
      );

      toast({
        title: "Image generated!",
        description: "Your AI image is ready. You can edit it or upgrade to video.",
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [postId]: { ...prev[postId], isGeneratingImage: false },
      }));
    }
  };

  const handleEditImage = async (postId: string, editPrompt: string) => {
    const post = generatedPosts.find((p) => p.id === postId);
    if (!post?.imageBase64) return;

    setLoadingStates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], isEditingImage: true },
    }));

    try {
      const result = await callGenerateContent("edit-image", {
        prompt: editPrompt,
        imageBase64: post.imageBase64,
      });

      setGeneratedPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, imageBase64: result.imageBase64, prompt: editPrompt }
            : p
        )
      );

      toast({
        title: "Image updated!",
        description: "Your edit has been applied.",
      });
    } catch (error) {
      console.error("Error editing image:", error);
      toast({
        title: "Edit failed",
        description: error instanceof Error ? error.message : "Failed to edit image",
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [postId]: { ...prev[postId], isEditingImage: false },
      }));
    }
  };

  const handleGenerateVideo = async (postId: string, prompt: string) => {
    const post = generatedPosts.find((p) => p.id === postId);

    setLoadingStates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], isGeneratingVideo: true },
    }));

    setGeneratedPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, videoStatus: "generating" as const } : p
      )
    );

    // Build rich context for video generation
    const influencerContext = creator ? {
      name: creator.name,
      handle: creator.handle,
      niche: creator.niche,
      bio: creator.bio,
      instagramUrl: `https://www.instagram.com/${creator.handle.replace("@", "")}/`,
    } : null;

    const productContext = productData ? {
      name: productData.name,
      description: productData.description,
      categories: productData.categories,
    } : null;

    const productImageBase64 = productData?.images?.[0]
      ? productData.images[0].replace(/^data:image\/[^;]+;base64,/, "")
      : null;

    try {
      const result = await callGenerateContent("generate-video", {
        prompt,
        imageBase64: post?.imageBase64,
        seconds: "4",
        influencer: influencerContext,
        product: productContext,
        productImageBase64,
        productUrl: post?.planEntry.productUrl || "",
      });

      setGeneratedPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, videoJobId: result.jobId, videoStatus: "generating" as const }
            : p
        )
      );

      toast({
        title: "Video generation started!",
        description: "This may take a few minutes. We'll check the status automatically.",
      });
    } catch (error) {
      console.error("Error generating video:", error);
      setGeneratedPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, videoStatus: "failed" as const } : p
        )
      );
      toast({
        title: "Video generation failed",
        description: error instanceof Error ? error.message : "Failed to generate video",
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [postId]: { ...prev[postId], isGeneratingVideo: false },
      }));
    }
  };

  const handleCheckVideoStatus = async (postId: string) => {
    const post = generatedPosts.find((p) => p.id === postId);
    if (!post?.videoJobId) return;

    try {
      const statusResult = await callGenerateContent("video-status", {
        jobId: post.videoJobId,
      });

      if (statusResult.status === "completed") {
        // Download the video
        const downloadResult = await callGenerateContent("download-video", {
          jobId: post.videoJobId,
        });

        setGeneratedPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, videoBase64: downloadResult.videoBase64, videoStatus: "completed" as const }
              : p
          )
        );

        toast({
          title: "Video ready!",
          description: "Your video has been generated successfully.",
        });
      } else if (statusResult.status === "failed") {
        setGeneratedPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, videoStatus: "failed" as const, videoJobId: null } : p
          )
        );
        const reason = statusResult.error?.message || statusResult.failure_reason || "Unknown error";
        toast({
          title: "Video generation failed",
          description: reason.includes("moderation") 
            ? "Content was blocked by moderation. Try a simpler video prompt." 
            : `Failed: ${reason}. Please retry.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking video status:", error);
    }
  };

  const handleUpdateCaption = (postId: string, caption: string) => {
    setGeneratedPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              caption,
              variations: [{ ...post.variations[0], caption }],
            }
          : post
      )
    );
  };

  const handleConfirmBooking = () => {
    setStep("confirmed");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Check if all posts have images
  const allPostsHaveContent = generatedPosts.every((post) => post.imageBase64);

  if (!creator) return null;

  const stepLabels: Record<BookingStep, string> = {
    plan: t.booking.steps.plan,
    review: t.booking.steps.review,
    confirmed: t.booking.steps.confirmed,
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.booking.back}
            </Button>

            <div className="flex items-center gap-4">
              <img
                src={creator.platforms.instagram.avatar}
                alt={creator.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
              />
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  {t.booking.book} {creator.name}
                </h1>
                <p className="text-muted-foreground">
                  {creator.handle} • {creator.niche}
                </p>
              </div>
              <InstagramConnectDialog
                influencerId={creator.id}
                influencerName={creator.name}
              />
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-10">
            {(["plan", "review", "confirmed"] as BookingStep[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step === s
                      ? "bg-primary text-primary-foreground"
                      : ["plan", "review", "confirmed"].indexOf(step) > i
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-sm font-medium ${
                    step === s ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {stepLabels[s]}
                </span>
                {i < 2 && (
                  <div className="w-8 md:w-16 h-px bg-border mx-2" />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {step === "plan" && (
            <ContentPlanForm
              onSubmit={handlePlanSubmit}
              isGenerating={isGenerating}
            />
          )}

          {step === "review" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Generate Your Content
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate an AI image for each post. Edit it until you're happy, then optionally upgrade to video.
                </p>
              </div>

              <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
                {generatedPosts.map((post, index) => (
                  <GeneratedContentCard
                    key={post.id}
                    entry={post.planEntry}
                    index={index}
                    imageBase64={post.imageBase64}
                    videoBase64={post.videoBase64}
                    videoStatus={post.videoStatus}
                    caption={post.caption}
                    isGeneratingImage={loadingStates[post.id]?.isGeneratingImage || false}
                    isEditingImage={loadingStates[post.id]?.isEditingImage || false}
                    isGeneratingVideo={loadingStates[post.id]?.isGeneratingVideo || false}
                    influencerId={creator.id}
                    onGenerateImage={(prompt) => handleGenerateImage(post.id, prompt)}
                    onEditImage={(prompt) => handleEditImage(post.id, prompt)}
                    onGenerateVideo={(prompt) => handleGenerateVideo(post.id, prompt)}
                    onUpdateCaption={(caption) => handleUpdateCaption(post.id, caption)}
                    onCheckVideoStatus={() => handleCheckVideoStatus(post.id)}
                  />
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-between items-center pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setStep("plan")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t.booking.editPlan}
                </Button>

                <BookingSummary
                  creator={creator}
                  posts={generatedPosts}
                  onConfirm={handleConfirmBooking}
                  disabled={!allPostsHaveContent}
                />
              </div>
            </div>
          )}

          {step === "confirmed" && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                {t.booking.confirmed.title}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                {t.booking.confirmed.description.replace("{creatorName}", creator.name)}
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/browse">{t.booking.confirmed.browseMore}</Link>
                </Button>
                <Button asChild>
                  <Link to="/">{t.booking.confirmed.backHome}</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookCreator;
