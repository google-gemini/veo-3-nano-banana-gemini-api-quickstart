"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { Upload, Film, Image as ImageIcon, Maximize2, RotateCcw, Trash2, Folder, Search, Menu, SlidersHorizontal, X, Sparkles, Layers, Plus, Check } from "lucide-react";
import VideoPlayer from "@/components/ui/VideoPlayer";
import PhotoEditorControls from "@/components/ui/PhotoEditorControls";
import ImageComposerControls from "@/components/ui/ImageComposerControls";
import AlbumComposerControls from "@/components/ui/AlbumComposerControls";
import { ImagePreviewProvider, useImagePreview } from "@/context/ImagePreviewContext";
import Composer from "@/components/ui/Composer"; // Keeping this if it's needed for the sidebar wrapper, though the JSX seems to use specific controls.
import LoginButton from "@/components/auth/LoginButton";
import DynamicHeading from "@/components/ui/DynamicHeading";
import PricingModal from "@/components/ui/PricingModal";
import HelpMenu from "@/components/ui/HelpMenu";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";


type VeoOperationName = string | null;

type StudioMode =
  | "create-image"
  | "edit-image"
  | "compose-image"
  | "compose-album"
  | "create-video";

const POLL_INTERVAL_MS = 5000;

const EMPTY_STATES: Record<StudioMode, { title: string; body: string }> = {
  "create-image": {
    title: "Describe what you want to see",
    body: "Write a prompt below and Photoverse will generate it. Be specific about subject, style and lighting.",
  },
  "edit-image": {
    title: "Upload an image to edit",
    body: "Drop in a photo, then describe the change you want.",
  },
  "compose-image": {
    title: "Blend several images",
    body: "Upload two or more images and describe how they should come together.",
  },
  "compose-album": {
    title: "Build a themed album",
    body: "Choose a theme and add prompts in the side panel to generate a matching set.",
  },
  "create-video": {
    title: "Create a video",
    body: "Video generation is available on premium plans.",
  },
};

interface AlbumItem {
  id: string;
  label: string;
  image: string;
  prompt: string;
  alias?: string;
  originalPrompt?: string;
  selected?: boolean;
}

interface HistoryItem {
  id: string;
  imageUrl: string;
  timestamp: number;
  folderId: string | null;
  prompt?: string;
  mode?: StudioMode;
}

interface SamplePrompt {
  id: string;
  label: string;
  image: string;
  prompt: string;
  alias?: string;
}

interface Folder {
  id: string;
  name: string;
  color: string;
}

const VeoStudioContent: React.FC = () => {
  const { openPreview } = useImagePreview();
  const [mode, setMode] = useState<StudioMode>("create-image");
  const [prompt, setPrompt] = useState(""); // Video or image prompt
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [selectedModel, setSelectedModel] = useState("veo-3.0-generate-001");

  // Ensure selectedModel matches the current mode
  useEffect(() => {
    if (mode === "create-video") {
      if (!selectedModel.includes("veo")) {
        setSelectedModel("veo-3.0-generate-001");
      }
    } else {
      // Image modes
      if (selectedModel.includes("veo")) {
        setSelectedModel("gemini-2.5-flash-image-preview");
      }
    }
  }, [mode, selectedModel]);

  // Image generation prompts
  const [imagePrompt, setImagePrompt] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [composePrompt, setComposePrompt] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [multipleImageFiles, setMultipleImageFiles] = useState<File[]>([]);
  const [imagenBusy, setImagenBusy] = useState(false);
  const [geminiBusy, setGeminiBusy] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); // data URL

  // Album mode state
  const [albumItems, setAlbumItems] = useState<AlbumItem[]>([]);
  const [albumThemeImage, setAlbumThemeImage] = useState<string>("");
  const [albumSourceImage, setAlbumSourceImage] = useState<File | null>(null);
  const [albumImages, setAlbumImages] = useState<string[]>([]);

  const [isGeneratingAlbum, setIsGeneratingAlbum] = useState(false);

  // Selected sample for enhancement context
  const [selectedSample, setSelectedSample] = useState<SamplePrompt | null>(null);

  // History and Folders state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'default', name: 'All Images', color: 'blue' }
  ]);
  const [selectedFolder, setSelectedFolder] = useState<string>('default');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [openFolderDropdown, setOpenFolderDropdown] = useState<string | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState("");

  const [operationName, setOperationName] = useState<VeoOperationName>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoBlobRef = useRef<Blob | null>(null);
  const trimmedBlobRef = useRef<Blob | null>(null);

  const trimmedUrlRef = useRef<string | null>(null);
  const originalVideoUrlRef = useRef<string | null>(null);

  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);



  // Debug multipleImageFiles state
  useEffect(() => {
    console.log(
      "multipleImageFiles state changed:",
      multipleImageFiles.length,
      multipleImageFiles
    );
  }, [multipleImageFiles]);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (imageFile) {
      objectUrl = URL.createObjectURL(imageFile);
      setUploadedImageUrl(objectUrl);
    } else {
      setUploadedImageUrl(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageFile]);

  // Fetch history and folders on mount/login
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        console.log('Fetching history for user:', user?.id);

        if (user) {
          // Fetch folders
          const foldersResp = await fetch('/api/user/folders');
          if (foldersResp.ok) {
            const foldersData = await foldersResp.json();
            console.log('Folders received:', foldersData);
            if (foldersData.folders) {
              setFolders([
                { id: 'default', name: 'All Images', color: 'blue' },
                ...foldersData.folders
              ]);
            }
          }

          // Fetch history
          const resp = await fetch('/api/user/history?limit=50');
          console.log('History API response status:', resp.status);

          if (resp.ok) {
            const data = await resp.json();
            console.log('History data received:', data);

            if (data.history && data.history.length > 0) {
              setHistory(prev => {
                const existingIds = new Set(prev.map(h => h.id));
                const newItems = data.history.filter((h: HistoryItem) => !existingIds.has(h.id));
                const merged = [...newItems, ...prev].sort((a, b) => b.timestamp - a.timestamp);
                console.log('Setting history with', merged.length, 'items');
                return merged;
              });
            } else {
              console.log('No history items found');
            }
          } else {
            console.error('History API failed:', resp.status, resp.statusText);
          }
        } else {
          console.log('No user logged in, skipping history fetch');
        }
      } catch (e) {
        console.error("Failed to fetch history:", e);
      }
    };

    fetchHistory();

    // Listen for auth changes to re-fetch history
    const setupAuthListener = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          fetchHistory();
        } else if (event === 'SIGNED_OUT') {
          setHistory([]);
          setFolders([{ id: 'default', name: 'All Images', color: 'blue' }]);
        }
      });
      return subscription;
    };

    const subPromise = setupAuthListener();
    return () => {
      subPromise.then(sub => sub.unsubscribe());
    };
  }, []);

  // Create folder function
  const createFolder = async (name: string, color: string = 'blue') => {
    try {
      const resp = await fetch('/api/user/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color })
      });

      if (resp.ok) {
        const data = await resp.json();
        setFolders(prev => [...prev, data.folder]);
        return data.folder;
      }
    } catch (e) {
      console.error('Failed to create folder:', e);
    }
  };

  // Assign image to folder function
  const assignImageToFolder = async (imageId: string, folderId: string | null) => {
    try {
      const resp = await fetch('/api/images/folder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, folderId })
      });

      if (resp.ok) {
        // Update local state
        setHistory(prev => prev.map(h =>
          h.id === imageId ? { ...h, folderId } : h
        ));
      }
    } catch (e) {
      console.error('Failed to assign folder:', e);
    }
  };

  // Delete image function
  const deleteImage = async (imageId: string) => {
    try {
      const resp = await fetch('/api/images/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId })
      });

      if (resp.ok) {
        setHistory(prev => prev.filter(h => h.id !== imageId));
        if (generatedImage) {
          // If the deleted image is the one currently displayed, clear it
          // We need to check if the generatedImage URL matches the deleted item's URL
          // But we only have imageId here. The caller should handle UI clearing if needed,
          // or we can find the item in history before deleting to check URL.
          // For simplicity, we'll let the caller handle the UI state update for generatedImage
          // or we can do it here if we pass the URL or check history.
        }
      } else {
        console.error('Failed to delete image:', await resp.text());
      }
    } catch (e) {
      console.error('Failed to delete image:', e);
    }
  };

  const modelLabel = useMemo(() => {
    const cleaned = selectedModel
      .replace(/preview/gi, "")
      .trim();
    return cleaned || selectedModel;
  }, [selectedModel]);

  // Rotating loading messages containing model name
  const loadingMessages = useMemo(() => {
    if (mode === "create-video") {
      return [
        `${modelLabel} is crafting your idea...`,
        "Generating keyframes and motion...",
        "Enhancing detail and lighting...",
        "Color grading and encoding...",
        "Almost there...",
        "One more step...",
        "Kidding, this takes a while...",
        "Haha sorry",
        "Did you know? That Trees are the second most photographed object in the world after the Sun.",
        "That's why we need to make sure your video is perfect.",
        "We're working on it...",
        "Hang on a sec...",
        "Almost done...",
        "One more step...",
        "Kidding, this takes a while...",
        "Haha sorry",
        "So How are you doing?",
        "Crazy what progress can be made in a few seconds?",
        "Let me check on it...",
        "Okay almost done...",
      ];
    }
    return [
      `${modelLabel} is crafting your image...`,
      "Composing layout and subject...",
      "Applying style and color...",
      "Refining edges and textures...",
      "Almost there...",
      "One more step...",
      "Kidding, this takes a while...",
      "Haha sorry",
      "So How are you doing?",
      "Crazy what progress can be made in a few seconds?",
      "Let me check on it...",
      "Okay almost done...",
      "I promise I'm working on it...",
    ];
  }, [mode, modelLabel]);

  const [loadingIndex, setLoadingIndex] = useState(0);

  // Single flag for whether we are actively generating
  const isLoadingUI = useMemo(
    () => isGenerating || imagenBusy || geminiBusy || isGeneratingAlbum,
    [isGenerating, imagenBusy, geminiBusy, isGeneratingAlbum]
  );

  // Advance loading message while any generation is happening
  useEffect(() => {
    if (!isLoadingUI) {
      setLoadingIndex(0);
      return;
    }
    const id = setInterval(() => {
      setLoadingIndex((i) => (i + 1) % loadingMessages.length);
    }, 2200);
    return () => clearInterval(id);
  }, [isLoadingUI, loadingMessages]);

  const canStart = useMemo(() => {
    if (mode === "create-video") {
      if (!prompt.trim()) return false;
      return true;
    } else if (mode === "create-image") {
      return imagePrompt.trim() && !imagenBusy && !geminiBusy;
    } else if (mode === "edit-image") {
      return editPrompt.trim() && (imageFile || generatedImage) && !geminiBusy;
    } else if (mode === "compose-image") {
      const hasExistingImage = imageFile || generatedImage;
      const hasNewImages = multipleImageFiles.length > 0;
      return (
        composePrompt.trim() &&
        (hasExistingImage || hasNewImages) &&
        !geminiBusy
      );
    } else if (mode === "compose-album") {
      return albumThemeImage && albumItems.length > 0 && !!albumSourceImage && !isGeneratingAlbum;
    }
    return false;
  }, [
    mode,
    prompt,
    imageFile,
    generatedImage,
    imagePrompt,
    editPrompt,
    composePrompt,
    multipleImageFiles,
    imagenBusy,
    geminiBusy,
    albumThemeImage,
    albumItems,
    albumSourceImage,
    isGeneratingAlbum
  ]);

  const resetAll = () => {
    setPrompt("");
    setNegativePrompt("");
    setAspectRatio("16:9");
    setImagePrompt("");
    setEditPrompt("");
    setComposePrompt("");
    setImageFile(null);
    setMultipleImageFiles([]);
    setGeneratedImage(null);
    setOperationName(null);
    setIsGenerating(false);
    setVideoUrl(null);
    setImagenBusy(false);
    setGeminiBusy(false);
    setAlbumItems([]);
    setAlbumThemeImage("");
    setAlbumSourceImage(null);
    setAlbumImages([]);
    setAlbumSourceImage(null);
    setAlbumImages([]);
    setIsGeneratingAlbum(false);
    setSelectedSample(null);
    if (videoBlobRef.current) {
      URL.revokeObjectURL(URL.createObjectURL(videoBlobRef.current));
      videoBlobRef.current = null;
    }
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
      trimmedUrlRef.current = null;
    }
    trimmedBlobRef.current = null;
  };

  const saveToGallery = async (dataUrl: string, promptText: string) => {
    try {
      const [meta, b64] = dataUrl.split(",");
      const mime = meta.split(";")[0].replace("data:", "");

      const resp = await fetch('/api/images/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: b64,
          prompt: promptText,
          mimeType: mime
        })
      });

      if (!resp.ok) {
        const json = await resp.json();
        console.error('Save API failed:', json);
        return null;
      }

      const json = await resp.json();
      return json.image;
    } catch (e) {
      console.error('Failed to save to gallery:', e);
      return null;
    }
  };

  // Imagen helper
  const generateWithImagen = useCallback(async () => {
    console.log("Starting Imagen generation");
    setImagenBusy(true);
    setGeneratedImage(null);
    try {
      const resp = await fetch("/api/imagen/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      if (!resp.ok) {
        if (resp.status === 401) throw new Error("Please sign in to start your 14-day free trial with 100 credits!");
        if (resp.status === 403) throw new Error("Insufficient credits.");
        console.error("Imagen API error:", resp.status, resp.statusText);
        throw new Error(`API error: ${resp.status}`);
      }

      const json = await resp.json();
      console.log("Imagen API response:", json);

      if (json?.image?.imageBytes) {
        const dataUrl = `data:${json.image.mimeType};base64,${json.image.imageBytes}`;
        setGeneratedImage(dataUrl);
        const tempId = Date.now().toString();
        setHistory((prev) => [{
          id: tempId,
          imageUrl: dataUrl,
          timestamp: Date.now(),
          folderId: selectedFolder === 'default' ? null : selectedFolder,
          prompt: imagePrompt,
          mode: "create-image"
        }, ...prev]);

        // Save to DB and update ID
        saveToGallery(dataUrl, imagePrompt).then(savedImage => {
          if (savedImage) {
            setHistory(prev => prev.map(item =>
              item.id === tempId ? { ...item, id: savedImage.id } : item
            ));
          }
        });
      } else if (json?.error) {
        console.error("Imagen API returned error:", json.error);
        throw new Error(json.error);
      }
    } catch (e: unknown) {
      console.error("Error in generateWithImagen:", e);
      alert(`Failed to generate image: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      console.log("Resetting Imagen busy state");
      setImagenBusy(false);
    }
  }, [imagePrompt, selectedFolder]);

  // Gemini image generation helper
  const generateWithGemini = useCallback(async () => {
    console.log("Starting Gemini image generation");
    setGeminiBusy(true);
    setGeneratedImage(null);
    try {
      const resp = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt, model: selectedModel }),
      });

      if (!resp.ok) {
        if (resp.status === 401) throw new Error("Please sign in to start your 14-day free trial with 100 credits!");
        if (resp.status === 403) throw new Error("Insufficient credits.");
        console.error("Gemini API error:", resp.status, resp.statusText);
        throw new Error(`API error: ${resp.status}`);
      }

      const json = await resp.json();
      console.log("Gemini API response:", json);

      if (json?.image?.imageBytes) {
        const dataUrl = `data:${json.image.mimeType};base64,${json.image.imageBytes}`;
        setGeneratedImage(dataUrl);
        setHistory((prev) => [{
          id: Date.now().toString(),
          imageUrl: dataUrl,
          timestamp: Date.now(),
          folderId: selectedFolder === 'default' ? null : selectedFolder,
          prompt: imagePrompt,
          mode: "create-image"
        }, ...prev]);

        // Save to DB
        saveToGallery(dataUrl, imagePrompt);
      } else if (json?.error) {
        console.error("Gemini API returned error:", json.error);
        throw new Error(json.error);
      }
    } catch (e: unknown) {
      console.error("Error in generateWithGemini:", e);
      alert(`Failed to generate image: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      console.log("Resetting Gemini busy state");
      setGeminiBusy(false);
    }
  }, [imagePrompt, selectedFolder, selectedModel]);

  // Gemini image edit helper
  const editWithGemini = useCallback(async () => {
    console.log("Starting Gemini image edit");
    setGeminiBusy(true);
    setGeneratedImage(null);
    try {
      const form = new FormData();
      form.append("prompt", editPrompt);
      form.append("model", selectedModel);

      if (imageFile) {
        form.append("imageFile", imageFile);
      } else if (generatedImage) {
        // Handle both data URLs and remote URLs
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const file = new File([blob], "image.png", { type: blob.type || "image/png" });
        form.append("imageFile", file);
      }

      const resp = await fetch("/api/gemini/edit", {
        method: "POST",
        body: form,
      });

      if (!resp.ok) {
        if (resp.status === 401) throw new Error("Please sign in to start your 14-day free trial with 100 credits!");
        if (resp.status === 403) throw new Error("Insufficient credits.");
        console.error("Gemini edit API error:", resp.status, resp.statusText);
        throw new Error(`API error: ${resp.status}`);
      }

      const json = await resp.json();
      console.log("Gemini edit API response:", json);

      if (json?.image?.imageBytes) {
        const dataUrl = `data:${json.image.mimeType};base64,${json.image.imageBytes}`;
        setGeneratedImage(dataUrl);
        const tempId = Date.now().toString();
        setHistory((prev) => [{
          id: tempId,
          imageUrl: dataUrl,
          timestamp: Date.now(),
          folderId: selectedFolder === 'default' ? null : selectedFolder,
          prompt: editPrompt,
          mode: "edit-image"
        }, ...prev]);

        // Save to DB and update ID
        saveToGallery(dataUrl, editPrompt).then(savedImage => {
          if (savedImage) {
            setHistory(prev => prev.map(item =>
              item.id === tempId ? { ...item, id: savedImage.id } : item
            ));
          }
        });
        dispatchCreditUpdate();
      } else if (json?.error) {
        console.error("Gemini edit API returned error:", json.error);
        throw new Error(json.error);
      }
    } catch (e: unknown) {
      console.error("Error in editWithGemini:", e);
      alert(`Failed to edit image: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      console.log("Resetting Gemini busy state after edit");
      setGeminiBusy(false);
    }
  }, [editPrompt, imageFile, generatedImage, selectedFolder, selectedModel]);

  // Gemini image compose helper
  const composeWithGemini = useCallback(async (isRetry = false) => {
    setGeminiBusy(true);
    setGeneratedImage(null);
    try {
      const form = new FormData();

      // Enhance prompt logic
      let finalPrompt = composePrompt;
      try {
        const enhanceResp = await fetch("/api/gemini/enhance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: composePrompt,
            originalPrompt: selectedSample?.prompt || null,
            task: "image_generation"
          }),
        });
        if (enhanceResp.ok) {
          const enhanceJson = await enhanceResp.json();
          if (enhanceJson.enhancedPrompt) {
            finalPrompt = enhanceJson.enhancedPrompt;
            console.log("Enhanced Prompt:", finalPrompt);
          }
        }
      } catch (err) {
        console.error("Enhancement failed, using original prompt", err);
      }

      form.append("prompt", finalPrompt);
      form.append("model", selectedModel);
      console.log("Compose: Prompt:", finalPrompt);

      let fileCount = 0;
      for (const file of multipleImageFiles) {
        form.append("imageFiles", file);
        fileCount++;
      }

      if (imageFile) {
        form.append("imageFiles", imageFile);
        fileCount++;
      } else if (generatedImage) {
        // If retrying and we have uploaded multiple images, do NOT include the currently generated image
        // as it is likely the result of the previous generation.
        // We want to retry with the ORIGINAL sources (the uploaded files).
        // If we don't have uploaded files, we might be composing on top of a generated image, so we keep it.
        if (!isRetry || multipleImageFiles.length === 0) {
          try {
            const response = await fetch(generatedImage);
            const blob = await response.blob();
            const existingImageFile = new File([blob], "existing-image.png", {
              type: blob.type || "image/png",
            });
            form.append("imageFiles", existingImageFile);
            fileCount++;
            console.log("Compose: Added generatedImage from history/url");
          } catch (err) {
            console.error("Compose: Failed to fetch generatedImage:", err);
          }
        }
      }
      console.log("Compose: Total image files:", fileCount);

      const resp = await fetch("/api/gemini/edit", {
        method: "POST",
        body: form,
      });

      if (!resp.ok) {
        if (resp.status === 401) throw new Error("Please sign in to start your 14-day free trial with 100 credits!");
        if (resp.status === 403) throw new Error("Insufficient credits.");
        console.error("Gemini compose API error:", resp.status, resp.statusText);
        throw new Error(`API error: ${resp.status}`);
      }

      const json = await resp.json();
      console.log("Gemini compose API response:", json);

      if (json?.image?.imageBytes) {
        const dataUrl = `data:${json.image.mimeType};base64,${json.image.imageBytes}`;
        setGeneratedImage(dataUrl);
        const tempId = Date.now().toString();
        setHistory((prev) => [{
          id: tempId,
          imageUrl: dataUrl,
          timestamp: Date.now(),
          folderId: selectedFolder === 'default' ? null : selectedFolder,
          prompt: composePrompt,
          mode: "compose-image"
        }, ...prev]);

        // Save to DB and update ID
        saveToGallery(dataUrl, composePrompt).then(savedImage => {
          if (savedImage) {
            setHistory(prev => prev.map(item =>
              item.id === tempId ? { ...item, id: savedImage.id } : item
            ));
          }
        });
        dispatchCreditUpdate();
      } else if (json?.error) {
        console.error("Gemini compose API returned error:", json.error);
        throw new Error(json.error);
      }
    } catch (e: unknown) {
      console.error("Error in composeWithGemini:", e);
      alert(`Failed to compose images: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      console.log("Resetting Gemini busy state after compose");
      setGeminiBusy(false);
    }
  }, [composePrompt, multipleImageFiles, imageFile, generatedImage, selectedFolder, selectedModel, selectedSample]);

  const generateAlbum = useCallback(async () => {
    if (!albumSourceImage || albumItems.length === 0) return;

    setIsGeneratingAlbum(true);
    setAlbumImages([]);

    for (const item of albumItems) {
      if (!item.prompt.trim()) continue;

      try {
        // Enhance prompt for album item
        let finalPrompt = item.prompt;
        // Check if item has originalPrompt (added in AlbumComposerControls)
        // We need to cast item to any or update interface if we want type safety, 
        // but for now we access it dynamically or assume it's there.
        const originalPrompt = item.originalPrompt;

        try {
          const enhanceResp = await fetch("/api/gemini/enhance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: item.prompt,
              originalPrompt: originalPrompt || null,
              task: "album_creation"
            }),
          });
          if (enhanceResp.ok) {
            const enhanceJson = await enhanceResp.json();
            if (enhanceJson.enhancedPrompt) {
              finalPrompt = enhanceJson.enhancedPrompt;
            }
          }
        } catch (err) {
          console.error("Album prompt enhancement failed", err);
        }

        const form = new FormData();
        form.append("prompt", finalPrompt);
        form.append("model", selectedModel);
        form.append("imageFiles", albumSourceImage);

        const resp = await fetch("/api/gemini/edit", {
          method: "POST",
          body: form,
        });

        if (!resp.ok) {
          if (resp.status === 401) throw new Error("Please sign in to start your 14-day free trial with 100 credits!");
          if (resp.status === 403) throw new Error("Insufficient credits.");
          throw new Error(`API error: ${resp.status}`);
        }

        const json = await resp.json();
        if (json?.image?.imageBytes) {
          const dataUrl = `data:${json.image.mimeType};base64,${json.image.imageBytes}`;
          setAlbumImages(prev => [...prev, dataUrl]);
          const tempId = Date.now().toString();
          setHistory((prev) => [{
            id: tempId,
            imageUrl: dataUrl,
            timestamp: Date.now(),
            folderId: selectedFolder === 'default' ? null : selectedFolder,
            prompt: item.prompt,
            mode: "compose-album"
          }, ...prev]);

          // Save to DB and update ID
          saveToGallery(dataUrl, item.prompt).then(savedImage => {
            if (savedImage) {
              setHistory(prev => prev.map(h =>
                h.id === tempId ? { ...h, id: savedImage.id } : h
              ));
            }
          });
          dispatchCreditUpdate();
        }
      } catch (e) {
        console.error("Error generating album image", e);
      }
    }
    setIsGeneratingAlbum(false);
  }, [albumItems, albumSourceImage, selectedFolder, selectedModel]);

  const startGeneration = useCallback(async (isRetry = false) => {
    if (!canStart) return;

    if (mode === "create-video") {
      setIsGenerating(true);
      setVideoUrl(null);

      const form = new FormData();
      form.append("prompt", prompt);
      form.append("model", selectedModel);
      if (negativePrompt) form.append("negativePrompt", negativePrompt);
      if (aspectRatio) form.append("aspectRatio", aspectRatio);

      if (imageFile || generatedImage) {
        if (imageFile) {
          form.append("imageFile", imageFile);
        } else if (generatedImage) {
          const response = await fetch(generatedImage);
          const blob = await response.blob();
          const file = new File([blob], "image.png", { type: blob.type || "image/png" });
          form.append("imageFile", file);
        }
      }

      try {
        const resp = await fetch("/api/veo/generate", {
          method: "POST",
          body: form,
        });

        if (!resp.ok) {
          if (resp.status === 401) throw new Error("Please sign in to start your 14-day free trial with 100 credits!");
          if (resp.status === 403) throw new Error("Insufficient credits.");
          throw new Error(`API error: ${resp.status}`);
        }

        const json = await resp.json();
        setOperationName(json?.name || null);
        if (json?.name) dispatchCreditUpdate();
      } catch (e: unknown) {
        console.error(e);
        setIsGenerating(false);
        alert(e instanceof Error ? e.message : String(e));
      }
    } else if (mode === "create-image") {
      if (selectedModel.includes("imagen")) {
        await generateWithImagen();
      } else {
        await generateWithGemini();
      }
    } else if (mode === "edit-image") {
      await editWithGemini();
    } else if (mode === "compose-image") {
      await composeWithGemini(isRetry);
    } else if (mode === "compose-album") {
      await generateAlbum();
    }
  }, [
    canStart,
    mode,
    prompt,
    selectedModel,
    negativePrompt,
    aspectRatio,
    imageFile,
    generatedImage,
    generateWithImagen,
    generateWithGemini,
    editWithGemini,
    composeWithGemini,
    generateAlbum
  ]);

  // Poll operation until done then download
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function poll() {
      if (!operationName || videoUrl) return;
      try {
        const resp = await fetch("/api/veo/operation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: operationName }),
        });
        const fresh = await resp.json();
        if (fresh?.done) {
          const fileUri = fresh?.response?.generatedVideos?.[0]?.video?.uri;
          if (fileUri) {
            const dl = await fetch("/api/veo/download", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uri: fileUri }),
            });
            const blob = await dl.blob();
            videoBlobRef.current = blob;
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            originalVideoUrlRef.current = url;
          }
          setIsGenerating(false);
          return;
        }
      } catch (e) {
        console.error(e);
        setIsGenerating(false);
      } finally {
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }
    if (operationName && !videoUrl) {
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [operationName, videoUrl]);

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(f);
      setGeneratedImage(null);
    }
  };

  const onPickMultipleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      const limitedFiles = imageFiles.slice(0, 10);
      setMultipleImageFiles((prevFiles) =>
        [...prevFiles, ...limitedFiles].slice(0, 10)
      );
    }
  };

  const handleTrimmedOutput = (blob: Blob) => {
    trimmedBlobRef.current = blob; // likely webm
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
    }
    trimmedUrlRef.current = URL.createObjectURL(blob);
    setVideoUrl(trimmedUrlRef.current);
  };

  const dispatchCreditUpdate = () => {
    window.dispatchEvent(new Event('credits-updated'));
  };

  const handleResetTrimState = () => {
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
      trimmedUrlRef.current = null;
    }
    trimmedBlobRef.current = null;
    if (originalVideoUrlRef.current) {
      setVideoUrl(originalVideoUrlRef.current);
    }
  };

  const downloadVideo = async () => {
    const blob = trimmedBlobRef.current || videoBlobRef.current;
    if (!blob) return;
    const isTrimmed = !!trimmedBlobRef.current;
    const filename = isTrimmed ? "veo3_video_trimmed.webm" : "veo3_video.mp4";
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.setAttribute("download", filename);
    link.setAttribute("rel", "noopener");
    link.target = "_self";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      // Convert base64 data URL to blob
      const response = await fetch(generatedImage);
      const blob = await response.blob();

      // Determine file extension from MIME type
      const mimeType = blob.type || "image/png";
      const extension = mimeType.split("/")[1] || "png";
      const safeModelName = selectedModel.replace(/[^a-zA-Z0-9-]/g, "_");
      const filename = `${safeModelName}.${extension}`;

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.setAttribute("download", filename);
      link.setAttribute("rel", "noopener");
      link.target = "_self";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 0);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  // Drag and drop handlers for compose mode
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    const limitedFiles = imageFiles.slice(0, 10);

    if (limitedFiles.length > 0) {
      if (mode === "compose-image") {
        setMultipleImageFiles((prevFiles) =>
          [...prevFiles, ...limitedFiles].slice(0, 10)
        );
      } else if (mode === "edit-image") {
        setImageFile(limitedFiles[0]);
      }
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesFolder =
      selectedFolder === "default" || item.folderId === selectedFolder;
    const matchesSearch =
      !historySearchQuery ||
      item.prompt?.toLowerCase().includes(historySearchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const hasRightRail =
    mode === "edit-image" ||
    mode === "compose-image" ||
    mode === "compose-album";

  const emptyState = EMPTY_STATES[mode];

  return (
    <div
      className="relative min-h-screen w-full bg-background text-foreground"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Ambient accent wash so the canvas reads as a studio, not flat grey. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_-10%,var(--accent-glow),transparent_70%)]"
      />

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-[var(--z-header)] flex items-center justify-between gap-2 border-b border-border bg-background/75 px-3 py-2 backdrop-blur-xl md:px-6">
        <div className="flex items-center gap-1 md:gap-2">
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
              aria-label="Toggle library"
              className="md:hidden"
            >
              <Menu aria-hidden="true" />
            </Button>
          )}
          <DynamicHeading className="text-xl md:text-2xl" />
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {hasRightRail && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              aria-label="Toggle controls"
              className="md:hidden"
            >
              <SlidersHorizontal aria-hidden="true" />
            </Button>
          )}
          <ThemeToggle />
          <HelpMenu />
          <LoginButton onOpenPricing={() => setIsPricingOpen(true)} />
        </div>
      </header>

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />

      {/* Main canvas */}
      <div
        className={`relative z-[1] flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-72 transition-[padding] duration-300 md:pb-76 ${
          history.length > 0 ? "md:pl-52 lg:pl-64" : ""
        } ${hasRightRail ? "md:pr-80 lg:pr-88" : ""}`}
      >
        {!videoUrl &&
          (isLoadingUI ? (
            <div className="w-full max-w-3xl">
              <Skeleton className="aspect-video w-full rounded-xl">
                <div className="flex flex-col items-center gap-3 px-6 text-center">
                  {mode === "create-video" ? (
                    <Film
                      className="size-10 animate-pulse text-muted-foreground"
                      aria-hidden="true"
                    />
                  ) : (
                    <ImageIcon
                      className="size-10 animate-pulse text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                  <span className="inline-flex items-center rounded-full bg-primary/12 px-3 py-1 font-mono text-xs text-primary">
                    {modelLabel}
                  </span>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    {loadingMessages[loadingIndex % loadingMessages.length]}
                  </p>
                </div>
              </Skeleton>
            </div>
          ) : (
            <div className="w-full max-w-3xl">
              {((mode === "edit-image" && !imageFile && !generatedImage) ||
                (mode === "create-video" && !imageFile && !generatedImage)) && (
                <button
                  type="button"
                  className="group flex w-full flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border bg-card/40 p-10 text-center transition-colors hover:border-primary/50 hover:bg-accent"
                  onClick={() => {
                    const input = document.getElementById(
                      "single-image-input"
                    ) as HTMLInputElement;
                    input?.click();
                  }}
                >
                  <span className="grid size-12 place-items-center rounded-full bg-primary/12 text-primary transition-transform group-hover:scale-105">
                    <Upload className="size-6" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-base font-medium text-foreground">
                      Drop an image here, or click to upload
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      PNG, JPG or WEBP up to 10MB
                    </span>
                  </span>
                </button>
              )}

              {mode === "edit-image" && imageFile && uploadedImageUrl && (
                <div
                  className="group relative mx-auto aspect-video w-full cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-panel"
                  onClick={() => openPreview(uploadedImageUrl)}
                >
                  <Image
                    src={uploadedImageUrl}
                    alt="Uploaded for editing"
                    className="h-full w-full object-contain"
                    width={800}
                    height={450}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                    <Maximize2
                      className="size-8 text-white drop-shadow-lg"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              )}

              {mode === "create-image" && !generatedImage && (
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="grid size-14 place-items-center rounded-2xl bg-primary/12 text-primary">
                    <Sparkles className="size-7" aria-hidden="true" />
                  </span>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {emptyState.title}
                  </h2>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    {emptyState.body}
                  </p>
                </div>
              )}

              {/* Hidden file inputs - always available */}
              <input
                id="single-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickImage}
              />
              <input
                id="multiple-image-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onPickMultipleImages}
              />

              {/* Compose mode upload area - always visible in compose mode */}
              {mode === "compose-image" && (
                <div className="w-full">
                  <div className="mb-6 text-center">
                    <h2 className="text-lg font-semibold tracking-tight">
                      Compose multiple images
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Upload several images to blend them into a single
                      composition.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="group flex w-full flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border bg-card/40 p-10 text-center transition-colors hover:border-primary/50 hover:bg-accent"
                    onClick={() => {
                      const input = document.getElementById(
                        "multiple-image-input"
                      ) as HTMLInputElement;
                      input?.click();
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <span className="grid size-12 place-items-center rounded-full bg-primary/12 text-primary transition-transform group-hover:scale-105">
                      <Upload className="size-6" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-base font-medium text-foreground">
                        Drop images here, or click to upload
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        PNG, JPG or WEBP up to 10MB each, 10 images max
                      </span>
                      {multipleImageFiles.length > 0 && (
                        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success/12 px-2.5 py-1 text-xs font-medium text-success">
                          <Check className="size-3" aria-hidden="true" />
                          {multipleImageFiles.length} image
                          {multipleImageFiles.length > 1 ? "s" : ""} selected
                          {multipleImageFiles.length >= 10 ? " (max)" : ""}
                        </span>
                      )}
                    </span>
                  </button>

                  {multipleImageFiles.length > 0 && (
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      {multipleImageFiles.map((file, index) => (
                        <div
                          key={index}
                          className="size-24 overflow-hidden rounded-lg border border-border shadow-panel"
                          title={file.name}
                        >
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover"
                            width={112}
                            height={112}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

        {/* Album Grid */}
        {mode === "compose-album" && (
          <div className="mt-8 w-full max-w-6xl pb-8">
            {albumImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {albumImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-border bg-card"
                    onClick={() => openPreview(img)}
                  >
                    <Image
                      src={img}
                      alt={`Album image ${idx + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                      <Maximize2
                        className="size-6 text-white drop-shadow-lg"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                ))}
                {isGeneratingAlbum && (
                  <Skeleton className="aspect-square rounded-xl">
                    <span className="text-xs text-muted-foreground">
                      Generating…
                    </span>
                  </Skeleton>
                )}
              </div>
            ) : (
              !isGeneratingAlbum && (
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="grid size-14 place-items-center rounded-2xl bg-mode-album/15 text-mode-album">
                    <Layers className="size-7" aria-hidden="true" />
                  </span>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {emptyState.title}
                  </h2>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    {emptyState.body}
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {generatedImage &&
          !videoUrl &&
          !(mode === "create-video" && isLoadingUI) && (
            <div
              className="group relative mx-auto aspect-video w-full max-w-full cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-elevated md:max-w-3xl lg:max-w-4xl"
              onClick={() => openPreview(generatedImage)}
            >
              <Image
                src={generatedImage}
                alt="Generated result"
                className="h-full w-full object-contain"
                width={800}
                height={450}
              />
              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                <Button
                  variant="glass"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    startGeneration(true);
                  }}
                  disabled={!canStart}
                  aria-label="Retry generation"
                  title="Retry generation"
                >
                  <RotateCcw aria-hidden="true" />
                </Button>
                <Button
                  variant="glass"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPreview(generatedImage);
                  }}
                  aria-label="View fullscreen"
                  title="View fullscreen"
                >
                  <Maximize2 aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
      </div>

      {/* Mobile drawer scrim */}
      {(isLeftSidebarOpen || isRightSidebarOpen) && (
        <div
          className="fixed inset-0 z-[var(--z-scrim)] bg-scrim backdrop-blur-sm md:hidden"
          onClick={() => {
            setIsLeftSidebarOpen(false);
            setIsRightSidebarOpen(false);
          }}
          aria-hidden="true"
        />
      )}

      {/* Left rail: library */}
      {history.length > 0 && (
        <aside
          className={`fixed bottom-0 left-0 top-0 z-[var(--z-popover)] flex w-72 flex-col p-3 transition-transform duration-300 ease-in-out md:bottom-72 md:left-3 md:top-16 md:z-[var(--z-rail)] md:w-48 md:translate-x-0 md:p-0 lg:left-6 lg:top-20 lg:w-56 ${
            isLeftSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label="Image library"
        >
          <Panel className="flex h-full min-h-0 flex-col p-3">
            <div className="mb-3 flex items-center justify-between md:hidden">
              <span className="text-sm font-semibold">Library</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsLeftSidebarOpen(false)}
                aria-label="Close library"
              >
                <X aria-hidden="true" />
              </Button>
            </div>

            <Input
              inputSize="sm"
              icon={<Search aria-hidden="true" />}
              value={historySearchQuery}
              onChange={(e) => setHistorySearchQuery(e.target.value)}
              placeholder="Search history"
              aria-label="Search history"
            />

            {/* Folders */}
            <div className="mt-3 flex flex-col gap-1">
              {folders.map((folder) => {
                const folderItems =
                  folder.id === "default"
                    ? history
                    : history.filter((item) => item.folderId === folder.id);
                const matchingItemsCount = historySearchQuery
                  ? folderItems.filter((item) =>
                      item.prompt
                        ?.toLowerCase()
                        .includes(historySearchQuery.toLowerCase())
                    ).length
                  : folderItems.length;
                const active = selectedFolder === folder.id;

                return (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                      active
                        ? "bg-primary/12 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <span className="truncate">{folder.name}</span>
                    <span className="ml-2 shrink-0 tabular-nums opacity-70">
                      {matchingItemsCount}
                    </span>
                  </button>
                );
              })}

              {isCreatingFolder ? (
                <Input
                  inputSize="sm"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  aria-label="New folder name"
                  autoFocus
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && newFolderName.trim()) {
                      await createFolder(newFolderName);
                      setNewFolderName("");
                      setIsCreatingFolder(false);
                    } else if (e.key === "Escape") {
                      setNewFolderName("");
                      setIsCreatingFolder(false);
                    }
                  }}
                />
              ) : (
                <button
                  onClick={() => setIsCreatingFolder(true)}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  New folder
                </button>
              )}
            </div>

            <div className="mt-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              History
            </div>

            <div className="custom-scrollbar -mr-1 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
              {filteredHistory.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  Nothing here yet.
                </p>
              ) : (
                filteredHistory.map((item) => {
                  const selected = generatedImage === item.imageUrl;
                  return (
                    <div
                      key={item.id}
                      className={`group relative aspect-square w-full shrink-0 cursor-pointer overflow-hidden rounded-lg border transition-all ${
                        selected
                          ? "border-primary ring-2 ring-primary/40"
                          : "border-border hover:border-primary/40"
                      }`}
                      onClick={() => {
                        setGeneratedImage(item.imageUrl);
                        setMode("edit-image");
                        if (item.prompt) {
                          setEditPrompt(item.prompt);
                          setImagePrompt(item.prompt);
                          setComposePrompt(item.prompt);
                        }
                      }}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.prompt || `History item ${item.id}`}
                        fill
                        className="object-cover"
                      />

                      {/* Folder assignment */}
                      <div className="absolute left-1 top-1 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenFolderDropdown(
                              openFolderDropdown === item.id ? null : item.id
                            );
                          }}
                          className="grid size-7 place-items-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-primary group-hover:opacity-100"
                          aria-label="Move to folder"
                          title="Move to folder"
                        >
                          <Folder className="size-3.5" aria-hidden="true" />
                        </button>

                        {openFolderDropdown === item.id && (
                          <div className="absolute left-0 top-9 z-20 min-w-32 overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-elevated">
                            {folders
                              .filter((f) => f.id !== "default")
                              .map((folder) => (
                                <button
                                  key={folder.id}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await assignImageToFolder(
                                      item.id,
                                      folder.id
                                    );
                                    setOpenFolderDropdown(null);
                                  }}
                                  className={`w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-accent ${
                                    item.folderId === folder.id
                                      ? "text-primary"
                                      : "text-foreground"
                                  }`}
                                >
                                  {folder.name}
                                </button>
                              ))}
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await assignImageToFolder(item.id, null);
                                setOpenFolderDropdown(null);
                              }}
                              className={`w-full border-t border-border px-3 py-1.5 text-left text-xs transition-colors hover:bg-accent ${
                                !item.folderId
                                  ? "text-primary"
                                  : "text-foreground"
                              }`}
                            >
                              No folder
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingDeleteId(item.id);
                        }}
                        className="absolute right-1 top-1 z-10 grid size-7 place-items-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-destructive group-hover:opacity-100"
                        aria-label="Delete from history"
                        title="Delete from history"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </Panel>
        </aside>
      )}

      {/* Right rail: mode controls */}
      {hasRightRail && (
        <aside
          className={`fixed bottom-0 right-0 top-0 z-[var(--z-popover)] flex w-80 flex-col p-3 transition-transform duration-300 ease-in-out md:bottom-72 md:right-3 md:top-16 md:z-[var(--z-rail)] md:w-76 md:translate-x-0 md:p-0 lg:right-6 lg:top-20 lg:w-84 ${
            isRightSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
          aria-label="Mode controls"
        >
          <Panel className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-3 py-2 md:hidden">
              <span className="text-sm font-semibold">Controls</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsRightSidebarOpen(false)}
                aria-label="Close controls"
              >
                <X aria-hidden="true" />
              </Button>
            </div>
            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
              {mode === "edit-image" && (
                <PhotoEditorControls
                  onPromptChange={setEditPrompt}
                  onGenerate={startGeneration}
                  isGenerating={isLoadingUI}
                  canGenerate={canStart}
                />
              )}
              {mode === "compose-image" && (
                <ImageComposerControls
                  onPromptChange={setComposePrompt}
                  onGenerate={startGeneration}
                  isGenerating={isLoadingUI}
                  canGenerate={canStart}
                  onSampleSelect={setSelectedSample}
                />
              )}
              {mode === "compose-album" && (
                <AlbumComposerControls
                  onAlbumItemsChange={setAlbumItems}
                  onThemeSelect={setAlbumThemeImage}
                  onSourceImageChange={setAlbumSourceImage}
                  onGenerate={startGeneration}
                  isGenerating={isGeneratingAlbum}
                />
              )}
            </div>
          </Panel>
        </aside>
      )}

      {/* Video result */}
      {videoUrl && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-scrim p-4 backdrop-blur-sm md:p-8">
          <div className="relative w-full max-w-6xl">
            <Button
              variant="glass"
              size="sm"
              onClick={() => setVideoUrl(null)}
              className="absolute -top-11 right-0"
            >
              Close
            </Button>
            <VideoPlayer
              src={videoUrl}
              onOutputChanged={handleTrimmedOutput}
              onDownload={downloadVideo}
              onResetTrim={handleResetTrimState}
            />
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <Modal
        open={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        size="sm"
        title="Delete this image?"
        description="It will be removed from your history. This cannot be undone."
        icon={<Trash2 className="size-5" aria-hidden="true" />}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPendingDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                const id = pendingDeleteId;
                setPendingDeleteId(null);
                if (!id) return;
                const target = history.find((h) => h.id === id);
                await deleteImage(id);
                if (target && generatedImage === target.imageUrl) {
                  setGeneratedImage(null);
                }
              }}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Deleting only affects your library. Any copy you have already
          downloaded is unaffected.
        </p>
      </Modal>

      {/* Composer controls */}
      <Composer
        mode={mode}
        setMode={setMode}
        prompt={prompt}
        setPrompt={setPrompt}
        imagePrompt={imagePrompt}
        setImagePrompt={setImagePrompt}
        startGeneration={startGeneration}
        isGenerating={isLoadingUI}
        canStart={canStart}
        resetAll={resetAll}
        downloadImage={downloadImage}
        hasGeneratedImage={!!generatedImage}
        hasVideoUrl={!!videoUrl}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        editPrompt={editPrompt}
        setEditPrompt={setEditPrompt}
        composePrompt={composePrompt}
        setComposePrompt={setComposePrompt}
        geminiBusy={geminiBusy}
      />
    </div>
  );
};

const VeoStudio = () => {
  return (
    <ImagePreviewProvider>
      <VeoStudioContent />
    </ImagePreviewProvider>
  );
};

export default VeoStudio;
