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
  imageBase64?: string; // optional starting frame (base64, no data: prefix)
  imageMime?: "image/png" | "image/jpeg" | "image/webp" | null;
  seconds?: string;
  size?: string;
  influencer?: InfluencerContext | null;
  product?: ProductContext | null;
  productImageBase64?: string | null;
  productUrl?: string;
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
  const { prompt, imageBase64, imageMime, seconds = "4", influencer, product, productUrl } = body;

  console.log("Creating video with model: sora-2, seconds:", seconds, "has image:", !!imageBase64);

  // Frame the person as a fictional AI-generated character to avoid moderation blocks
  // while keeping visual consistency with the influencer's style/niche
  const parts: string[] = [];

  parts.push("Create a realistic, cinematic sponsored social media video.");
  parts.push("IMPORTANT: The person in this video is a completely fictional AI-generated character we designed. They are not a real person. Generate a video of this original fictional character.");

  if (influencer) {
    parts.push(`Our fictional character is a ${influencer.niche} content creator. They have a confident, charismatic presence typical of successful ${influencer.niche} influencers. Their visual style is authentic, polished, and lifestyle-oriented.`);
    
    if (influencer.bio) {
      const nicheKeywords = influencer.bio.split(/[.,!]/).slice(0, 2).join(". ");
      parts.push(`Character vibe: ${nicheKeywords}.`);
    }
  }

  if (product) {
    parts.push(`The product being promoted is "${product.name}": ${product.description}.`);
    parts.push("The character should be visibly holding, using, or showcasing this exact product — like a genuine sponsored post. The product must be clearly visible and recognizable.");
  }

  parts.push("The video should look like an authentic sponsored social media clip — the character naturally holding or presenting the product with genuine enthusiasm. Natural lighting, lifestyle setting, smooth cinematic camera motion. The character should look directly at the camera at least once, smiling confidently.");

  if (prompt) {
    parts.push(`Motion/direction: ${prompt}`);
  }

  if (imageBase64) {
    parts.push("CRITICAL: This video MUST start from the provided image and animate it. The person in the image is our original fictional AI character. Keep their exact face, hair, skin tone, build, clothing, and pose. Animate them naturally from this starting frame — they should move, gesture, and present the product while maintaining their exact appearance from the image.");
  }

  const finalPrompt = parts.join("\n\n");

  // Sora API requires multipart/form-data
  const formData = new FormData();
  formData.append("model", "sora-2");
  formData.append("prompt", finalPrompt);
  formData.append("seconds", String(seconds));

  // If we have a generated image, pass it as the starting frame so Sora
  // animates the exact same AI person instead of generating a new one
  // Sora requires size to always be set; input_reference image must match this resolution
  formData.append("size", "1280x720");

  // If we have a generated image, pass it as input_reference (starting frame)
  // so Sora animates the exact same AI person from the image
  if (imageBase64) {
    const mime: "image/png" | "image/jpeg" | "image/webp" =
      imageMime === "image/png" || imageMime === "image/jpeg" || imageMime === "image/webp"
        ? imageMime
        : "image/jpeg";

    console.log(
      "Attaching generated image as input_reference for Sora (image-to-video). mime:",
      mime,
      "base64_length:",
      imageBase64.length
    );

    const imageBytes = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));

    // Best-effort dimension logging to debug size mismatch errors
    const dims = (() => {
      try {
        // PNG signature
        if (
          mime === "image/png" &&
          imageBytes.length > 24 &&
          imageBytes[0] === 0x89 &&
          imageBytes[1] === 0x50 &&
          imageBytes[2] === 0x4e &&
          imageBytes[3] === 0x47
        ) {
          const w =
            (imageBytes[16] << 24) |
            (imageBytes[17] << 16) |
            (imageBytes[18] << 8) |
            imageBytes[19];
          const h =
            (imageBytes[20] << 24) |
            (imageBytes[21] << 16) |
            (imageBytes[22] << 8) |
            imageBytes[23];
          return { width: w >>> 0, height: h >>> 0 };
        }

        // JPEG SOF markers - scan properly
        if (mime === "image/jpeg" && imageBytes.length > 4 && imageBytes[0] === 0xff && imageBytes[1] === 0xd8) {
          let i = 2;
          while (i + 1 < imageBytes.length) {
            // Find next 0xFF marker
            if (imageBytes[i] !== 0xff) {
              i++;
              continue;
            }
            // Skip padding 0xFF bytes
            while (i + 1 < imageBytes.length && imageBytes[i + 1] === 0xff) {
              i++;
            }
            if (i + 1 >= imageBytes.length) break;
            
            const marker = imageBytes[i + 1];
            
            // SOF0-SOF3, SOF5-SOF7, SOF9-SOF11, SOF13-SOF15 contain dimensions
            const isSOF =
              (marker >= 0xc0 && marker <= 0xc3) ||
              (marker >= 0xc5 && marker <= 0xc7) ||
              (marker >= 0xc9 && marker <= 0xcb) ||
              (marker >= 0xcd && marker <= 0xcf);
              
            if (isSOF && i + 9 < imageBytes.length) {
              const h = (imageBytes[i + 5] << 8) | imageBytes[i + 6];
              const w = (imageBytes[i + 7] << 8) | imageBytes[i + 8];
              return { width: w, height: h };
            }
            
            // Skip marker + length
            if (i + 3 >= imageBytes.length) break;
            const length = (imageBytes[i + 2] << 8) | imageBytes[i + 3];
            if (length < 2) break;
            i += 2 + length;
          }
        }
      } catch {
        // ignore
      }
      return null;
    })();

    if (dims) {
      console.log("input_reference decoded dimensions:", `${dims.width}x${dims.height}`);
    } else {
      console.log("input_reference decoded dimensions: unknown");
    }

    const ext = mime === "image/jpeg" ? "jpg" : mime === "image/webp" ? "webp" : "png";
    const imageBlob = new Blob([imageBytes], { type: mime });
    formData.append("input_reference", imageBlob, `starting-frame.${ext}`);
  }

  console.log("Sending video request to Sora API (multipart/form-data), image-to-video:", !!imageBase64);

  const response = await fetch("https://api.openai.com/v1/videos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI video generation error:", response.status, errorText);
    throw new Error(`Video generation failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("Video job created:", data.id, "status:", data.status);
  
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
  console.log("Video status:", data.status, "full response:", JSON.stringify(data));
  
  return new Response(
    JSON.stringify({ 
      jobId: data.id, 
      status: data.status,
      output: data.output,
      error: data.error,
      failure_reason: data.failure_reason,
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
