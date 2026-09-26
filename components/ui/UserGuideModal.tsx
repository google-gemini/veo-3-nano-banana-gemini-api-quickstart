"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Book, Monitor, Image as ImageIcon, Layers, Film, CreditCard, Folder, Lightbulb, Keyboard } from "lucide-react";

interface UserGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UserGuideModal({ isOpen, onClose }: UserGuideModalProps) {



    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            size="xl"
            title="User Guide"
            description="Comprehensive guide to Photoverse features"
            icon={<Book className="size-5" aria-hidden="true" />}
            contentClassName="space-y-10 px-6 py-6 md:px-8"
        >
            <div className="space-y-10">

                    {/* Overview */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">Overview</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Photoverse is an AI-powered image generation and editing platform that allows users to create, edit, and compose images using various AI models. The platform features a clean, intuitive interface with a left sidebar for file management and a central workspace for creating and editing content.
                        </p>
                    </section>

                    <hr className="border-border" />

                    {/* Interface Layout */}
                    <section>
                        <div className="flex items-center gap-3 mb-5">
                            <Monitor className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold text-foreground">Main Interface Layout</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-card p-5 rounded-xl border border-border">
                                <h3 className="font-semibold text-base mb-3 text-foreground">Header (Top Bar)</h3>
                                <ul className="space-y-2 text-muted-foreground text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        <span><strong>Photoverse Logo:</strong> Clickable to return to home</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        <span><strong>Credits Display:</strong> Shows your current credit balance</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        <span><strong>User Profile:</strong> Displays username with avatar</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        <span><strong>Sign Out Button:</strong> Located in the top-right corner</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-card p-5 rounded-xl border border-border">
                                <h3 className="font-semibold text-base mb-3 text-foreground">Left Sidebar</h3>
                                <ul className="space-y-2 text-muted-foreground text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        <span><strong>Search Bar:</strong> Field to find previous projects</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        <span><strong>All Images Section:</strong> Shows total number of images</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        <span><strong>Custom Folders:</strong> Create and organize your work</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        <span><strong>History Section:</strong> Thumbnail previews of recent work</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <hr className="border-border" />

                    {/* Main Features */}
                    <section>
                        <div className="flex items-center gap-3 mb-5">
                            <Layers className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold text-foreground">Main Features</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                    1. Create Image
                                </h3>
                                <p className="text-muted-foreground mb-3 text-sm">The primary feature for generating AI images with a detailed prompt.</p>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 text-sm">
                                    <li><strong>AI Model Selector:</strong> Choose between Gemini 2.5 Flash, Nano Banana Pro, or Imagen 4.0 Fast</li>
                                    <li><strong>Prompt Input Area:</strong> Text field to describe the image you want to create</li>
                                    <li><strong>Toolbar Buttons:</strong> Reset, Saved Prompts, Voice Input, Language Selector</li>
                                    <li><strong>Action Buttons:</strong> Create Image button generates your image based on the prompt</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-muted-foreground" />
                                    2. Edit Image
                                </h3>
                                <p className="text-muted-foreground mb-3 text-sm">The photo editor allows adjustment of existing images.</p>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 text-sm">
                                    <li><strong>Upload Area:</strong> Supports PNG, JPG, WEBP (up to 10MB)</li>
                                    <li><strong>Photo Editor Panel:</strong> Brightness, Contrast, and Warmth sliders</li>
                                    <li><strong>Save/Export Options:</strong> Download your edited images</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-muted-foreground" />
                                    3. Compose Image
                                </h3>
                                <p className="text-muted-foreground mb-3 text-sm">Combine multiple images into a single composition.</p>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 text-sm">
                                    <li><strong>Multi-Image Upload:</strong> Up to 10 images, each up to 10MB</li>
                                    <li><strong>Image Composer Panel:</strong> Pre-designed templates, inspiration search</li>
                                    <li><strong>Preview Gallery:</strong> View composition examples</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                                    <Film className="w-4 h-4 text-muted-foreground" />
                                    4. Compose Album
                                </h3>
                                <p className="text-muted-foreground mb-3 text-sm">Create a themed album with multiple variations of images.</p>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 text-sm">
                                    <li><strong>Source Image Upload:</strong> Upload a subject image as reference</li>
                                    <li><strong>Album Composer:</strong> Select from various album themes</li>
                                    <li><strong>Style Previews:</strong> Visual examples of different album compositions</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <hr className="border-border" />

                    {/* Credit System */}
                    <section>
                        <div className="flex items-center gap-3 mb-5">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold text-foreground">Credit System</h2>
                        </div>
                        <p className="text-muted-foreground mb-5 text-sm">
                            Photoverse uses a credit-based system for generating content. Your current credit balance is displayed in the top-right corner of the header.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-card p-5 rounded-xl border border-border">
                                <h3 className="font-semibold mb-3 text-foreground">Image Generation</h3>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex justify-between">
                                        <span className="text-muted-foreground">Gemini 2.5 Flash</span>
                                        <span className="font-medium text-primary">1 credit</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span className="text-muted-foreground">Imagen 4.0 Fast</span>
                                        <span className="font-medium text-primary">2 credits</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span className="text-muted-foreground">Nano Banana Pro</span>
                                        <span className="font-medium text-primary">3 credits</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-card p-5 rounded-xl border border-border">
                                <h3 className="font-semibold mb-3 text-foreground">Video Generation (Premium)</h3>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex justify-between">
                                        <span className="text-muted-foreground">Veo 2</span>
                                        <span className="font-medium text-primary">10 credits</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span className="text-muted-foreground">Veo 3</span>
                                        <span className="font-medium text-primary">25 credits</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <hr className="border-border" />

                    {/* File Management & Prompt Library */}
                    <div className="grid md:grid-cols-2 gap-10">
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Folder className="w-5 h-5 text-primary" />
                                <h2 className="text-xl font-bold text-foreground">File Management</h2>
                            </div>
                            <ul className="space-y-3 text-muted-foreground text-sm">
                                <li><strong>Creating Folders:</strong> Click &quot;+ New Folder&quot; and enter a folder name</li>
                                <li><strong>Browsing History:</strong> View &quot;All Images&quot; or click custom folders to see their contents</li>
                                <li><strong>Search:</strong> Use the search bar to find specific projects</li>
                                <li><strong>Image Actions:</strong> Move images to folders or delete them</li>
                            </ul>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Lightbulb className="w-5 h-5 text-primary" />
                                <h2 className="text-xl font-bold text-foreground">Prompt Library</h2>
                            </div>
                            <ul className="space-y-3 text-muted-foreground text-sm">
                                <li><strong>Save Current Prompt:</strong> Store frequently used prompts</li>
                                <li><strong>Search Prompts:</strong> Find saved prompts quickly</li>
                                <li><strong>Browse Library:</strong> View all saved prompts</li>
                            </ul>
                        </section>
                    </div>

                    <hr className="border-border" />

                    {/* Tips & Shortcuts */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <section className="bg-warning/10 p-6 rounded-xl border border-warning/25">
                            <h2 className="text-lg font-bold text-foreground mb-3">Tips for Best Results</h2>
                            <ul className="space-y-2 text-foreground text-sm list-disc list-inside">
                                <li>Use specific, detailed prompts for better image generation</li>
                                <li>Save frequently used prompts in your Prompt Library</li>
                                <li>Organize images into folders for easy project management</li>
                                <li>Use voice input for hands-free prompt entry</li>
                                <li>Choose models based on your needs and credit balance</li>
                            </ul>
                        </section>

                        <section className="bg-card p-6 rounded-xl border border-border">
                            <div className="flex items-center gap-2 mb-3">
                                <Keyboard className="w-5 h-5 text-muted-foreground" />
                                <h2 className="text-lg font-bold text-foreground">Keyboard Shortcuts</h2>
                            </div>
                            <ul className="space-y-2 text-muted-foreground text-sm">
                                <li className="flex justify-between">
                                    <span>Close modals</span>
                                    <kbd className="px-2 py-0.5 bg-elevated border border-border rounded text-xs font-mono">Esc</kbd>
                                </li>
                                <li className="flex justify-between">
                                    <span>Voice Input</span>
                                    <span className="text-xs text-muted-foreground">Microphone Icon</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Language Selection</span>
                                    <span className="text-xs text-muted-foreground">Globe Icon</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Upload Images</span>
                                    <span className="text-xs text-muted-foreground">Drag & Drop</span>
                                </li>
                            </ul>
                        </section>
                    </div>

            </div>
        </Modal>
    );
}
