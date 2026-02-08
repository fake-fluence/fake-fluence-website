import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Influencer {
  id: string;
  name: string;
  handle: string;
  niche: string;
  verified: boolean;
  location: string;
  bio: string;
  followers: string;
  engagement: string;
  conversionRate: string;
  avgViews: string;
}

interface MatchRequest {
  product: {
    name: string;
    description: string;
    categories: string[];
  };
  influencers: Influencer[];
}

interface MatchScore {
  influencer_id: string;
  score: number;
  reason: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const { product, influencers } = (await req.json()) as MatchRequest;

    if (!product || !influencers || influencers.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing product or influencers data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Matching product "${product.name}" against ${influencers.length} influencers`);

    // Build a concise influencer summary for the prompt
    const influencerSummaries = influencers
      .map(
        (inf) =>
          `ID: ${inf.id} | Name: ${inf.name} (${inf.handle}) | Niche: ${inf.niche} | Verified: ${inf.verified} | Location: ${inf.location} | Followers: ${inf.followers} | Engagement: ${inf.engagement} | Conversion: ${inf.conversionRate} | Avg Views: ${inf.avgViews} | Bio: ${inf.bio}`
      )
      .join("\n");

    const systemPrompt = `You are an expert influencer marketing strategist. Given a product and a list of influencers, score how well each influencer fits the product on a scale of 0-99.

Consider these factors:
- Niche alignment between the product categories and the influencer's content niche
- Engagement rate (higher is better for brand partnerships)
- Conversion rate (indicates purchase intent from their audience)
- Audience size and reach
- Location relevance
- Whether the influencer is verified (adds credibility)
- Bio alignment with the product's target audience

Return your analysis using the score_influencers tool.`;

    const userPrompt = `Product: "${product.name}"
Categories: ${product.categories.join(", ")}
Description: ${product.description}

Influencers:
${influencerSummaries}

Score each influencer's fit for this product. Provide a 1-2 sentence reason for each score that references specific metrics and explains why their audience would (or wouldn't) resonate with this product.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "score_influencers",
              description: "Return match scores and reasons for each influencer",
              parameters: {
                type: "object",
                properties: {
                  scores: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        influencer_id: { type: "string", description: "The influencer's ID" },
                        score: {
                          type: "number",
                          description: "Match score 0-99 (higher = better fit)",
                        },
                        reason: {
                          type: "string",
                          description:
                            "1-2 sentence explanation referencing specific metrics and audience alignment",
                        },
                      },
                      required: ["influencer_id", "score", "reason"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["scores"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "score_influencers" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "score_influencers") {
      console.error("Unexpected AI response format:", JSON.stringify(data));
      throw new Error("Unexpected AI response format");
    }

    const parsed = JSON.parse(toolCall.function.arguments) as { scores: MatchScore[] };

    // Sort by score descending
    const sorted = parsed.scores.sort((a, b) => b.score - a.score);

    console.log(`Returning ${sorted.length} scored matches`);

    return new Response(JSON.stringify({ scores: sorted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("match-personas error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
