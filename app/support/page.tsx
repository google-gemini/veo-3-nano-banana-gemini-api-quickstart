"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, CheckCircle } from "lucide-react";
import DynamicHeading from "@/components/ui/DynamicHeading";

export default function SupportPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsLoading(false);
        setIsSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-[var(--z-header)] flex items-center justify-between px-6 py-3 bg-background/75 backdrop-blur-md border-b border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="p-2 -ml-2 text-muted-foreground hover:bg-accent rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <DynamicHeading className="text-xl md:text-2xl" />
                </div>
            </div>

            <div className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
                <div className="bg-elevated rounded-2xl shadow-xl border border-border overflow-hidden">
                    <div className="p-8 border-b border-border bg-gradient-to-r from-primary/8 to-transparent">
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Support Center
                        </h1>
                        <p className="text-muted-foreground">
                            Have a question or need help? Send us a message and we&apos;ll get back to you as soon as possible.
                        </p>
                    </div>

                    <div className="p-8">
                        {isSubmitted ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-success/12 rounded-full flex items-center justify-center mx-auto mb-6 text-success">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">
                                    Message Sent!
                                </h2>
                                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                    Thank you for contacting us. We have received your message and will respond to your email shortly.
                                </p>
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="px-6 py-2.5 bg-primary text-primary-foreground hover:brightness-110 font-medium rounded-lg transition-colors"
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium text-foreground">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-input rounded-lg bg-elevated outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-all"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium text-foreground">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-input rounded-lg bg-elevated outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-all"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium text-foreground">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        required
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-input rounded-lg bg-elevated outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-all"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium text-foreground">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={6}
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-input rounded-lg bg-elevated outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-all resize-none"
                                        placeholder="Describe your issue or question..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 px-4 bg-primary text-primary-foreground hover:brightness-110 font-medium rounded-lg shadow-glow transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
