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

        // Attempt to parse JSON from response (handling potential markdown blocks)
        let jsonString = extractedText.replace(/```json|```/g, "").trim();
        const extractedData = JSON.parse(jsonString);

        console.log(`[INTENT AGENT] Extracted: ${JSON.stringify(extractedData)}`);

        return NextResponse.json(extractedData);
    } catch (error) {
        console.error("[INTENT AGENT] Error:", error);
        return NextResponse.json({ error: "Failed to process intent" }, { status: 500 });
    }
}
