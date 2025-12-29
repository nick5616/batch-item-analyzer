import React from "react";
import { Link as LinkIcon } from "lucide-react";
import type { Message } from "../types";

interface UserMessageProps {
    message: Message;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
    if (message.type !== "user") return null;

    return (
        <div className="flex justify-end my-6">
            <div className="bg-emerald-600/20 border border-emerald-500/30 backdrop-blur-md px-6 py-4 rounded-2xl rounded-tr-sm max-w-2xl">
                <p className="font-inter text-lg text-emerald-50">
                    {message.text}
                </p>
                {message.referencedImageIds &&
                    message.referencedImageIds.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-emerald-300/60 font-mono">
                            <LinkIcon className="w-3 h-3" />
                            Referencing {message.referencedImageIds.length}{" "}
                            images
                        </div>
                    )}
            </div>
        </div>
    );
};
