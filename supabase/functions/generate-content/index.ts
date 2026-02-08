import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InfluencerContext {
  name: string;
  handle: string;
  niche: string;
  bio: string;
  instagramUrl: string;
}

interface ProductContext {
  name: string;
  description: string;
  categories: string[];
}

interface GenerateImageRequest {
  prompt: string;
  size?: string;
  quality?: string;
  influencer?: InfluencerContext | null;
  product?: ProductContext | null;
  productImageBase64?: string | null;
  productUrl?: string;
}

interface EditImageRequest {
  prompt: string;
  imageBase64: string; // base64 encoded image
}

interface GenerateVideoRequest {
  prompt: string;
  imageBase64?: string; // optional starting frame
  seconds?: string;
  size?: string;
}

interface VideoStatusRequest {
  jobId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "generate-image") {
      const body: GenerateImageRequest = await req.json();
      return await generateImage(OPENAI_API_KEY, body);
    }

    if (action === "edit-image") {
      const body: EditImageRequest = await req.json();
      return await editImage(OPENAI_API_KEY, body);
    }

    if (action === "generate-video") {
      const body: GenerateVideoRequest = await req.json();
      return await generateVideo(OPENAI_API_KEY, body);
    }

    if (action === "video-status") {
      const body: VideoStatusRequest = await req.json();
      return await getVideoStatus(OPENAI_API_KEY, body);
    }

    if (action === "download-video") {
      const body: VideoStatusRequest = await req.json();
      return await downloadVideo(OPENAI_API_KEY, body);
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: generate-image, edit-image, generate-video, video-status, download-video" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function generateImage(apiKey: string, body: GenerateImageRequest): Promise<Response> {
  const { prompt, size = "1024x1024", quality = "high", influencer, product, productImageBase64, productUrl } = body;

  // Build a rich prompt that makes the AI generate a realistic sponsored post
  let enrichedPrompt = prompt;

  if (influencer || product) {
    const parts: string[] = [];
    
    parts.push("Create a realistic Instagram sponsored post photo.");
    
    if (influencer) {
      parts.push(`The post is from ${influencer.name} (${influencer.handle}), a ${influencer.niche} influencer. ${influencer.bio}`);
      parts.push(`Match the visual style you'd expect from ${influencer.instagramUrl} — authentic, personal, lifestyle-oriented.`);
      parts.push("The person in the photo should look like a real influencer naturally showing off a product they love — NOT a studio ad.");
    }
    
    if (product) {
      parts.push(`The product being promoted is "${product.name}": ${product.description}. Categories: ${product.categories.join(", ")}.`);
    }

    if (productUrl) {
      parts.push(`Product/company page: ${productUrl}`);
    }

    parts.push("The image should look like an organic sponsored post — the influencer casually using or holding the product in a natural setting. NOT a product-only photo, NOT a studio ad. Think: real person, real life, subtle product placement.");
    
    // Add original prompt context too
    parts.push(`Additional context: ${prompt}`);
    
    enrichedPrompt = parts.join("\n\n");
  }

  console.log("Generating image with enriched prompt, product image included:", !!productImageBase64);

  // If we have a product image, use the edit endpoint to incorporate it
  if (productImageBase64) {
    const imageBytes = Uint8Array.from(atob(productImageBase64), (c) => c.charCodeAt(0));
    const imageBlob = new Blob([imageBytes], { type: "image/png" });

    const formData = new FormData();
    formData.append("model", "gpt-image-1.5");
    formData.append("prompt", enrichedPrompt + "\n\nIMPORTANT: The attached image shows the exact product that must appear in the generated photo. The influencer should be holding or using THIS specific product.");
    formData.append("image", imageBlob, "product.png");
    formData.append("size", size);

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI image edit error:", response.status, errorText);
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.code === "moderation_blocked") {
          throw new Error("Your prompt was flagged by content moderation. Please try a different description.");
        }
        throw new Error(errorData.error?.message || `Image generation failed: ${response.status}`);
      } catch (e) {
        if (e instanceof Error && (e.message.includes("moderation") || e.message.includes("Image"))) throw e;
        throw new Error(`Image generation failed: ${response.status}`);
      }
    }

    const data = await response.json();
    const imageBase64 = data.data?.[0]?.b64_json;
    if (!imageBase64) throw new Error("No image data returned from OpenAI");

    return new Response(
      JSON.stringify({ imageBase64 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // No product image — use standard generation
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1.5",
      prompt: enrichedPrompt,
      n: 1,
      size,
      quality,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI image generation error:", response.status, errorText);
    
    // Parse error for user-friendly message
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error?.code === "moderation_blocked") {
        throw new Error("Your prompt was flagged by content moderation. Please try a different description.");
      }
      throw new Error(errorData.error?.message || `Image generation failed: ${response.status}`);
    } catch (e) {
      if (e instanceof Error && e.message.includes("moderation")) throw e;
      throw new Error(`Image generation failed: ${response.status}`);
    }
  }

  const data = await response.json();
  const imageBase64 = data.data?.[0]?.b64_json;

  if (!imageBase64) {
    throw new Error("No image data returned from OpenAI");
  }

  return new Response(
    JSON.stringify({ imageBase64, revisedPrompt: data.data?.[0]?.revised_prompt }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function editImage(apiKey: string, body: EditImageRequest): Promise<Response> {
  const { prompt, imageBase64 } = body;

  // Convert base64 to binary for the API
  const imageBytes = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
  const imageBlob = new Blob([imageBytes], { type: "image/png" });

  const formData = new FormData();
  formData.append("model", "gpt-image-1.5");
  formData.append("prompt", prompt);
  formData.append("image", imageBlob, "image.png");

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI image edit error:", response.status, errorText);
    throw new Error(`Image edit failed: ${response.status}`);
  }

  const data = await response.json();
  const newImageBase64 = data.data?.[0]?.b64_json;

  if (!newImageBase64) {
    throw new Error("No edited image data returned from OpenAI");
  }

  return new Response(
    JSON.stringify({ imageBase64: newImageBase64 }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function generateVideo(apiKey: string, body: GenerateVideoRequest): Promise<Response> {
  const { prompt, imageBase64, seconds = "4" } = body;

  console.log("Creating video with model: sora-2, seconds:", seconds, "has image:", !!imageBase64);

  // Sora 2 requires input_reference images to match the target video resolution (1280x720).
  // Generated images are typically 1024x1024, so we fall back to text-to-video
  // with a detailed prompt that describes the image content for consistency.
  const enrichedPrompt = imageBase64
    ? `${prompt}\n\nIMPORTANT: Base this video on the visual style and content of the sponsored post image that was generated. Maintain the same look, feel, colors, and product placement.`
    : prompt;

  const response = await fetch("https://api.openai.com/v1/videos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sora-2",
      prompt: enrichedPrompt,
      seconds,
      size: "1280x720",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI video generation error:", response.status, errorText);
    throw new Error(`Video generation failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("Video job created:", data.id);
  
  return new Response(
    JSON.stringify({ jobId: data.id, status: data.status }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getVideoStatus(apiKey: string, body: VideoStatusRequest): Promise<Response> {
  const { jobId } = body;

  const response = await fetch(`https://api.openai.com/v1/videos/${jobId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI video status error:", response.status, errorText);
    throw new Error(`Video status check failed: ${response.status}`);
  }

  const data = await response.json();
  console.log("Video status:", data.status);
  
  return new Response(
    JSON.stringify({ 
      jobId: data.id, 
      status: data.status,
      output: data.output,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function downloadVideo(apiKey: string, body: VideoStatusRequest): Promise<Response> {
  const { jobId } = body;

  // First check the status to confirm it's completed
  const statusResponse = await fetch(`https://api.openai.com/v1/videos/${jobId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!statusResponse.ok) {
    throw new Error(`Video status check failed: ${statusResponse.status}`);
  }

  const statusData = await statusResponse.json();
  
  if (statusData.status !== "completed") {
    return new Response(
      JSON.stringify({ error: "Video not ready yet", status: statusData.status }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Download video bytes via the /content endpoint
  console.log("Downloading video content for:", jobId);
  const videoResponse = await fetch(`https://api.openai.com/v1/videos/${jobId}/content`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!videoResponse.ok) {
    const errorText = await videoResponse.text();
    console.error("Video download error:", videoResponse.status, errorText);
    throw new Error(`Failed to download video: ${videoResponse.status}`);
  }

  const videoArrayBuffer = await videoResponse.arrayBuffer();
  // Convert to base64 in chunks to avoid stack overflow with large videos
  const bytes = new Uint8Array(videoArrayBuffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const videoBase64 = btoa(binary);

  console.log("Video downloaded, size:", bytes.length, "bytes");

  return new Response(
    JSON.stringify({ videoBase64, status: "completed" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
