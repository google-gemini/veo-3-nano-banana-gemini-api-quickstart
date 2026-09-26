import React, { useEffect, useState } from "react";
import { Sun, Contrast, Thermometer, Palette, RotateCcw, Eraser, Image as ImageIcon, Wand2, Sparkles } from "lucide-react";

import { PromptLibrary } from "@/components/ui/PromptLibrary";

interface PhotoEditorControlsProps {
    onPromptChange: (prompt: string) => void;
    className?: string;
    onGenerate?: () => void;
    isGenerating?: boolean;
    canGenerate?: boolean;
}

const STYLES = [
    { value: "none", label: "Original" },
    { value: "cinematic", label: "Cinematic" },
    { value: "vintage", label: "Vintage" },
    { value: "black and white", label: "Black & White" },
    { value: "hdr", label: "HDR" },
    { value: "cyberpunk", label: "Cyberpunk" },
    { value: "pastel", label: "Pastel" },
    { value: "oil painting", label: "Oil Painting" },
    { value: "watercolor", label: "Watercolor" },
];

interface SamplePrompt {
    id: string;
    label: string;
    image: string;
    prompt: string;
    alias?: string;
}

interface PromptGroup {
    id: string;
    label: string;
    items: SamplePrompt[];
}

export default function PhotoEditorControls({
    onPromptChange,
    className = "",
    onGenerate,
    isGenerating = false,
    canGenerate = false,
}: PhotoEditorControlsProps) {
    const [brightness, setBrightness] = useState(0);
    const [contrast, setContrast] = useState(0);
    const [warmth, setWarmth] = useState(0);
    const [style, setStyle] = useState("none");

    // Advanced controls state
    const [backgroundAction, setBackgroundAction] = useState<string | null>(null);
    const [removalAction, setRemovalAction] = useState<string | null>(null);
    const [enhancementAction, setEnhancementAction] = useState<string | null>(null);

    // Face Cleanup state
    const [faceCleanupPrompts, setFaceCleanupPrompts] = useState<SamplePrompt[]>([]);
    const [cleanupAction, setCleanupAction] = useState<string | null>(null);

    // Fetch cleanup prompts
    useEffect(() => {
        fetch("/prompt.json")
            .then(res => res.json())
            .then((data: PromptGroup[]) => {
                const cleanupGroup = data.find(g => g.id === "Face_Cleanup");
                if (cleanupGroup) {
                    setFaceCleanupPrompts(cleanupGroup.items);
                }
            })
            .catch(err => console.error("Failed to load prompts:", err));
    }, []);

    // Generate prompt whenever values change
    useEffect(() => {
        const parts = [];

        // Brightness
        if (brightness !== 0) {
            const intensity = Math.abs(brightness);
            const direction = brightness > 0 ? "increase" : "decrease";
            const adj = intensity > 50 ? "significantly" : "slightly";
            parts.push(`${adj} ${direction} brightness`);
        }

        // Contrast
        if (contrast !== 0) {
            const intensity = Math.abs(contrast);
            const direction = contrast > 0 ? "increase" : "decrease";
            const adj = intensity > 50 ? "significantly" : "slightly";
            parts.push(`${adj} ${direction} contrast`);
        }

        // Warmth
        if (warmth !== 0) {
            const intensity = Math.abs(warmth);
            const direction = warmth > 0 ? "warmer" : "cooler";
            const adj = intensity > 50 ? "much" : "a bit";
            parts.push(`make the image ${adj} ${direction}`);
        }

        // Style
        if (style !== "none") {
            parts.push(`apply a ${style} style`);
        }

        // Background Actions
        if (backgroundAction === "remove") {
            parts.push("remove the background, keep the subject on a white background");
        } else if (backgroundAction === "blur") {
            parts.push("blur the background, shallow depth of field");
        } else if (backgroundAction === "bw") {
            parts.push("make the background black and white, keep the subject in color");
        }

        // Removal Actions
        if (removalAction === "people") {
            parts.push("remove all people from the background");
        } else if (removalAction === "text") {
            parts.push("remove any text or watermarks from the image");
        }

        // Enhancement Actions
        if (enhancementAction === "lighting") {
            parts.push("fix the lighting, make it balanced and professional");
        } else if (enhancementAction === "sharpen") {
            parts.push("make the image high resolution, sharp details, 4k");
        }

        // Face Cleanup Actions
        if (cleanupAction) {
            const selectedCleanup = faceCleanupPrompts.find(p => p.id === cleanupAction);
            if (selectedCleanup) {
                parts.push(selectedCleanup.prompt);
            }
        }

        // Base instruction if nothing selected, or combine parts
        const prompt =
            parts.length > 0
                ? `Edit this image: ${parts.join(", ")}.`
                : "";

        onPromptChange(prompt);
    }, [brightness, contrast, warmth, style, backgroundAction, removalAction, enhancementAction, cleanupAction, faceCleanupPrompts, onPromptChange]);

    const handleReset = () => {
        setBrightness(0);
        setContrast(0);
        setWarmth(0);
        setStyle("none");
        setBackgroundAction(null);
        setRemovalAction(null);
        setEnhancementAction(null);
        setCleanupAction(null);
    };

    return (
        <div
            className={`p-4 text-card-foreground ${className}`}
        >
            <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between border-b border-border bg-card/90 px-4 py-2.5 backdrop-blur-md">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Photo Editor
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        title="Reset all"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <PromptLibrary
                        currentPrompt={""}
                        onSelectPrompt={(text) => onPromptChange(text)}
                    />
                </div>
            </div>

            <div className="space-y-6">
                {/* Basic Adjustments */}
                <div className="space-y-4">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Adjustments</h4>

                    {/* Brightness */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                                <Sun className="w-3.5 h-3.5" />
                                <span>Brightness</span>
                            </div>
                            <span className="tabular-nums text-muted-foreground">{brightness > 0 ? "+" : ""}{brightness}</span>
                        </div>
                        <input
                            type="range"
                            min="-100"
                            max="100"
                            value={brightness}
                            onChange={(e) => setBrightness(parseInt(e.target.value))}
                            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                        />
                    </div>

                    {/* Contrast */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                                <Contrast className="w-3.5 h-3.5" />
                                <span>Contrast</span>
                            </div>
                            <span className="tabular-nums text-muted-foreground">{contrast > 0 ? "+" : ""}{contrast}</span>
                        </div>
                        <input
                            type="range"
                            min="-100"
                            max="100"
                            value={contrast}
                            onChange={(e) => setContrast(parseInt(e.target.value))}
                            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                        />
                    </div>

                    {/* Warmth */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                                <Thermometer className="w-3.5 h-3.5" />
                                <span>Warmth</span>
                            </div>
                            <span className="tabular-nums text-muted-foreground">{warmth > 0 ? "+" : ""}{warmth}</span>
                        </div>
                        <div className="relative h-1.5 w-full rounded-lg bg-gradient-to-r from-mode-edit/70 via-muted to-mode-video/80">
                            <input
                                type="range"
                                min="-100"
                                max="100"
                                value={warmth}
                                onChange={(e) => setWarmth(parseInt(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                                className="pointer-events-none absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow-sm"
                                style={{ left: `${((warmth + 100) / 200) * 100}%`, transform: 'translate(-50%, -50%)' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-border" />

                {/* Advanced Actions */}
                <div className="space-y-4">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Advanced Tools</h4>

                    {/* Background */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs mb-1.5">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Background</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <button
                                onClick={() => setBackgroundAction(backgroundAction === "remove" ? null : "remove")}
                                className={`text-xs py-2 px-3 rounded-md border text-left transition-all ${backgroundAction === "remove" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-secondary-foreground hover:bg-accent"}`}
                            >
                                Remove Background
                            </button>
                            <button
                                onClick={() => setBackgroundAction(backgroundAction === "blur" ? null : "blur")}
                                className={`text-xs py-2 px-3 rounded-md border text-left transition-all ${backgroundAction === "blur" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-secondary-foreground hover:bg-accent"}`}
                            >
                                Blur Background
                            </button>
                            <button
                                onClick={() => setBackgroundAction(backgroundAction === "bw" ? null : "bw")}
                                className={`text-xs py-2 px-3 rounded-md border text-left transition-all ${backgroundAction === "bw" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-secondary-foreground hover:bg-accent"}`}
                            >
                                B&W Background
                            </button>
                        </div>
                    </div>

                    {/* Removal */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs mb-1.5">
                            <Eraser className="w-3.5 h-3.5" />
                            <span>Magic Eraser</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setRemovalAction(removalAction === "people" ? null : "people")}
                                className={`text-xs py-2 px-3 rounded-md border transition-all ${removalAction === "people" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-secondary-foreground hover:bg-accent"}`}
                            >
                                Remove People
                            </button>
                            <button
                                onClick={() => setRemovalAction(removalAction === "text" ? null : "text")}
                                className={`text-xs py-2 px-3 rounded-md border transition-all ${removalAction === "text" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-secondary-foreground hover:bg-accent"}`}
                            >
                                Remove Text
                            </button>
                        </div>
                    </div>

                    {/* Enhancement */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs mb-1.5">
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>Enhance</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setEnhancementAction(enhancementAction === "lighting" ? null : "lighting")}
                                className={`text-xs py-2 px-3 rounded-md border transition-all ${enhancementAction === "lighting" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-secondary-foreground hover:bg-accent"}`}
                            >
                                Fix Lighting
                            </button>
                            <button
                                onClick={() => setEnhancementAction(enhancementAction === "sharpen" ? null : "sharpen")}
                                className={`text-xs py-2 px-3 rounded-md border transition-all ${enhancementAction === "sharpen" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-secondary-foreground hover:bg-accent"}`}
                            >
                                Sharpen / Upscale
                            </button>
                        </div>
                    </div>

                    {/* Face Cleanup */}
                    {faceCleanupPrompts.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-xs mb-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Face Cleanup</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {faceCleanupPrompts.map((prompt) => (
                                    <button
                                        key={prompt.id}
                                        onClick={() => setCleanupAction(cleanupAction === prompt.id ? null : prompt.id)}
                                        className={`text-xs py-2 px-3 rounded-md border transition-all text-left ${cleanupAction === prompt.id
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border bg-secondary text-secondary-foreground hover:bg-accent"
                                            }`}
                                    >
                                        {prompt.alias || prompt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-px bg-border" />

                {/* Style Selector */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs mb-1.5">
                        <Palette className="w-3.5 h-3.5" />
                        <span>Style / Filter</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {STYLES.map((s) => (
                            <button
                                key={s.value}
                                onClick={() => setStyle(s.value)}
                                className={`text-xs py-1.5 px-2 rounded-md border transition-all ${style === s.value
                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "border-border bg-secondary text-secondary-foreground hover:bg-accent"
                                    }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {onGenerate && (
                    <>
                        <div className="h-px bg-border" />
                        <button
                            onClick={onGenerate}
                            disabled={isGenerating || !canGenerate}
                            className={`w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${isGenerating || !canGenerate
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-primary text-primary-foreground shadow-glow hover:brightness-110"
                                }`}
                        >
                            {isGenerating ? (
                                <>Generating...</>
                            ) : (
                                <>
                                    <Wand2 className="w-4 h-4 fill-current" />
                                    Generate Edit
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
