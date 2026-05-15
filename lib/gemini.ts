const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEEPSEEK_MODEL = process.env.OPENROUTER_MODEL || "deepseek/deepseek-v4-flash:free";

export const geminiModel = {
    generateContent: async (prompt: string) => {
        const jsonSuffix = "\n\nRespond in valid JSON only. No markdown, no extra text outside JSON.";
        const fullPrompt = prompt.includes(jsonSuffix) ? prompt : prompt + jsonSuffix;

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
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`OpenRouter API error: ${response.status} ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content;

        return {
            response: {
                text: () => text
            }
        };
    }
};
