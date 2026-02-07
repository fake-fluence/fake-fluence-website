import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { influencers, type Influencer } from "@/data/influencers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentPlanForm, { type ContentPlanEntry } from "@/components/booking/ContentPlanForm";
import SwipeableVariations from "@/components/booking/SwipeableVariations";
import BookingSummary from "@/components/booking/BookingSummary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";

type BookingStep = "plan" | "review" | "confirmed";

export interface GeneratedPost {
  id: string;
  planEntry: ContentPlanEntry;
  variations: PostVariation[];
  selectedVariation: number | null;
}

export interface PostVariation {
  id: string;
  caption: string;
  imageDescription: string;
  textOverlay: string;
  tone: string;
}

const BookCreator = () => {
  const { creatorId } = useParams();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<Influencer | null>(null);
  const [step, setStep] = useState<BookingStep>("plan");
  const [contentPlan, setContentPlan] = useState<ContentPlanEntry[]>([]);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const found = influencers.find((i) => i.id === creatorId);
    if (!found) {
      navigate("/browse");
      return;
    }
    setCreator(found);
  }, [creatorId, navigate]);

  const generateMockVariations = (
    entry: ContentPlanEntry,
    feedback?: string
  ): PostVariation[] => {
    const tones = ["Professional", "Casual & Friendly", "Bold & Exciting"];
    
    // If feedback is provided, adjust the variations based on it
    const feedbackLower = (feedback || "").toLowerCase();
    const isMoreProfessional = feedbackLower.includes("professional") || feedbackLower.includes("formal");
    const isMoreCasual = feedbackLower.includes("casual") || feedbackLower.includes("friendly");
    const isMoreBold = feedbackLower.includes("bold") || feedbackLower.includes("exciting") || feedbackLower.includes("energetic");
    const wantStrongerCTA = feedbackLower.includes("cta") || feedbackLower.includes("call to action");
    const wantLessEmojis = feedbackLower.includes("less emoji") || feedbackLower.includes("no emoji");
    const wantMoreEmojis = feedbackLower.includes("more emoji");

    const baseTexts = {
      "Announce a new product": [
        isMoreProfessional
          ? "We are pleased to announce our latest innovation. This product represents a significant advancement in our commitment to excellence."
          : "Introducing something game-changing! 🚀 Get ready to experience innovation like never before.",
        isMoreCasual
          ? "Hey everyone! We've got some exciting news to share - something we've been working on just for you! 💫"
          : "Big news dropping! We've been working on something special and can't wait to share it with you 💫",
        isMoreBold
          ? "🔥🔥🔥 STOP EVERYTHING! This is THE announcement you've been waiting for! Game. Changed. Forever! 🔥🔥🔥"
          : "🔥 NEW ARRIVAL ALERT 🔥 This is going to change everything. Stay tuned!",
      ],
      "Promote an upcoming hackathon": [
        isMoreProfessional
          ? "Join industry leaders and innovators at our upcoming hackathon. An opportunity to demonstrate your expertise and build meaningful connections."
          : "Calling all innovators! Join us for an incredible hackathon experience. Build, learn, connect.",
        isMoreCasual
          ? "Who's ready to code and have fun? 💻 Our hackathon is coming up and it's going to be amazing! Bring your ideas and let's create something awesome together ✨"
          : "Ready to code, create, and compete? Our hackathon is coming up and you don't want to miss it! 💻✨",
        isMoreBold
          ? "🏆🔥 THE ULTIMATE CODING SHOWDOWN IS HERE! 48 hours. No limits. PURE INNOVATION. Are you brave enough to compete?! 🔥🏆"
          : "🏆 48 hours. Endless possibilities. Register now for the hackathon of the year!",
      ],
      "Announce a partnership": [
        isMoreProfessional
          ? "We are delighted to announce a strategic partnership that will enhance our capabilities and deliver greater value to our stakeholders."
          : "Excited to announce our partnership with an amazing team. Together, we're building something extraordinary.",
        isMoreCasual
          ? "Guess what?! We just teamed up with some incredible people! 🤝 This is going to be so good, you won't believe it 💫"
          : "Two forces, one vision! 🤝 Thrilled to partner up and bring you incredible value.",
        isMoreBold
          ? "🎉💥 MASSIVE PARTNERSHIP ALERT! 💥🎉 Two powerhouses uniting to absolutely DOMINATE! This is LEGENDARY!"
          : "PARTNERSHIP ANNOUNCEMENT! 🎉 This collaboration is going to be legendary.",
      ],
      "Promote a venture track or demo day": [
        isMoreProfessional
          ? "We cordially invite you to Demo Day, where visionary founders present innovative solutions to distinguished investors and industry leaders."
          : "Join us for Demo Day where innovation meets opportunity. See the future being built today.",
        isMoreCasual
          ? "Demo Day is almost here! ✨ Come watch some amazing founders share their incredible ideas. Trust us, you'll leave inspired! 🚀"
          : "Startup magic incoming! ✨ Don't miss our Demo Day featuring incredible founders and groundbreaking ideas.",
        isMoreBold
          ? "🚀🦄 DEMO DAY IS HERE AND IT'S GOING TO BE EPIC! 🦄🚀 Watch the FUTURE unfold before your eyes! These founders are UNSTOPPABLE!"
          : "🚀 DEMO DAY IS HERE! Watch the next unicorns pitch live. This is where legends begin!",
      ],
    };

    const getCaptions = () => {
      const key = entry.postType as keyof typeof baseTexts;
      let captions = baseTexts[key] || [
        `Exciting update about ${entry.postType}! Stay tuned for more details.`,
        `Big things happening! ${entry.postType} - you won't want to miss this.`,
        `🔥 ${entry.postType} - Let's make it happen!`,
      ];

      // Apply emoji modifications
      if (wantLessEmojis) {
        captions = captions.map((c) => c.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim());
      }
      if (wantMoreEmojis) {
        captions = captions.map((c) => c + " 🎉✨🚀💫");
      }

      // Add stronger CTA if requested
      if (wantStrongerCTA) {
        captions = captions.map((c) => c + "\n\n👉 Don't wait - ACT NOW! Limited spots available. Link in bio!");
      }

      return captions;
    };

    const captions = getCaptions();
    const imageDescriptions = [
      `Clean, minimalist design with brand colors. ${entry.platform === "LinkedIn" ? "Professional layout with subtle gradients." : "Vibrant, eye-catching visuals optimized for mobile."}${feedback ? ` Adjusted based on: "${feedback}"` : ""}`,
      `Dynamic composition featuring ${entry.designElements || "modern graphics"}. ${entry.platform === "Instagram" ? "Square format with bold typography." : "Wide format suitable for professional feeds."}${feedback ? ` Incorporating feedback: "${feedback}"` : ""}`,
      `High-impact visual with ${entry.designElements || "brand elements"}. Text overlay positioned for maximum readability on ${entry.platform}.${feedback ? ` Refined with: "${feedback}"` : ""}`,
    ];

    const overlays = [
      entry.postType.toUpperCase(),
      `${entry.postType} | ${entry.constraints || "Coming Soon"}`,
      `🚀 ${entry.postType}`,
    ];

    return tones.map((tone, i) => ({
      id: `var-${entry.id}-${i}-${Date.now()}`,
      caption: captions[i] + (entry.constraints ? `\n\n${entry.constraints}` : ""),
      imageDescription: imageDescriptions[i],
      textOverlay: overlays[i],
      tone,
    }));
  };

  const handlePlanSubmit = async (entries: ContentPlanEntry[]) => {
    setContentPlan(entries);
    setIsGenerating(true);

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const generated: GeneratedPost[] = entries.map((entry) => ({
      id: `post-${entry.id}`,
      planEntry: entry,
      variations: generateMockVariations(entry),
      selectedVariation: null,
    }));

    setGeneratedPosts(generated);
    setIsGenerating(false);
    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVariationSelect = (postId: string, variationIndex: number) => {
    setGeneratedPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, selectedVariation: variationIndex } : post
      )
    );
  };

  const handleUpdateCaption = (
    postId: string,
    variationIndex: number,
    newCaption: string
  ) => {
    setGeneratedPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const newVariations = [...post.variations];
        newVariations[variationIndex] = {
          ...newVariations[variationIndex],
          caption: newCaption,
        };
        return { ...post, variations: newVariations };
      })
    );
  };

  const handleRegenerateVariation = async (
    postId: string,
    variationIndex: number,
    feedback: string
  ) => {
    const key = `${postId}-${variationIndex}`;
    setIsRegenerating((prev) => ({ ...prev, [key]: true }));

    // Simulate regeneration delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setGeneratedPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const newVariations = [...post.variations];
        const entry = post.planEntry;
        const singleVariation = generateMockVariations(entry, feedback)[variationIndex];
        newVariations[variationIndex] = singleVariation;
        return { ...post, variations: newVariations };
      })
    );

    setIsRegenerating((prev) => ({ ...prev, [key]: false }));
  };

  const handleRegenerateAll = async (postId: string, feedback: string) => {
    setIsRegenerating((prev) => ({ ...prev, [postId]: true }));

    // Simulate regeneration delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setGeneratedPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          variations: generateMockVariations(post.planEntry, feedback),
          selectedVariation: null,
        };
      })
    );

    setIsRegenerating((prev) => ({ ...prev, [postId]: false }));
  };

  const handleConfirmBooking = () => {
    setStep("confirmed");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const allVariationsSelected = generatedPosts.every(
    (post) => post.selectedVariation !== null
  );

  if (!creator) return null;

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
              Back
            </Button>

            <div className="flex items-center gap-4">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  Book {creator.name}
                </h1>
                <p className="text-muted-foreground">
                  {creator.handle} • {creator.niche}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-10">
            {["plan", "review", "confirmed"].map((s, i) => (
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
                  className={`text-sm font-medium capitalize ${
                    step === s ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s === "plan" ? "Content Plan" : s === "review" ? "Review Variations" : "Confirmed"}
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
              <SwipeableVariations
                posts={generatedPosts}
                onSelectVariation={handleVariationSelect}
                onUpdateCaption={handleUpdateCaption}
                onRegenerateVariation={handleRegenerateVariation}
                onRegenerateAll={handleRegenerateAll}
                isRegenerating={isRegenerating}
              />

              <div className="flex flex-col md:flex-row gap-4 justify-between items-center pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setStep("plan")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Edit Content Plan
                </Button>

                <BookingSummary
                  creator={creator}
                  posts={generatedPosts}
                  onConfirm={handleConfirmBooking}
                  disabled={!allVariationsSelected}
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
                Booking Confirmed!
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Your content plan has been submitted to {creator.name}. You'll receive a confirmation email shortly with next steps.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/browse">Browse More Creators</Link>
                </Button>
                <Button asChild>
                  <Link to="/">Back to Home</Link>
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
