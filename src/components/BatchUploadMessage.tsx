import React from "react";
import { Upload, CheckCircle2 } from "lucide-react";
import { cn } from "../utils";
import type { Message, ImageAsset } from "../types";

interface BatchUploadMessageProps {
    message: Message;
    selectedImageIds: Set<string>;
    activeBatchId: string | null;
    onImageToggle: (id: string, batchId: string) => void;
}

export const BatchUploadMessage: React.FC<BatchUploadMessageProps> = ({
    message,
    selectedImageIds,
    activeBatchId,
    onImageToggle,
}) => {
    if (message.type !== "batch-upload") return null;

    return (
        <div
            id={`batch-${message.batchId}`}
            className="flex flex-col gap-3 rounded-2xl p-2 transition-all"
        >
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-400 font-space ml-2">
                <Upload className="w-3 h-3" /> Batch{" "}
                {message.batchId?.substring(0, 18)}... Uploaded
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {message.batchImages?.map((img) => {
                    const isSelected = selectedImageIds.has(img.id);
                    const isOtherBatchActive =
                        activeBatchId && activeBatchId !== message.batchId;

                    return (
                        <div
                            key={img.id}
                            onClick={() => onImageToggle(img.id, message.batchId!)}
                            className={cn(
                                "group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border-2",
                                isSelected
                                    ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-[1.02] z-10"
                                    : "border-white/10 hover:border-white/30",
                                isOtherBatchActive
                                    ? "opacity-30 grayscale hover:grayscale-0 hover:opacity-100"
                                    : "opacity-100"
                            )}
                        >
                            <img
                                src={img.url}
                                alt="upload"
                                className="w-full h-full object-cover"
                            />

                            {/* Selection Indicator */}
                            <div
                                className={cn(
                                    "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all",
                                    isSelected
                                        ? "bg-emerald-600 text-white"
                                        : "bg-black/50 text-white/20"
                                )}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

