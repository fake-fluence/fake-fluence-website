import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GenerateImageRequest {
  prompt: string;
  size?: string;
  quality?: string;
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
  const { prompt, size = "1024x1024", quality = "high" } = body;

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size,
      quality,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI image generation error:", response.status, errorText);
    throw new Error(`Image generation failed: ${response.status}`);
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
  formData.append("model", "gpt-image-1");
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
  const { prompt, imageBase64, seconds = "5", size = "1080p" } = body;

  // Build the request body
  const requestBody: Record<string, unknown> = {
    model: "sora",
    input: [
      {
        type: "text",
        text: prompt,
      },
    ],
    duration: parseInt(seconds),
    aspect_ratio: "16:9",
  };

  // If we have an image, add it as a reference
  if (imageBase64) {
    requestBody.input = [
      {
        type: "image",
        image: {
          type: "base64",
          media_type: "image/png",
          data: imageBase64,
        },
      },
      {
        type: "text",
        text: prompt,
      },
    ];
  }

  const response = await fetch("https://api.openai.com/v1/videos/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI video generation error:", response.status, errorText);
    throw new Error(`Video generation failed: ${response.status}`);
  }

  const data = await response.json();
  
  return new Response(
    JSON.stringify({ jobId: data.id, status: data.status }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getVideoStatus(apiKey: string, body: VideoStatusRequest): Promise<Response> {
  const { jobId } = body;

  const response = await fetch(`https://api.openai.com/v1/videos/generations/${jobId}`, {
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

  // First get the status to get the output URL
  const statusResponse = await fetch(`https://api.openai.com/v1/videos/generations/${jobId}`, {
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

  // Get the video URL from the output
  const videoUrl = statusData.output?.url;
  if (!videoUrl) {
    throw new Error("No video URL in completed job");
  }

  // Fetch the video and convert to base64
  const videoResponse = await fetch(videoUrl);
  if (!videoResponse.ok) {
    throw new Error(`Failed to download video: ${videoResponse.status}`);
  }

  const videoArrayBuffer = await videoResponse.arrayBuffer();
  const videoBase64 = btoa(String.fromCharCode(...new Uint8Array(videoArrayBuffer)));

  return new Response(
    JSON.stringify({ videoBase64, status: "completed" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
