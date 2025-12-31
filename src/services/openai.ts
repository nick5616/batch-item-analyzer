import type { ImageAsset } from "../types";

export interface AnalysisResult {
    imageId: string;
    answer: string;
    status: "success" | "error";
}

export const analyzeImage = async (
    image: ImageAsset,
    question: string,
    apiKey: string
): Promise<AnalysisResult> => {
    try {
        const apiRes = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: question,
                                },
                                {
                                    type: "image_url",
                                    image_url: { url: image.base64 },
                                },
                            ],
                        },
                    ],
                    max_tokens: 300,
                }),
            }
        );

        const data = await apiRes.json();

        // Handle API Errors gracefully
        if (data.error) throw new Error(data.error.message);

        return {
            imageId: image.id,
            answer:
                data.choices?.[0]?.message?.content || "No response generated.",
            status: "success" as const,
        };
    } catch (error) {
        console.error(error);
        return {
            imageId: image.id,
            answer: "Failed to analyze image. Check API Key.",
            status: "error" as const,
        };
    }
};
