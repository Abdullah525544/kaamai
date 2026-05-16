const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEEPSEEK_MODEL = process.env.OPENROUTER_MODEL || "deepseek/deepseek-v4-flash:free";

export const geminiModel = {
    generateContent: async (prompt: string) => {
        const jsonSuffix = "\n\nRespond in valid JSON only. No markdown, no extra text outside JSON.";
        const fullPrompt = prompt.includes(jsonSuffix) ? prompt : prompt + jsonSuffix;

        console.log(`[GEMINI LIB] Sending request to OpenRouter. Model: ${DEEPSEEK_MODEL}`);
        if (!OPENROUTER_API_KEY) {
            console.error("[GEMINI LIB] Missing OPENROUTER_API_KEY");
            throw new Error("AI configuration error: Missing API Key");
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: DEEPSEEK_MODEL,
                    messages: [
                        { role: "user", content: fullPrompt }
                    ],
                    response_format: { type: "json_object" }
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("[GEMINI LIB] OpenRouter Error:", response.status, errorData);
                throw new Error(`OpenRouter API error: ${response.status}`);
            }

            const data = await response.json();
            const text = data.choices[0].message.content;
            console.log("[GEMINI LIB] Received response successfully");

            return {
                response: {
                    text: () => text
                }
            };
        } catch (error: any) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.error("[GEMINI LIB] Request timed out after 15s");
                throw new Error("AI request timed out. OpenRouter may be overloaded.");
            }
            console.error("[GEMINI LIB] Unexpected error:", error.message || error);
            throw error;
        }
    }
};
