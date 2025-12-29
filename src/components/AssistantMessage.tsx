import React from "react";
import { ArrowUpRight, AlertCircle } from "lucide-react";
import type { Message, ImageAsset } from "../types";

interface AssistantMessageProps {
    message: Message;
    allImages: ImageAsset[];
    onScrollToBatch: (batchId?: string) => void;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
    message,
    allImages,
    onScrollToBatch,
}) => {
    if (message.type !== "assistant") return null;

    return (
        <div className="flex flex-col gap-4 my-6">
            {/* The Sleek Green Link Header */}
            {message.batchId && (
                <button
                    onClick={() => onScrollToBatch(message.batchId)}
                    className="flex items-center gap-3 w-fit group"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <span className="font-space font-bold text-xs">AI</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-900/20 group-hover:bg-emerald-900/40 transition-colors">
                        <span className="text-xs text-emerald-400 font-mono">
                            BATCH {message.batchId.substring(0, 8)}...
                        </span>
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    </div>
                </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2 md:ml-11">
                {message.analysisResults?.map((result, i) => {
                    const originalImg = allImages.find(
                        (img) => img.id === result.imageId
                    );

                    if (!originalImg) return null;

                    return (
                        <div
                            key={i}
                            className="bg-slate-800/40 border border-white/5 backdrop-blur-md rounded-xl overflow-hidden hover:bg-slate-800/60 transition-colors"
                        >
                            <div className="h-32 relative overflow-hidden border-b border-white/5 bg-slate-900/50">
                                <img
                                    src={originalImg.url}
                                    className="w-full h-full object-cover opacity-80"
                                    alt="context"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60" />
                            </div>
                            <div className="p-4">
                                <p className="font-inter text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                                    {result.status === "error" ? (
                                        <span className="text-red-400 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />{" "}
                                            {result.answer}
                                        </span>
                                    ) : (
                                        result.answer
                                    )}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
