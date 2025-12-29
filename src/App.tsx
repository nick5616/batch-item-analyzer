import React, { useState, useRef, useEffect } from "react";
import {
    Send,
    Upload,
    CheckCircle2,
    Loader2,
    Settings,
    Trash2,
} from "lucide-react";
import type { Message, ImageAsset } from "./types";
import { cn, generateUUID, convertFileToBase64 } from "./utils";
import { ParticleBackground } from "./components/ParticleBackground";
import { SplashAnimation } from "./components/SplashAnimation";
import { ConfirmModal } from "./components/ConfirmModal";
import { SettingsModal } from "./components/SettingsModal";
import { BatchUploadMessage } from "./components/BatchUploadMessage";
import { UserMessage } from "./components/UserMessage";
import { AssistantMessage } from "./components/AssistantMessage";
import { analyzeImage } from "./services/openai";

// --- Main Application ---
export default function BatchQueryChatbot() {
    // State initialization with Persistence
    const [apiKey, setApiKey] = useState(
        () => localStorage.getItem("openai_api_key") || ""
    );
    const [showSettings, setShowSettings] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [messages, setMessages] = useState<Message[]>(() => {
        const saved = localStorage.getItem("chat_history");
        return saved ? JSON.parse(saved) : [];
    });

    const [inputValue, setInputValue] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [splashTrigger, setSplashTrigger] = useState(0);

    // Selection State
    const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(
        new Set()
    );
    const [activeBatchId, setActiveBatchId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const defaultOptions = [
        "Are the products new?",
        "Are any of the products green?",
        "How many products are there?",
        "Are there any products are in the image?",
    ];

    // --- Effects ---

    // Persist API Key
    useEffect(() => {
        if (apiKey) localStorage.setItem("openai_api_key", apiKey);
        else localStorage.removeItem("openai_api_key");
    }, [apiKey]);

    // Persist Chat History
    useEffect(() => {
        try {
            localStorage.setItem("chat_history", JSON.stringify(messages));
        } catch (e) {
            console.warn("Local storage full, cannot save chat history.");
        }

        // Auto-scroll
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isProcessing]);

    // --- Handlers ---

    const handleClearHistory = () => {
        setShowConfirmModal(true);
    };

    const confirmClearHistory = () => {
        setMessages([]);
        setSelectedImageIds(new Set());
        setActiveBatchId(null);
        localStorage.removeItem("chat_history");
        setShowConfirmModal(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const batchUUID = generateUUID();
            const files = Array.from(e.target.files).slice(0, 4);

            // Process files to Base64 for persistence
            const processedImages: ImageAsset[] = await Promise.all(
                files.map(async (file) => {
                    const base64 = await convertFileToBase64(file);
                    return {
                        id: Math.random().toString(36).substring(7),
                        url: base64, // Use base64 for display to ensure persistence works
                        base64: base64,
                        batchId: batchUUID,
                    };
                })
            );

            // Add Batch Upload Message
            const newMessage: Message = {
                id: Date.now().toString(),
                type: "batch-upload",
                batchId: batchUUID,
                batchImages: processedImages,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, newMessage]);

            // LOGIC FIX: Auto-select NEW batch, Deselect OLD batch
            const newSelection = new Set<string>();
            processedImages.forEach((img) => newSelection.add(img.id));
            setSelectedImageIds(newSelection);
            setActiveBatchId(batchUUID);
        }
    };

    const toggleImageSelection = (id: string, batchId: string) => {
        const newSet = new Set(selectedImageIds);

        // LOGIC FIX: If clicking a different batch, clear everything first
        if (activeBatchId !== batchId) {
            newSet.clear();
            setActiveBatchId(batchId);
        }

        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }

        // If we deselected everything, clear the active batch ID
        if (newSet.size === 0) {
            setActiveBatchId(null);
        }

        setSelectedImageIds(newSet);
    };

    const scrollToBatch = (batchId?: string) => {
        if (!batchId) return;
        const element = document.getElementById(`batch-${batchId}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            // Temporary highlight
            element.style.transition = "all 0.5s";
            element.style.boxShadow = "0 0 30px rgba(16, 185, 129, 0.3)";
            setTimeout(() => {
                element.style.boxShadow = "none";
            }, 1000);
        }
    };

    // --- OpenAI Integration ---
    const handleSend = async () => {
        if (!inputValue.trim() || selectedImageIds.size === 0) return;
        if (!apiKey) {
            setShowSettings(true);
            return;
        }

        const currentQuestion = inputValue;
        const currentBatchId = activeBatchId; // Snapshot the batch ID for the response
        setInputValue("");
        setIsProcessing(true);

        // 1. Identify which images are selected
        const allImages = messages.flatMap((m) => m.batchImages || []);
        const targetImages = allImages.filter((img) =>
            selectedImageIds.has(img.id)
        );

        // 2. Add User Message to UI
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                type: "user",
                text: currentQuestion,
                timestamp: new Date().toISOString(),
                referencedImageIds: Array.from(selectedImageIds),
            },
        ]);

        // 3. Process requests
        try {
            const promises = targetImages.map((img) =>
                analyzeImage(img, currentQuestion, apiKey)
            );

            const results = await Promise.all(promises);

            // 4. Add Assistant Response
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    type: "assistant",
                    batchId: currentBatchId || undefined,
                    referencedImageIds: targetImages.map((t) => t.id),
                    analysisResults: results,
                    timestamp: new Date().toISOString(),
                },
            ]);

            // Trigger splash animation
            setSplashTrigger((prev) => prev + 1);
        } catch (e) {
            console.error("Batch processing failed", e);
        } finally {
            setIsProcessing(false);
        }
    };

    const allImages = messages.flatMap((m) => m.batchImages || []);

    return (
        <div className="relative w-full h-screen overflow-hidden text-slate-100 font-sans selection:bg-emerald-500/30">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Space+Grotesk:wght@400;500;600&display=swap');
        .font-space { font-family: 'Space Grotesk', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}</style>

            {/* Dynamic Background */}
            <ParticleBackground active={isProcessing} />

            {/* Splash Animation */}
            <SplashAnimation trigger={splashTrigger} />

            {/* Header */}
            <header className="absolute top-0 w-full p-6 flex justify-between items-center z-20 bg-gradient-to-b from-slate-900/80 to-transparent">
                <h1 className="font-space text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgb(16,185,129)]" />
                    BatchQuery <span className="text-emerald-500">AI</span>
                </h1>
                <div className="flex gap-2">
                    {messages.length > 0 && (
                        <button
                            onClick={handleClearHistory}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-red-400"
                            title="Clear Chat History"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <Settings className="w-5 h-5 text-slate-300" />
                    </button>
                </div>
            </header>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                title="Clear Chat History"
                message="Are you sure? This will delete all chat history."
                confirmText="Clear"
                cancelText="Cancel"
                onConfirm={confirmClearHistory}
                onCancel={() => setShowConfirmModal(false)}
                clickOffToClose={true}
            />

            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettings}
                apiKey={apiKey}
                onApiKeyChange={setApiKey}
                onClose={() => setShowSettings(false)}
                onDeleteKey={() => {
                    setApiKey("");
                    setShowSettings(false);
                }}
                clickOffToClose={true}
            />

            {/* Main Chat Area */}
            <main
                ref={scrollRef}
                className="relative w-full h-full pt-24 pb-48 px-4 md:px-0 overflow-y-auto z-10 scroll-smooth"
            >
                <div className="max-w-4xl mx-auto space-y-12">
                    {messages.length === 0 && (
                        <div className="text-center mt-20 opacity-50">
                            <p className="font-space text-xl">
                                Upload product images to begin quality
                                assurance.
                            </p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                        >
                            <BatchUploadMessage
                                message={msg}
                                selectedImageIds={selectedImageIds}
                                activeBatchId={activeBatchId}
                                onImageToggle={toggleImageSelection}
                            />
                            <UserMessage message={msg} />
                            <AssistantMessage
                                message={msg}
                                allImages={allImages}
                                onScrollToBatch={scrollToBatch}
                            />
                        </div>
                    ))}

                    {/* Loading State */}
                    {isProcessing && (
                        <div className="flex items-center gap-3 ml-4 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                            </div>
                            <span className="text-slate-400 font-space text-sm">
                                Analyzing visual data...
                            </span>
                        </div>
                    )}
                </div>
            </main>

            {/* Input Area */}
            <div className="absolute bottom-0 w-full p-4 md:p-6 z-30 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-3 px-1">
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "bg-red-500 flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md border transition-all duration-300 flex-shrink-0",
                                    selectedImageIds.size > 0
                                        ? "bg-slate-900/80 border-emerald-500/30"
                                        : "bg-transparent border-transparent"
                                )}
                            >
                                <div className="text-xs font-space text-emerald-400 flex items-center gap-2">
                                    {selectedImageIds.size > 0 ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>
                                                {selectedImageIds.size} image
                                                {selectedImageIds.size !== 1
                                                    ? "s"
                                                    : ""}{" "}
                                                selected
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-slate-500">
                                            Select images above to ask questions
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Input default options */}
                            <div className="flex items-center overflow-x-scroll gap-2 flex-1 min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {defaultOptions.map((option, index) => (
                                    <div
                                        key={index}
                                        className={`flex text-nowrap items-center justify-center text-xs text-slate-400 cursor-pointer transition-colors ${
                                            option === inputValue
                                                ? "bg-emerald-900/20 border-emerald-500/30 text-white hover:bg-emerald-900/20 hover:border-emerald-500/30 hover:text-slate-400"
                                                : "bg-slate-900/60 hover:bg-emerald-900/20 hover:border-emerald-500/30 hover:text-white"
                                        } backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 `}
                                        onClick={() => {
                                            if (inputValue === "") {
                                                setInputValue(option);
                                                inputRef.current?.focus();
                                            } else if (inputValue === option) {
                                                setInputValue("");
                                            } else {
                                                setInputValue(option);
                                                inputRef.current?.focus();
                                            }
                                        }}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                            {selectedImageIds.size > 0 && (
                                <button
                                    onClick={() => {
                                        setSelectedImageIds(new Set());
                                        setActiveBatchId(null);
                                    }}
                                    className="text-xs text-slate-400 hover:text-white transition-colors bg-red-500/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 hover:bg-red-900/20 hover:border-red-500/30 flex-shrink-0"
                                >
                                    Clear selection
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl opacity-50 group-hover:opacity-70 blur transition duration-200"></div>
                        <div
                            className="relative bg-slate-800 rounded-2xl flex items-center p-2 shadow-2xl border border-white/10"
                            onClick={() => {
                                console.log("clicked");
                                inputRef.current?.focus();
                            }}
                        >
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 text-slate-400 hover:text-emerald-400 transition-colors rounded-xl hover:bg-white/5"
                                title="Upload Batch"
                            >
                                <Upload className="w-5 h-5" />
                            </button>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />

                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleSend()
                                }
                                placeholder={
                                    selectedImageIds.size > 0
                                        ? "Ask a question about selected images..."
                                        : "Upload images to start..."
                                }
                                className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 px-4 font-inter outline-none"
                                disabled={isProcessing}
                                ref={inputRef}
                            />

                            <button
                                onClick={handleSend}
                                disabled={
                                    isProcessing ||
                                    selectedImageIds.size === 0 ||
                                    !inputValue.trim()
                                }
                                style={{
                                    backgroundColor:
                                        !inputValue.trim() ||
                                        selectedImageIds.size === 0
                                            ? "rgb(30 41 59)"
                                            : "rgb(5 150 105)",
                                }}
                                className={cn(
                                    "p-3 rounded-xl transition-all duration-200 text-white shadow-lg hover:shadow-emerald-500/20",
                                    !inputValue.trim() ||
                                        selectedImageIds.size === 0
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-[rgb(4_120_87)]"
                                )}
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="text-center mt-3 text-[10px] text-slate-600 font-mono">
                        POWERED BY OPENAI GPT-4o-MINI
                    </div>
                </div>
            </div>
        </div>
    );
}
