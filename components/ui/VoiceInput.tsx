"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Globe } from "lucide-react";
import { Popover } from "@/components/ui/popover";

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    className?: string;
}

const LANGUAGES = [
    { code: "en-US", label: "English (US)" },
    { code: "en-IN", label: "English (India)" },
    { code: "hi-IN", label: "हिन्दी (Hindi)" },
    { code: "ta-IN", label: "தமிழ் (Tamil)" },
    { code: "te-IN", label: "తెలుగు (Telugu)" },
    { code: "bn-IN", label: "বাংলা (Bengali)" },
    { code: "ml-IN", label: "മലയാളം (Malayalam)" },
    { code: "kn-IN", label: "ಕನ்ನಡ (Kannada)" },
    { code: "mr-IN", label: " मराठी (Marathi)" },
    { code: "gu-IN", label: "ગુજરાતી (Gujarati)" },
];

export default function VoiceInput({ onTranscript, className = "" }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
    const [showLanguages, setShowLanguages] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Check if browser supports Web Speech API
        if (typeof window !== "undefined") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = selectedLanguage;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recognitionRef.current.onresult = (event: any) => {
                    let interim = "";
                    let final = "";

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            final += transcript + " ";
                        } else {
                            interim += transcript;
                        }
                    }

                    if (final) {
                        onTranscript(final.trim());
                        setInterimTranscript("");
                    } else {
                        setInterimTranscript(interim);
                    }
                };

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech recognition error:", event.error);
                    setIsListening(false);
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                    setInterimTranscript("");
                };
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [selectedLanguage, onTranscript]);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.lang = selectedLanguage;
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    return (
        <div className={`relative flex items-center gap-1 ${className}`}>
            {/* Microphone Button */}
            <button
                onClick={toggleListening}
                className={`relative h-10 w-10 flex items-center justify-center rounded-full transition-all ${isListening
                        ? "bg-destructive text-destructive-foreground animate-pulse"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                title={isListening ? "Stop listening" : "Start voice input"}
            >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}

                {/* Recording Indicator */}
                {isListening && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                    </span>
                )}
            </button>

            {/* Language Selector */}
            <div className="relative">
                <button
                    onClick={() => setShowLanguages(!showLanguages)}
                    className="h-10 w-10 flex items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    title="Select language"
                >
                    <Globe className="w-5 h-5" />
                </button>

                <Popover
                    open={showLanguages}
                    onClose={() => setShowLanguages(false)}
                    align="top-right"
                    className="w-56"
                >
                        <div className="custom-scrollbar max-h-80 overflow-y-auto">
                            <div className="p-2 border-b border-border bg-card">
                                <h4 className="text-xs font-medium text-foreground">
                                    Voice Language
                                </h4>
                            </div>
                            <div className="p-1">
                                {LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setSelectedLanguage(lang.code);
                                            setShowLanguages(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${selectedLanguage === lang.code
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-accent text-foreground"
                                            }`}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                </Popover>
            </div>

            {/* Interim Transcript Tooltip */}
            {interimTranscript && (
                <div className="absolute bottom-12 left-0 z-[var(--z-popover)] bg-foreground text-background text-xs px-3 py-2 rounded-lg shadow-elevated max-w-xs">
                    {interimTranscript}
                </div>
            )}
        </div>
    );
}
