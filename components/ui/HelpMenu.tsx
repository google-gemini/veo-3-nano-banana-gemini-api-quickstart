"use client";

import React, { useState } from "react";
import { HelpCircle, Phone, Mail, Globe, ExternalLink, Book } from "lucide-react";
import SupportModal from "./SupportModal";
import UserGuideModal from "./UserGuideModal";
import { Modal } from "@/components/ui/modal";
import { Popover, PopoverItem } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const CONTACTS = [
    {
        label: "Mobile",
        value: "+91 9600437108",
        href: "tel:+919600437108",
        icon: Phone,
        tone: "bg-success/12 text-success",
    },
    {
        label: "Email",
        value: "team@aignite.biz",
        href: "mailto:team@aignite.biz",
        icon: Mail,
        tone: "bg-mode-edit/15 text-mode-edit",
    },
    {
        label: "Website",
        value: "aignite.biz",
        href: "https://aignite.biz",
        icon: Globe,
        tone: "bg-mode-create/15 text-mode-create",
        external: true,
    },
];

export default function HelpMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [showSupport, setShowSupport] = useState(false);
    const [showUserGuide, setShowUserGuide] = useState(false);

    return (
        <div className="relative">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Help and support"
                        aria-expanded={isOpen}
                    >
                        <HelpCircle aria-hidden="true" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Help &amp; support</p>
                </TooltipContent>
            </Tooltip>

            <Popover
                open={isOpen}
                onClose={() => setIsOpen(false)}
                align="bottom-right"
                className="w-52 py-1"
            >
                <PopoverItem
                    onClick={() => {
                        setShowSupport(true);
                        setIsOpen(false);
                    }}
                >
                    <ExternalLink className="size-4 text-primary" aria-hidden="true" />
                    Support
                </PopoverItem>
                <PopoverItem
                    onClick={() => {
                        setShowUserGuide(true);
                        setIsOpen(false);
                    }}
                >
                    <Book className="size-4 text-primary" aria-hidden="true" />
                    User guide
                </PopoverItem>
                <PopoverItem
                    onClick={() => {
                        setShowContact(true);
                        setIsOpen(false);
                    }}
                >
                    <Phone className="size-4 text-primary" aria-hidden="true" />
                    Contact us
                </PopoverItem>
            </Popover>

            <Modal
                open={showContact}
                onClose={() => setShowContact(false)}
                size="sm"
                title="Contact us"
                description="We&apos;re here to help."
                icon={<Phone className="size-5" aria-hidden="true" />}
                footer={
                    <p className="text-center text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} AIgnite. All rights reserved.
                    </p>
                }
            >
                <div className="space-y-3">
                    {CONTACTS.map(({ label, value, href, icon: Icon, tone, external }) => (
                        <a
                            key={label}
                            href={href}
                            target={external ? "_blank" : undefined}
                            rel={external ? "noopener noreferrer" : undefined}
                            className="flex items-start gap-4 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-accent"
                        >
                            <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tone}`}>
                                <Icon className="size-5" aria-hidden="true" />
                            </span>
                            <span>
                                <span className="mb-0.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {label}
                                </span>
                                <span className="block font-medium text-foreground">
                                    {value}
                                </span>
                            </span>
                        </a>
                    ))}
                </div>
            </Modal>

            <SupportModal isOpen={showSupport} onClose={() => setShowSupport(false)} />
            <UserGuideModal isOpen={showUserGuide} onClose={() => setShowUserGuide(false)} />
        </div>
    );
}
