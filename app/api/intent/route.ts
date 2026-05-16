import { NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { text } = await req.json();
        console.log(`[INTENT AGENT] Input received: ${text}`);

        const prompt = `Extract service intent from this Pakistani user request: "${text}"
    
    Return JSON only:
    {
      "required_category": "single lowercase word only (e.g. plumber, electrician, carpenter, painter, cleaner, ac technician)",
      "location": "area name like Gulberg, F-10, Model Town",
      "city": "city name like Lahore, Islamabad",
      "scheduledTime": "relative time or specific",
      "urgency": "high/medium/low"
    }`;

        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const extractedText = response.text();

        console.log(`[INTENT AGENT] Raw Response: ${extractedText}`);

        // Robust JSON extraction
        let extractedData;
        try {
            // Find the first { and last } to extract JSON block if model wrapped it in text
            const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : extractedText;
            extractedData = JSON.parse(jsonString);
        } catch (parseError) {
            console.error("[INTENT AGENT] JSON Parse Error. Raw text:", extractedText);
            throw new Error("Failed to parse AI response");
        }

        console.log(`[INTENT AGENT] Extracted Data: ${JSON.stringify(extractedData)}`);
        return NextResponse.json(extractedData);
    } catch (error: any) {
        console.error("[INTENT AGENT] Critical Error:", error.message || error);
        return NextResponse.json({ error: "Failed to process intent", detail: error.message }, { status: 500 });
    }
}
