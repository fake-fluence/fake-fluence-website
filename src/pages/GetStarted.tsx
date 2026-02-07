import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductUploadForm from "@/components/ProductUploadForm";
import MatchResultCard from "@/components/MatchResultCard";
import ContentPreviewCarousel from "@/components/ContentPreviewCarousel";
import { influencers, type Influencer, type ContentType } from "@/data/influencers";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Step = "upload" | "results" | "preview";

interface ProductData {
  images: string[];
  name: string;
  description: string;
  category: string;
}

// Simulate AI matching with scores
const getMatchResults = (product: ProductData) => {
  const categoryMap: Record<string, string[]> = {
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

  const relevantNiches = categoryMap[product.category] || [];

  return influencers
    .map((inf) => {
      let score = Math.floor(Math.random() * 20) + 60;
      if (relevantNiches.includes(inf.niche)) score += 20;
      if (inf.verified) score += 5;
      const convRate = parseFloat(inf.conversionRate);
      score += Math.floor(convRate * 2);
      return { influencer: inf, matchScore: Math.min(score, 99) };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
};

const GetStarted = () => {
  const [step, setStep] = useState<Step>("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [results, setResults] = useState<{ influencer: Influencer; matchScore: number }[]>([]);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<ContentType>("post");
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

            {step === "results" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-4 text-muted-foreground hover:text-foreground font-body"
                  onClick={() => setStep("upload")}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Upload New Product
                </Button>
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-foreground">Your </span>
                  <span className="text-gradient-gold">Matches</span>
                </h1>
                <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
                  We found {results.length} creators that align with{" "}
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
              {/* Product summary */}
              {productData && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border mb-8">
                  {productData.images[0] && (
                    <img
                      src={productData.images[0]}
                      alt={productData.name}
                      className="w-16 h-16 rounded-lg object-cover border border-border"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base font-semibold text-foreground truncate">
                      {productData.name}
                    </h3>
                    <p className="text-xs text-primary font-body">
                      {productData.category}
                    </p>
                    <p className="text-xs text-muted-foreground font-body mt-0.5 truncate">
                      {productData.description}
                    </p>
                  </div>
                </div>
              )}

              {results.map((result, i) => (
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
