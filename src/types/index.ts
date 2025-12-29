export interface ImageAsset {
    id: string;
    url: string; // Used for display (blob or base64)
    base64: string; // Used for persistence/API
    batchId: string; // Strictly links image to a batch
}

export interface Message {
    id: string;
    type: "user" | "assistant" | "batch-upload";
    text?: string;
    batchId?: string; // The UUID of the batch involved
    batchImages?: ImageAsset[];
    referencedImageIds?: string[];
    analysisResults?: {
        imageId: string;
        answer: string;
        status: "success" | "error";
    }[];
    timestamp: string; // Changed to string for JSON serialization
}
