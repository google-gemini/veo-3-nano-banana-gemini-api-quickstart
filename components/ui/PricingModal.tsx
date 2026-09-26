"use client";

import React, { useState } from "react";
import { Check, CreditCard, Loader2, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe outside component to avoid recreation
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null;

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Pricing tiers
const PRICING_TIERS = [
    { credits: 100, price: 2, label: "Starter", popular: false },
    { credits: 300, price: 5, label: "Basic", popular: true },
    { credits: 500, price: 7, label: "Pro", popular: false },
    { credits: 1000, price: 10, label: "Premium", popular: false },
];

// Calculate price for custom amount based on tiers
function calculatePrice(credits: number): number {
    if (credits <= 0) return 0;

    // Find the appropriate tier or interpolate
    if (credits <= 100) return (credits / 100) * 2;
    if (credits <= 300) return 2 + ((credits - 100) / 200) * 3;
    if (credits <= 500) return 5 + ((credits - 300) / 200) * 2;
    if (credits <= 1000) return 7 + ((credits - 500) / 500) * 3;

    // Above 1000, use the best rate
    return 10 + ((credits - 1000) / 100);
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
    const [loading, setLoading] = useState(false);
    const [selectedTier, setSelectedTier] = useState<number | null>(1); // Default to Basic (300 credits)
    const [customCredits, setCustomCredits] = useState("");
    const [showCustom, setShowCustom] = useState(false);

    const handlePurchase = async (credits: number, amount: number) => {
        if (!stripePromise) {
            alert("Stripe is not configured. Please contact support.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    credits,
                    amount: Math.round(amount * 100), // Convert to cents
                }),
            });

            const { sessionId, error } = await response.json();

            if (error) {
                console.error("Checkout error:", error);
                alert("Failed to start checkout. Please try again.");
                setLoading(false);
                return;
            }

            const stripe = await stripePromise;
            if (stripe) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error: stripeError } = await (stripe as any).redirectToCheckout({ sessionId });
                if (stripeError) {
                    console.error("Stripe redirect error:", stripeError);
                    alert(stripeError.message);
                }
            }
        } catch (err) {
            console.error("Purchase failed:", err);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleTierPurchase = (tierIndex: number) => {
        const tier = PRICING_TIERS[tierIndex];
        handlePurchase(tier.credits, tier.price);
    };

    const handleCustomPurchase = () => {
        const credits = parseInt(customCredits);
        if (isNaN(credits) || credits < 10) {
            alert("Please enter at least 10 credits.");
            return;
        }
        const price = calculatePrice(credits);
        handlePurchase(credits, price);
    };

    const customPrice = customCredits ? calculatePrice(parseInt(customCredits) || 0) : 0;

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            size="lg"
            title="Credits & Pricing"
            description="Top up your balance and view usage rates"
            icon={<CreditCard className="size-5" aria-hidden="true" />}
        >
            <div>
                {/* Content */}
                <div>
                    {/* Pricing Tiers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {PRICING_TIERS.map((tier, index) => (
                            <div
                                key={index}
                                onClick={() => {
                                    setSelectedTier(index);
                                    setShowCustom(false);
                                }}
                                className={`relative group border-2 rounded-xl p-4 transition-all cursor-pointer ${selectedTier === index && !showCustom
                                    ? "border-primary bg-primary/8"
                                    : "border-border hover:border-primary/50"
                                    }`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        Best Value
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground">
                                            {tier.credits} Credits
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            {tier.label}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-foreground">
                                            ${tier.price.toFixed(2)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            ${(tier.price / tier.credits * 100).toFixed(2)}/100 credits
                                        </div>
                                    </div>
                                </div>

                                <ul className="space-y-1.5">
                                    <li className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        <span>~{tier.credits} standard images</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        <span>~{Math.floor(tier.credits / 10)} short videos</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        <span>Credits never expire</span>
                                    </li>
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Custom Amount Section */}
                    <div className="mb-6">
                        <button
                            onClick={() => {
                                setShowCustom(!showCustom);
                                setSelectedTier(null);
                            }}
                            className="w-full text-left border-2 border-dashed border-input rounded-xl p-4 hover:border-primary/60 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-foreground">
                                        Custom Amount
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Enter your desired credit amount
                                    </p>
                                </div>
                                <div className="text-primary font-medium">
                                    {showCustom ? "Hide" : "Show"}
                                </div>
                            </div>
                        </button>

                        {showCustom && (
                            <div className="mt-4 p-4 border border-border rounded-xl bg-muted/50">
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Number of Credits (min: 10)
                                </label>
                                <input
                                    type="number"
                                    min="10"
                                    value={customCredits}
                                    onChange={(e) => setCustomCredits(e.target.value)}
                                    placeholder="Enter amount..."
                                    className="w-full px-4 py-2.5 border border-input rounded-lg bg-elevated text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                {customCredits && parseInt(customCredits) >= 10 && (
                                    <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-foreground">
                                                Calculated Price:
                                            </span>
                                            <span className="text-lg font-bold text-primary">
                                                ${customPrice.toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Rate: ${(customPrice / parseInt(customCredits) * 100).toFixed(2)}/100 credits
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Purchase Button */}
                    <button
                        onClick={() => {
                            if (showCustom) {
                                handleCustomPurchase();
                            } else if (selectedTier !== null) {
                                handleTierPurchase(selectedTier);
                            }
                        }}
                        disabled={loading || (showCustom && (!customCredits || parseInt(customCredits) < 10)) || (!showCustom && selectedTier === null)}
                        className="w-full py-3 px-4 bg-primary text-primary-foreground hover:brightness-110 font-medium rounded-lg shadow-glow transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Purchase {showCustom ? `${customCredits} Credits` : selectedTier !== null ? `${PRICING_TIERS[selectedTier].credits} Credits` : ""}
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-muted-foreground mt-4">
                        Secure payment via Stripe. Credits never expire.
                    </p>

                    {/* Credit Usage Rates */}
                    <div className="mt-8 pt-6 border-t border-border">
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Credit Usage Rates
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Image Generation</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-foreground p-2 rounded-lg bg-card">
                                        <span>Gemini Flash 2.5</span>
                                        <span className="font-medium">1 credit</span>
                                    </div>
                                    <div className="flex justify-between text-foreground p-2 rounded-lg bg-card">
                                        <span>Imagen 4.0</span>
                                        <span className="font-medium">2 credits</span>
                                    </div>
                                    <div className="flex justify-between text-foreground p-2 rounded-lg bg-card">
                                        <span>Nano Banana Pro</span>
                                        <span className="font-medium">3 credits</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Video Generation</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-foreground p-2 rounded-lg bg-card">
                                        <span>Veo 2</span>
                                        <span className="font-medium">10 credits</span>
                                    </div>
                                    <div className="flex justify-between text-foreground p-2 rounded-lg bg-card">
                                        <span>Veo 3</span>
                                        <span className="font-medium">25 credits</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
