import React, { useState } from "react";
import { Book, Trash2, Plus, X, Check, Search } from "lucide-react";
import { Popover } from "@/components/ui/popover";
import { usePromptLibrary } from "@/hooks/usePromptLibrary";

interface PromptLibraryProps {
    onSelectPrompt: (text: string) => void;
    currentPrompt: string;
}

export const PromptLibrary: React.FC<PromptLibraryProps> = ({
    onSelectPrompt,
    currentPrompt,
}) => {
    const { savedPrompts, savePrompt, deletePrompt } = usePromptLibrary();
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newPromptName, setNewPromptName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const handleSave = () => {
        if (!newPromptName.trim() || !currentPrompt.trim()) return;
        savePrompt(currentPrompt, newPromptName);
        setNewPromptName("");
        setIsSaving(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors ${isOpen ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                title="Saved Prompts"
            >
                <Book className="w-5 h-5" />
            </button>

            <Popover
                open={isOpen}
                onClose={() => setIsOpen(false)}
                align="top-left"
                className="w-80"
            >
                    <div className="flex max-h-96 flex-col">
                        <div className="p-3 border-b border-border bg-card flex items-center justify-between">
                            <h3 className="font-medium text-sm text-foreground">
                                Prompt Library
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-3 border-b border-border space-y-2">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-2 top-1.5 w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search prompts..."
                                    className="w-full pl-7 pr-2 py-1 text-xs border rounded bg-card border-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            </div>

                            {isSaving ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newPromptName}
                                        onChange={(e) => setNewPromptName(e.target.value)}
                                        placeholder="Name this prompt..."
                                        className="flex-1 px-2 py-1 text-sm border rounded bg-muted border-border"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSave();
                                            if (e.key === 'Escape') setIsSaving(false);
                                        }}
                                    />
                                    <button
                                        onClick={handleSave}
                                        disabled={!newPromptName.trim()}
                                        className="p-1.5 bg-success text-success-foreground rounded hover:brightness-110 disabled:opacity-50"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setIsSaving(false)}
                                        className="p-1.5 bg-muted text-muted-foreground rounded hover:bg-accent"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsSaving(true)}
                                    disabled={!currentPrompt.trim()}
                                    className="w-full flex items-center justify-center gap-2 py-1.5 text-sm bg-primary/10 text-primary rounded hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Save Current Prompt
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {savedPrompts
                                .filter(p =>
                                    !searchQuery ||
                                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    p.text.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-xs">
                                    {searchQuery ? "No matching prompts found." : "No saved prompts yet."}
                                </div>
                            ) : (
                                savedPrompts
                                    .filter(p =>
                                        !searchQuery ||
                                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        p.text.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((prompt) => (
                                        <div
                                            key={prompt.id}
                                            className="group flex items-start gap-2 p-2 rounded hover:bg-accent transition-colors"
                                        >
                                            <button
                                                onClick={() => {
                                                    onSelectPrompt(prompt.text);
                                                    setIsOpen(false);
                                                }}
                                                className="flex-1 text-left"
                                            >
                                                <div className="font-medium text-sm text-foreground">
                                                    {prompt.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                    {prompt.text}
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => deletePrompt(prompt.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
            </Popover>
        </div>
    );
};
