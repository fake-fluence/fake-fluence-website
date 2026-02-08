import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductUploadForm from "@/components/ProductUploadForm";
import MatchResultCard from "@/components/MatchResultCard";
import ContentPreviewCarousel from "@/components/ContentPreviewCarousel";
import { influencers, type Influencer, type ContentType } from "@/data/influencers";
import { ArrowLeft, Sparkles, SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

type Step = "upload" | "results" | "preview";

interface ProductData {
  images: string[];
  name: string;
  description: string;
  categories: string[];
}

interface MatchResult {
  influencer: Influencer;
  matchScore: number;
  matchReason: string;
}
const MIN_MATCH_SCORE = 65;

const GetStarted = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<ContentType>("post");
  const [showModifySearch, setShowModifySearch] = useState(false);
  const [showOthers, setShowOthers] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (data: ProductData) => {
    setIsLoading(true);
    setProductData(data);

    try {
      // Prepare influencer summaries for the edge function
      const influencerPayload = influencers.map((inf) => ({
        id: inf.id,
        name: inf.name,
        handle: inf.handle,
        niche: inf.niche,
        verified: inf.verified,
        location: inf.location,
        bio: inf.bio,
        followers: inf.platforms.instagram.followers,
        engagement: inf.platforms.instagram.engagement,
        conversionRate: inf.platforms.instagram.conversionRate,
        avgViews: inf.platforms.instagram.avgViews,
      }));

      const { data: responseData, error } = await supabase.functions.invoke("match-personas", {
        body: {
          product: {
            name: data.name,
            description: data.description,
            categories: data.categories,
          },
          influencers: influencerPayload,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to match personas");
      }

      const scores: { influencer_id: string; score: number; reason: string }[] =
        responseData?.scores ?? [];

      // Map AI scores back to full influencer objects
      const matched: MatchResult[] = scores
        .map((s) => {
          const inf = influencers.find((i) => i.id === s.influencer_id);
          if (!inf) return null;
          return {
            influencer: inf,
            matchScore: Math.min(s.score, 99),
            matchReason: s.reason,
          };
        })
        .filter(Boolean) as MatchResult[];

      setResults(matched);
      setStep("results");
      setShowModifySearch(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Matching error:", err);
      toast({
        title: "Matching failed",
        description:
          err instanceof Error ? err.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCreator = (influencer: Influencer, contentType: ContentType) => {
    setSelectedInfluencer(influencer);
    setSelectedContentType(contentType);
    // Store product data for the booking page
    if (productData) {
      localStorage.setItem("bookingProductData", JSON.stringify(productData));
    }
    setStep("preview");
  };

  const handlePurchase = () => {
    toast({
      title: "Content Purchased! 🎉",
      description: `Your ${selectedInfluencer?.name} content has been added to your order. You'll receive the final assets within 24 hours.`,
    });
    setStep("results");
    setSelectedInfluencer(null);
  };

  // Filter results: only show accounts above the minimum match score
  const filteredResults = results.filter((r) => r.matchScore >= MIN_MATCH_SCORE);
  const otherResults = results.filter((r) => r.matchScore < MIN_MATCH_SCORE);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            {step === "upload" && (
              <>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/20 bg-surface/50 backdrop-blur-sm mb-6">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-body text-muted-foreground">
                    {t.hero.badge}
                  </span>
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-foreground">{t.getStarted.title} </span>
                  <span className="text-gradient-gold">{t.getStarted.titleHighlight}</span>
                </h1>
                <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
                  {t.getStarted.description}
                </p>
              </>
            )}

            {step === "results" && !showModifySearch && (
              <>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground font-body"
                    onClick={() => {
                      setStep("upload");
                      setProductData(null);
                      setResults([]);
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {t.booking.back}
                  </Button>
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-foreground">{t.getStarted.matches.title.split(" ")[0]} </span>
                  <span className="text-gradient-gold">{t.getStarted.matches.title.split(" ").slice(1).join(" ")}</span>
                </h1>
                <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
                  {t.getStarted.matches.description.replace("these creators", `${filteredResults.length} creators`)}
                  {productData?.name && (
                    <> for <span className="text-foreground font-medium">{productData.name}</span></>
                  )}
                </p>
              </>
            )}
          </div>

          {/* Content */}
          {step === "upload" && (
            <div className="max-w-xl mx-auto">
              <div className="p-6 md:p-8 rounded-2xl bg-card border border-border">
                <ProductUploadForm onSubmit={handleUpload} isLoading={isLoading} />
              </div>
            </div>
          )}

          {step === "results" && (
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Product summary + modify search */}
              {productData && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border mb-8">
                  {productData.images[0] && (
                    <img
                      src={productData.images[0]}
                      alt={productData.name}
                      className="w-16 h-16 rounded-lg object-cover border border-border flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-display text-base font-semibold text-foreground truncate">
                      {productData.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {productData.categories.map((cat) => (
                        <span
                          key={cat}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-body"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground font-body mt-0.5 truncate">
                      {productData.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 font-body text-xs gap-1.5 self-center"
                    onClick={() => setShowModifySearch(!showModifySearch)}
                  >
                    {showModifySearch ? (
                      <>
                        <X className="w-3.5 h-3.5" />
                        {t.booking.variations.cancel}
                      </>
                    ) : (
                      <>
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        {t.booking.variations.edit}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Modify search form (inline) */}
              {showModifySearch && productData && (
                <div className="p-6 rounded-2xl bg-card border border-border mb-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                    {t.booking.variations.edit}
                  </h3>
                  <ProductUploadForm
                    onSubmit={handleUpload}
                    isLoading={isLoading}
                    initialData={productData}
                  />
                </div>
              )}

              {/* Filtered results info */}
              {!showModifySearch && results.length > filteredResults.length && (
                <p className="text-xs text-muted-foreground font-body text-center">
                  Showing {filteredResults.length} of {results.length} creators — only accounts with strong audience alignment (≥{MIN_MATCH_SCORE}% match) are displayed.
                </p>
              )}

              {!showModifySearch &&
                filteredResults.map((result, i) => (
                  <MatchResultCard
                    key={result.influencer.id}
                    influencer={result.influencer}
                    matchScore={result.matchScore}
                    matchReason={result.matchReason}
                    index={i}
                    onSelect={handleSelectCreator}
                  />
                ))}

              {/* "Others" toggle for lower-scored creators */}
              {!showModifySearch && otherResults.length > 0 && (
                <>
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-body text-sm gap-2"
                      onClick={() => setShowOthers(!showOthers)}
                    >
                      {showOthers ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Hide other creators
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Browse {otherResults.length} other creator{otherResults.length > 1 ? "s" : ""}
                        </>
                      )}
                    </Button>
                  </div>

                  {showOthers && (
                    <div className="space-y-4 pt-2">
                      <p className="text-xs text-muted-foreground font-body text-center">
                        These creators scored below {MIN_MATCH_SCORE}% match — their audience may still be worth exploring.
                      </p>
                      {otherResults.map((result, i) => (
                        <MatchResultCard
                          key={result.influencer.id}
                          influencer={result.influencer}
                          matchScore={result.matchScore}
                          matchReason={result.matchReason}
                          index={i}
                          onSelect={handleSelectCreator}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content preview overlay */}
      {step === "preview" && selectedInfluencer && (
        <ContentPreviewCarousel
          influencer={selectedInfluencer}
          contentType={selectedContentType}
          onClose={() => setStep("results")}
          onPurchase={handlePurchase}
        />
      )}

      <Footer />
    </main>
  );
};

export default GetStarted;
