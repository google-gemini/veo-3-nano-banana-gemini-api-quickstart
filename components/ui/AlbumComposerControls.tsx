import React, { useEffect, useState } from "react";
import { Image as ImageIcon, Maximize2, Plus, Trash2, Play, RotateCcw, Upload, Search } from "lucide-react";
import Image from "next/image";
import { useImagePreview } from "@/context/ImagePreviewContext";

interface AlbumItem {
    id: string;
    label: string;
    image: string;
    prompt: string;
    alias?: string;
    originalPrompt?: string;
    selected?: boolean;
}

interface AlbumSample {
    id: string;
    label: string;
    image: string;
    images: AlbumItem[];
}

interface AlbumComposerControlsProps {
    onAlbumItemsChange: (items: AlbumItem[]) => void;
    onThemeSelect: (themeImage: string) => void;
    onSourceImageChange: (file: File | null) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    className?: string;
}

export default function AlbumComposerControls({
    onAlbumItemsChange,
    onThemeSelect,
    onSourceImageChange,
    onGenerate,
    isGenerating,
    className = "",
}: AlbumComposerControlsProps) {
    const { openPreview } = useImagePreview();
    const [samples, setSamples] = useState<AlbumSample[]>([]);
    const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
    const [items, setItems] = useState<AlbumItem[]>([]);
    const [sourceImage, setSourceImage] = useState<File | null>(null);
    const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch samples on mount
    useEffect(() => {
        fetch("/prompt-album.json")
            .then(res => res.json())
            .then(data => setSamples(data))
            .catch(err => console.error("Failed to load album prompts:", err));
    }, []);

    useEffect(() => {
        onAlbumItemsChange(items.filter(p => p.prompt.trim() !== "" && p.selected !== false));
    }, [items, onAlbumItemsChange]);

    useEffect(() => {
        if (sourceImage) {
            const url = URL.createObjectURL(sourceImage);
            setSourceImageUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setSourceImageUrl(null);
        }
    }, [sourceImage]);

    const handleSampleSelect = (sample: AlbumSample) => {
        if (selectedSampleId === sample.id) {
            setSelectedSampleId(null);
            onThemeSelect("");
            setItems([]);
        } else {
            setSelectedSampleId(sample.id);
            onThemeSelect(sample.image);
            // Load items from the album with selected=true by default
            setItems(sample.images.map(img => ({
                ...img,
                selected: true,
                originalPrompt: img.prompt,
                prompt: img.alias || img.prompt // Use alias for display
            })));
        }
    };

    const handleSourceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSourceImage(file);
            onSourceImageChange(file);
        }
    };

    const handleAddPrompt = () => {
        setItems([...items, { id: Date.now().toString(), label: "Custom", image: "", prompt: "", selected: true }]);
    };

    const handleRemovePrompt = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handlePromptChange = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], prompt: value };
        setItems(newItems);
    };

    const handleSelectionChange = (index: number, checked: boolean) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], selected: checked };
        setItems(newItems);
    };

    const handleReset = () => {
        setSelectedSampleId(null);
        onThemeSelect("");
        setItems([]);
        setSourceImage(null);
        onSourceImageChange(null);
    }

    const handleOpenPreview = (e: React.MouseEvent, image: string) => {
        e.stopPropagation();
        openPreview(image);
    };

    return (
        <div className={`p-4 text-card-foreground ${className}`}>
            <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between border-b border-border bg-card/90 px-4 py-2.5 backdrop-blur-md">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Album Composer
                </h3>
                <button
                    onClick={handleReset}
                    className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    title="Reset all"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Source Image Upload */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs mb-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Source Image (Subject)</span>
                    </div>
                    <div
                        className={`relative aspect-video rounded-lg border-2 border-dashed transition-colors cursor-pointer overflow-hidden ${sourceImage ? "border-primary/60 bg-primary/8" : "border-border hover:border-primary/40 hover:bg-accent"
                            }`}
                        onClick={() => document.getElementById("album-source-upload")?.click()}
                    >
                        {sourceImageUrl ? (
                            <Image
                                src={sourceImageUrl}
                                alt="Source"
                                fill
                                className="object-contain"
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-xs opacity-50 gap-2">
                                <Upload className="w-6 h-6" />
                                <span>Click to upload source image</span>
                            </div>
                        )}
                        <input
                            id="album-source-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleSourceImageUpload}
                        />
                    </div>
                </div>

                <div className="h-px bg-border" />

                {/* Theme Selection */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs mb-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Select Album Style</span>
                    </div>
                    <div className="relative mb-2">
                        <Search className="absolute left-2 top-2 size-3.5 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search styles..."
                            className="w-full rounded-md border border-input bg-background/60 py-1.5 pl-8 pr-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
                        />
                    </div>
                    {samples.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                            {samples
                                .filter(s =>
                                    !searchQuery ||
                                    s.label.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((sample) => (
                                    <div
                                        key={sample.id}
                                        onClick={() => handleSampleSelect(sample)}
                                        className={`relative aspect-square rounded-lg overflow-hidden border cursor-pointer group ${selectedSampleId === sample.id
                                            ? "border-transparent ring-2 ring-primary"
                                            : "border-border hover:border-primary/40"
                                            }`}
                                    >
                                        <Image
                                            src={sample.image}
                                            alt={sample.label}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                            <Maximize2
                                                className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md absolute top-2 right-2"
                                                onClick={(e) => handleOpenPreview(e, sample.image)}
                                            />
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[10px] text-white truncate">
                                            {sample.label}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="text-xs opacity-50">Loading albums...</div>
                    )}
                </div>

                <div className="h-px bg-border" />

                {/* Prompts Input */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Prompts for Album</span>
                        </div>
                        <button
                            onClick={handleAddPrompt}
                            className="flex items-center gap-1 text-primary transition-colors hover:brightness-125"
                        >
                            <Plus className="w-3 h-3" /> Add
                        </button>
                    </div>

                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <div className="pt-2">
                                    <input
                                        type="checkbox"
                                        checked={item.selected !== false}
                                        onChange={(e) => handleSelectionChange(index, e.target.checked)}
                                        className="cursor-pointer"
                                    />
                                </div>
                                {item.image && (
                                    <div className="relative mt-1 size-8 shrink-0 overflow-hidden rounded border border-border">
                                        <Image src={item.image} alt="Style" fill className="object-cover" />
                                    </div>
                                )}
                                <input
                                    type="text"
                                    value={item.prompt}
                                    onChange={(e) => handlePromptChange(index, e.target.value)}
                                    placeholder={`Prompt ${index + 1}...`}
                                    className={`flex-1 rounded-md border border-input bg-background/60 p-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 ${item.selected === false ? "opacity-50" : ""}`}
                                />
                                {items.length > 1 && (
                                    <button
                                        onClick={() => handleRemovePrompt(index)}
                                        className="rounded-md p-2 text-destructive transition-colors hover:bg-destructive/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {items.length === 0 && (
                            <div className="rounded-lg border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
                                Select an album to load prompts
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-px bg-border" />

                <button
                    onClick={onGenerate}
                    disabled={isGenerating || !selectedSampleId || !sourceImage || items.every(p => !p.prompt.trim())}
                    className={`w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${isGenerating || !selectedSampleId || !sourceImage || items.every(p => !p.prompt.trim())
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary text-primary-foreground shadow-glow hover:brightness-110"
                        }`}
                >
                    {isGenerating ? (
                        <>Generating...</>
                    ) : (
                        <>
                            <Play className="w-4 h-4 fill-current" />
                            Generate Album
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
