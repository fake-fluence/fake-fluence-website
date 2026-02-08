import { useState, useCallback } from "react";

interface GeneratedContent {
  imageBase64: string | null;
  caption: string;
  prompt: string;
}

interface UseContentGenerationReturn {
  content: GeneratedContent;
  isGeneratingImage: boolean;
  isEditingImage: boolean;
  generateImage: (prompt: string) => Promise<void>;
  editImage: (editPrompt: string) => Promise<void>;
  updateCaption: (caption: string) => void;
  reset: () => void;
}

const initialContent: GeneratedContent = {
  imageBase64: null,
  caption: "",
  prompt: "",
};

export function useContentGeneration(): UseContentGenerationReturn {
  const [content, setContent] = useState<GeneratedContent>(initialContent);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);

  const generateImage = useCallback(async (prompt: string) => {
    setIsGeneratingImage(true);
    try {
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
    generateImage,
    editImage,
    updateCaption,
    reset,
  };
}
