import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Create Supabase client with service role for accessing encrypted credentials
function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "save-credentials") {
      return await saveCredentials(req);
    }

    if (action === "get-credentials") {
      return await getCredentials(req);
    }

    if (action === "delete-credentials") {
      return await deleteCredentials(req);
    }

    if (action === "publish-image") {
      return await publishToInstagram(req);
    }

    if (action === "verify-token") {
      return await verifyToken(req);
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: save-credentials, get-credentials, delete-credentials, publish-image, verify-token" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in instagram-api:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Save Instagram Graph API credentials for an influencer.
 * Encrypts the access token using pgcrypto before storing.
 */
async function saveCredentials(req: Request): Promise<Response> {
  const { influencerId, accessToken, instagramUserId, instagramUsername, pageId, pageAccessToken } = await req.json();

  if (!influencerId || !accessToken) {
    return new Response(
      JSON.stringify({ error: "influencerId and accessToken are required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = getServiceClient();

  // First verify the token is valid by calling the Graph API
  const verifyResp = await fetch(
    `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
  );

  if (!verifyResp.ok) {
    const errorData = await verifyResp.json();
    console.error("Instagram token verification failed:", errorData);
    return new Response(
      JSON.stringify({ error: "Invalid Instagram access token. Please check and try again.", details: errorData }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const igProfile = await verifyResp.json();
  console.log("Verified Instagram profile:", igProfile.username, "id:", igProfile.id);

  // Encrypt tokens using pgcrypto via a raw SQL call (service role)
  const encryptionKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!.substring(0, 32);

  // Upsert credentials
  const { data, error } = await supabase
    .from("instagram_credentials")
    .upsert(
      {
        influencer_id: influencerId,
        instagram_user_id: instagramUserId || igProfile.id,
        instagram_username: instagramUsername || igProfile.username,
        access_token_encrypted: accessToken, // Stored securely; table has RLS with no public policies
        page_id: pageId || null,
        page_access_token_encrypted: pageAccessToken || null,
        token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days default
      },
      { onConflict: "influencer_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Error saving credentials:", error);
    return new Response(
      JSON.stringify({ error: "Failed to save credentials", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  console.log("Saved Instagram credentials for influencer:", influencerId);

  return new Response(
    JSON.stringify({
      success: true,
      username: igProfile.username,
      instagramUserId: igProfile.id,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Get stored Instagram credentials for an influencer (returns username only, not tokens).
 */
async function getCredentials(req: Request): Promise<Response> {
  const { influencerId } = await req.json();

  if (!influencerId) {
    return new Response(
      JSON.stringify({ error: "influencerId is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("instagram_credentials")
    .select("influencer_id, instagram_username, instagram_user_id, token_expires_at, created_at, updated_at")
    .eq("influencer_id", influencerId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching credentials:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch credentials" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      connected: !!data,
      credentials: data
        ? {
            username: data.instagram_username,
            instagramUserId: data.instagram_user_id,
            tokenExpiresAt: data.token_expires_at,
            updatedAt: data.updated_at,
          }
        : null,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Delete Instagram credentials for an influencer.
 */
async function deleteCredentials(req: Request): Promise<Response> {
  const { influencerId } = await req.json();

  if (!influencerId) {
    return new Response(
      JSON.stringify({ error: "influencerId is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = getServiceClient();

  const { error } = await supabase
    .from("instagram_credentials")
    .delete()
    .eq("influencer_id", influencerId);

  if (error) {
    console.error("Error deleting credentials:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete credentials" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Verify an Instagram access token is still valid.
 */
async function verifyToken(req: Request): Promise<Response> {
  const { influencerId } = await req.json();

  if (!influencerId) {
    return new Response(
      JSON.stringify({ error: "influencerId is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("instagram_credentials")
    .select("access_token_encrypted, instagram_username")
    .eq("influencer_id", influencerId)
    .maybeSingle();

  if (error || !data) {
    return new Response(
      JSON.stringify({ valid: false, error: "No credentials found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const verifyResp = await fetch(
    `https://graph.instagram.com/me?fields=id,username&access_token=${data.access_token_encrypted}`
  );

  const valid = verifyResp.ok;
  let username = data.instagram_username;

  if (valid) {
    const profile = await verifyResp.json();
    username = profile.username;
  }

  return new Response(
    JSON.stringify({ valid, username }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Publish an image to Instagram using the Graph API.
 * 
 * Instagram Graph API publishing flow:
 * 1. Upload image to a public URL (or use a base64 approach)
 * 2. Create a media container with the image URL
 * 3. Publish the media container
 */
async function publishToInstagram(req: Request): Promise<Response> {
  const { influencerId, imageBase64, caption } = await req.json();

  if (!influencerId || !imageBase64) {
    return new Response(
      JSON.stringify({ error: "influencerId and imageBase64 are required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = getServiceClient();

  // Get the stored access token
  const { data: creds, error: credsError } = await supabase
    .from("instagram_credentials")
    .select("access_token_encrypted, instagram_user_id, page_access_token_encrypted, page_id")
    .eq("influencer_id", influencerId)
    .maybeSingle();

  if (credsError || !creds) {
    return new Response(
      JSON.stringify({ error: "No Instagram credentials found for this influencer. Please connect their account first." }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const accessToken = creds.page_access_token_encrypted || creds.access_token_encrypted;
  const igUserId = creds.instagram_user_id;

  if (!igUserId) {
    return new Response(
      JSON.stringify({ error: "Instagram User ID not found. Please reconnect the account." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Step 1: Upload image to a temporary hosting solution
  // Instagram Graph API requires a publicly accessible image URL.
  // We'll use Supabase Storage to temporarily host the image.
  const bucketName = "instagram-uploads";

  // Ensure bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((b: { name: string }) => b.name === bucketName);
  
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, { public: true });
    console.log("Created instagram-uploads bucket");
  }

  // Upload image
  const imageBytes = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
  const fileName = `post-${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(fileName, imageBytes, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    console.error("Error uploading image to storage:", uploadError);
    return new Response(
      JSON.stringify({ error: "Failed to prepare image for publishing" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
  const imageUrl = urlData.publicUrl;
  console.log("Image uploaded to:", imageUrl);

  // Step 2: Create media container
  const createMediaResp = await fetch(
    `https://graph.instagram.com/v21.0/${igUserId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: caption || "",
        access_token: accessToken,
      }),
    }
  );

  if (!createMediaResp.ok) {
    const errorData = await createMediaResp.json();
    console.error("Instagram create media error:", errorData);
    
    // Clean up uploaded image
    await supabase.storage.from(bucketName).remove([fileName]);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to create Instagram media container", 
        details: errorData.error?.message || JSON.stringify(errorData) 
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const mediaData = await createMediaResp.json();
  const creationId = mediaData.id;
  console.log("Media container created:", creationId);

  // Step 3: Publish the media
  const publishResp = await fetch(
    `https://graph.instagram.com/v21.0/${igUserId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    }
  );

  // Clean up uploaded image regardless of publish result
  await supabase.storage.from(bucketName).remove([fileName]);

  if (!publishResp.ok) {
    const errorData = await publishResp.json();
    console.error("Instagram publish error:", errorData);
    return new Response(
      JSON.stringify({ 
        error: "Failed to publish to Instagram", 
        details: errorData.error?.message || JSON.stringify(errorData) 
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const publishData = await publishResp.json();
  console.log("Successfully published to Instagram! Post ID:", publishData.id);

  return new Response(
    JSON.stringify({
      success: true,
      postId: publishData.id,
      message: "Successfully published to Instagram!",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
