"use client";

import React from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";

interface ImagePreviewModalProps {
    imageUrl: string | null;
    onClose: () => void;
}

export default function ImagePreviewModal({
    imageUrl,
    onClose,
}: ImagePreviewModalProps) {
    return (
        <Modal
            open={!!imageUrl}
            onClose={onClose}
            size="full"
            bare
            className="h-full items-center justify-center"
        >
            {imageUrl ? (
                <div className="relative flex h-full max-h-[85vh] w-full items-center justify-center">
                    <Image
                        src={imageUrl}
                        alt="Full screen preview"
                        fill
                        className="object-contain"
                        sizes="100vw"
                        priority
                    />
                </div>
            ) : null}
        </Modal>
    );
}
