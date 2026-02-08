import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { prepareSoraInputReference } from "@/lib/image/prepareSoraInputReference";

interface GeneratedContent {
  imageBase64: string | null;
  videoBase64: string | null;
  videoJobId: string | null;
  videoStatus: "idle" | "generating" | "completed" | "failed";
  caption: string;
  prompt: string;
}

interface UseContentGenerationReturn {
  content: GeneratedContent;
  isGeneratingImage: boolean;
  isEditingImage: boolean;
  isGeneratingVideo: boolean;
  generateImage: (prompt: string) => Promise<void>;
  editImage: (editPrompt: string) => Promise<void>;
  generateVideo: (prompt: string) => Promise<void>;
  checkVideoStatus: () => Promise<void>;
  updateCaption: (caption: string) => void;
  reset: () => void;
}

const initialContent: GeneratedContent = {
  imageBase64: null,
  videoBase64: null,
  videoJobId: null,
  videoStatus: "idle",
  caption: "",
  prompt: "",
};

export function useContentGeneration(): UseContentGenerationReturn {
  const [content, setContent] = useState<GeneratedContent>(initialContent);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const generateImage = useCallback(async (prompt: string) => {
    setIsGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { prompt, size: "1024x1024", quality: "high" },
        headers: { "Content-Type": "application/json" },
      });

      // Handle the query param differently - append to URL
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content?action=generate-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt, size: "1024x1024", quality: "high" }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const result = await response.json();
      
      setContent((prev) => ({
        ...prev,
        imageBase64: result.imageBase64,
        prompt,
        caption: `✨ ${prompt}`,
        videoBase64: null,
        videoJobId: null,
        videoStatus: "idle",
      }));
    } catch (error) {
      console.error("Error generating image:", error);
      throw error;
    } finally {
      setIsGeneratingImage(false);
    }
  }, []);

  const editImage = useCallback(async (editPrompt: string) => {
    if (!content.imageBase64) {
      throw new Error("No image to edit");
    }

    setIsEditingImage(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content?action=edit-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt: editPrompt,
            imageBase64: content.imageBase64,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to edit image");
      }

      const result = await response.json();
      
      setContent((prev) => ({
        ...prev,
        imageBase64: result.imageBase64,
        prompt: editPrompt,
      }));
    } catch (error) {
      console.error("Error editing image:", error);
      throw error;
    } finally {
      setIsEditingImage(false);
    }
  }, [content.imageBase64]);

  const generateVideo = useCallback(async (prompt: string) => {
    setIsGeneratingVideo(true);
    setContent((prev) => ({ ...prev, videoStatus: "generating" }));

    try {
      const soraImageBase64 = content.imageBase64
        ? await prepareSoraInputReference(content.imageBase64, { width: 1280, height: 720 })
        : null;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content?action=generate-video`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt,
            imageBase64: soraImageBase64,
            seconds: "4",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate video");
      }

      const result = await response.json();
      
      setContent((prev) => ({
        ...prev,
        videoJobId: result.jobId,
        videoStatus: "generating",
      }));
    } catch (error) {
      console.error("Error generating video:", error);
      setContent((prev) => ({ ...prev, videoStatus: "failed" }));
      throw error;
    } finally {
      setIsGeneratingVideo(false);
    }
  }, [content.imageBase64]);

  const checkVideoStatus = useCallback(async () => {
    if (!content.videoJobId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content?action=video-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ jobId: content.videoJobId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check video status");
      }

      const result = await response.json();

      if (result.status === "completed") {
        // Download the video
        const downloadResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content?action=download-video`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ jobId: content.videoJobId }),
          }
        );

        if (downloadResponse.ok) {
          const downloadResult = await downloadResponse.json();
          setContent((prev) => ({
            ...prev,
            videoBase64: downloadResult.videoBase64,
            videoStatus: "completed",
          }));
        }
      } else if (result.status === "failed") {
        setContent((prev) => ({ ...prev, videoStatus: "failed" }));
      }
    } catch (error) {
      console.error("Error checking video status:", error);
    }
  }, [content.videoJobId]);

  const updateCaption = useCallback((caption: string) => {
    setContent((prev) => ({ ...prev, caption }));
  }, []);

  const reset = useCallback(() => {
    setContent(initialContent);
  }, []);

  return {
    content,
    isGeneratingImage,
    isEditingImage,
    isGeneratingVideo,
    generateImage,
    editImage,
    generateVideo,
    checkVideoStatus,
    updateCaption,
    reset,
  };
}
