"use client";

import React from "react";
import {
  RotateCcw,
  Image as ImageIcon,
  Edit,
  Palette,
  Video,
  Download,
  Sparkles,
  Lock,
  Loader2,
} from "lucide-react";
import ModelSelector from "@/components/ui/ModelSelector";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PromptLibrary } from "@/components/ui/PromptLibrary";
import VoiceInput from "@/components/ui/VoiceInput";
import { Button } from "@/components/ui/button";
import { Segmented, type SegmentedOption } from "@/components/ui/segmented";

type StudioMode =
  | "create-image"
  | "edit-image"
  | "compose-image"
  | "compose-album"
  | "create-video";

interface ComposerProps {
  mode: StudioMode;
  setMode: (mode: StudioMode) => void;
  hasGeneratedImage?: boolean;
  hasVideoUrl?: boolean;

  prompt: string;
  setPrompt: (value: string) => void;

  selectedModel: string;
  setSelectedModel: (model: string) => void;

  canStart: boolean;
  isGenerating: boolean;
  startGeneration: () => void;

  imagePrompt: string;
  setImagePrompt: (value: string) => void;
  editPrompt: string;
  setEditPrompt: (value: string) => void;
  composePrompt: string;
  setComposePrompt: (value: string) => void;

  geminiBusy: boolean;

  resetAll: () => void;
  downloadImage: () => void;
}

const PLACEHOLDERS: Record<StudioMode, string> = {
  "create-image": "Describe the image you want to create...",
  "edit-image": "Describe how to edit this image...",
  "compose-image": "Describe how to combine these images...",
  "compose-album": "Pick a theme and add prompts in the side panel.",
  "create-video": "Generate a video from text and frames...",
};

const ACTION_LABEL: Record<StudioMode, string> = {
  "create-image": "Generate",
  "edit-image": "Apply Edit",
  "compose-image": "Compose",
  "compose-album": "Generate Album",
  "create-video": "Generate Video",
};

const Composer: React.FC<ComposerProps> = ({
  mode,
  setMode,
  hasGeneratedImage = false,
  hasVideoUrl = false,
  prompt,
  setPrompt,
  selectedModel,
  setSelectedModel,
  canStart,
  isGenerating,
  startGeneration,

  imagePrompt,
  setImagePrompt,
  editPrompt,
  setEditPrompt,
  composePrompt,
  setComposePrompt,
  geminiBusy,
  resetAll,
  downloadImage,
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      startGeneration();
    }
  };

  const isTabDisabled = (tabMode: StudioMode) => {
    // When video is generated, disable all tabs
    if (hasVideoUrl) {
      return true;
    }

    // When image is generated, disable create-image tab but allow others
    if (hasGeneratedImage && tabMode === "create-image") {
      return true;
    }

    return false;
  };

  const getTabTooltip = (tabMode: StudioMode) => {
    if (hasVideoUrl) {
      return "Reset to create new content";
    }

    if (hasGeneratedImage && tabMode === "create-image") {
      return "Use edit, compose, or video modes with existing image";
    }

    return undefined;
  };

  // The album panel drives its own prompts, so there is no text field there.
  const showTextarea = mode !== "compose-album";

  const currentPrompt =
    mode === "create-image"
      ? imagePrompt
      : mode === "edit-image"
        ? editPrompt
        : mode === "compose-image"
          ? composePrompt
          : prompt;

  const setCurrentPrompt = (value: string) => {
    if (mode === "create-image") setImagePrompt(value);
    else if (mode === "edit-image") setEditPrompt(value);
    else if (mode === "compose-image") setComposePrompt(value);
    else setPrompt(value);
  };

  // Grow the field with its content, up to a sensible ceiling.
  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [currentPrompt, mode]);

  const busy = isGenerating || geminiBusy;

  const modeOptions: SegmentedOption<StudioMode>[] = [
    {
      value: "create-image",
      label: "Create",
      icon: <ImageIcon aria-hidden="true" />,
      accent: "var(--mode-create)",
      disabled: isTabDisabled("create-image"),
      tooltip: getTabTooltip("create-image") ?? "Create Image",
    },
    {
      value: "edit-image",
      label: "Edit",
      icon: <Edit aria-hidden="true" />,
      accent: "var(--mode-edit)",
      disabled: isTabDisabled("edit-image"),
      tooltip: getTabTooltip("edit-image") ?? "Edit Image",
    },
    {
      value: "compose-image",
      label: "Compose",
      icon: <Palette aria-hidden="true" />,
      accent: "var(--mode-compose)",
      disabled: isTabDisabled("compose-image"),
      tooltip: getTabTooltip("compose-image") ?? "Compose Image",
    },
    {
      value: "compose-album",
      label: "Album",
      icon: <ImageIcon aria-hidden="true" />,
      accent: "var(--mode-album)",
      disabled: isTabDisabled("compose-album"),
      tooltip: getTabTooltip("compose-album") ?? "Compose Album",
    },
    {
      value: "create-video",
      label: "Video",
      icon: <Video aria-hidden="true" />,
      accent: "var(--mode-video)",
      disabled: true,
      tooltip: "Create Video (Premium only)",
      trailing: <Lock className="ml-0.5 size-3" aria-hidden="true" />,
    },
  ];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[var(--z-composer)] flex justify-center px-2 pb-2 md:px-4 md:pb-4 lg:pb-6">
      <div className="pointer-events-auto relative w-full max-w-3xl">
        {hasGeneratedImage && !hasVideoUrl && (
          <div className="absolute -top-14 right-0">
            <Button variant="glass" size="md" onClick={downloadImage}>
              <Download aria-hidden="true" />
              <span>Download</span>
            </Button>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card/95 p-3 shadow-elevated backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between gap-2">
            <ModelSelector
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              mode={mode}
            />
          </div>

          {showTextarea ? (
            <textarea
              ref={textareaRef}
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={PLACEHOLDERS[mode]}
              aria-label="Prompt"
              rows={2}
              className="w-full resize-none bg-transparent px-1 py-1 text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
          ) : (
            <p className="px-1 py-3 text-sm text-muted-foreground">
              {PLACEHOLDERS["compose-album"]}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetAll}
                    aria-label="Reset everything"
                  >
                    <RotateCcw aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset</p>
                </TooltipContent>
              </Tooltip>

              <PromptLibrary
                currentPrompt={currentPrompt}
                onSelectPrompt={setCurrentPrompt}
              />

              <VoiceInput
                onTranscript={(text) =>
                  setCurrentPrompt(
                    currentPrompt ? currentPrompt + " " + text : text
                  )
                }
              />
            </div>

            {/* The primary action: unmistakably enabled or disabled. */}
            <Button
              variant="primary"
              onClick={startGeneration}
              disabled={!canStart || busy}
              className="gap-2 rounded-full px-5"
              title={ACTION_LABEL[mode]}
            >
              {busy ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles aria-hidden="true" />
              )}
              <span className="hidden sm:inline">
                {busy ? "Working" : ACTION_LABEL[mode]}
              </span>
            </Button>
          </div>

          <Segmented
            aria-label="Studio mode"
            options={modeOptions}
            value={mode}
            onChange={setMode}
            className="mt-3"
          />
        </div>
      </div>
    </div>
  );
};

export default Composer;
