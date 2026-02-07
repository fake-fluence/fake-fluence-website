import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductUploadForm from "@/components/ProductUploadForm";
import MatchResultCard from "@/components/MatchResultCard";
import ContentPreviewCarousel from "@/components/ContentPreviewCarousel";
import { influencers, type Influencer, type ContentType } from "@/data/influencers";
import { ArrowLeft, Sparkles, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
}

// Category → relevant niches mapping
const categoryNicheMap: Record<string, string[]> = {
  "Fashion & Apparel": ["Fashion & Lifestyle", "Fashion & Editorial"],
  "Beauty & Skincare": ["Beauty & Travel", "Fashion & Lifestyle"],
  "Health & Fitness": ["Fitness & Motivation", "Fitness & Wellness"],
  "Food & Beverage": ["Travel & Lifestyle", "Fashion & Lifestyle"],
  "Technology & Gadgets": ["Fashion & Editorial", "Fitness & Motivation"],
  "Home & Living": ["Travel & Lifestyle", "Cat Content & Reviews"],
  "Travel & Experiences": ["Beauty & Travel", "Travel & Lifestyle"],
  "Pet Products": ["Pet Life & Products", "Cat Content & Reviews"],
  Other: ["Fashion & Editorial", "Travel & Lifestyle"],
};

// Simulate AI matching with scores
const getMatchResults = (product: ProductData): MatchResult[] => {
  const allRelevantNiches = product.categories.flatMap(
    (cat) => categoryNicheMap[cat] || []
  );
  const uniqueNiches = [...new Set(allRelevantNiches)];

  return influencers
    .map((inf) => {
      let score = 50;
      const nicheMatch = uniqueNiches.includes(inf.niche);

      // Niche alignment bonus (biggest factor)
      if (nicheMatch) score += 25;

      // Engagement bonus
      const engagement = parseFloat(inf.engagement);
      score += Math.floor(engagement * 3);

      // Conversion rate bonus
      const convRate = parseFloat(inf.conversionRate);
      score += Math.floor(convRate * 3);

      // Verified bonus
      if (inf.verified) score += 5;

      // Small random factor for variety
      score += Math.floor(Math.random() * 8);

      const finalScore = Math.min(score, 99);

      return { influencer: inf, matchScore: finalScore };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
};

const MIN_MATCH_SCORE = 65;

const GetStarted = () => {
  const [step, setStep] = useState<Step>("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<ContentType>("post");
  const [showModifySearch, setShowModifySearch] = useState(false);
  const { toast } = useToast();

  const handleUpload = (data: ProductData) => {
    setIsLoading(true);
    setProductData(data);

    // Simulate AI processing
    setTimeout(() => {
      const matched = getMatchResults(data);
      setResults(matched);
      setIsLoading(false);
      setStep("results");
      setShowModifySearch(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 2000);
  };

  const handleSelectCreator = (influencer: Influencer, contentType: ContentType) => {
    setSelectedInfluencer(influencer);
    setSelectedContentType(contentType);
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
                    AI-Powered Matching
                  </span>
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-foreground">Upload Your </span>
                  <span className="text-gradient-gold">Product</span>
                </h1>
                <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
                  Share your product details and our AI will match you with the
                  best creators for maximum impact.
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
                    Start Over
                  </Button>
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-foreground">Your </span>
                  <span className="text-gradient-gold">Matches</span>
                </h1>
                <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
                  We found {filteredResults.length} fitting creators for{" "}
                  <span className="text-foreground font-medium">
                    {productData?.name}
                  </span>
                  . Select one to generate content.
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
                        Cancel
                      </>
                    ) : (
                      <>
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Modify Search
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Modify search form (inline) */}
              {showModifySearch && productData && (
                <div className="p-6 rounded-2xl bg-card border border-border mb-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                    Modify Your Search
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
                    index={i}
                    onSelect={handleSelectCreator}
                  />
                ))}
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
