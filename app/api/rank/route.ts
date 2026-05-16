import { NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { workers, userRequest, extractedIntent } = await req.json();
    console.log(`[RANKING AGENT] Evaluating ${workers.length} workers`);

    const prompt = `You are an AI agent ranking service workers for a Pakistani user. 
   
    User request: "${userRequest}"
    Extracted Intent: "${JSON.stringify(extractedIntent)}"
    Available workers: ${JSON.stringify(workers)}
   
    Analyze each worker by rating, availability, location, and skills.
    Select the Top 3 best workers. 
    Provide:
    1. A list of top 3 ranked workers.
    2. 3-4 specific bullet points explaining why the #1 worker was selected.
    3. Brief reasons why others (ranked #2 and #3) were ranked lower than #1.
    4. A confidence score out of 100 for the selection.
   
    Return JSON only:
    {
      "topWorkers": [{worker object with an additional field "primaryReason": "One short reason for ranking"}],
      "reasoning": {
        "selectedReasons": ["Point 1", "Point 2", "Point 3"],
        "othersLowerReasons": ["Reason for #2 being lower", "Reason for #3 being lower"]
      },
      "confidenceScore": 94
    }`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const extractedText = response.text();

    console.log(`[RANKING AGENT] Raw Response: ${extractedText}`);

    // Robust JSON extraction
    let rankingResult;
    try {
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : extractedText;
      rankingResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("[RANKING AGENT] JSON Parse Error. Raw text:", extractedText);
      throw new Error("Failed to parse AI ranking response");
    }

    // Ensure we preserve the original worker objects including UUIDs
    // Fallback: if ranking resulted in no valid workers but we had input workers,
    // use a subset of input workers as fallback
    if ((!rankingResult.topWorkers || rankingResult.topWorkers.length === 0) && workers.length > 0) {
      console.warn("[RANKING AGENT] No workers matched, using input list as fallback");
      rankingResult.topWorkers = workers.slice(0, 3).map((w: any) => ({ ...w, primaryReason: "Available Match" }));
      if (!rankingResult.reasoning) {
        rankingResult.reasoning = {
          selectedReasons: ["AI selected best available matches for your request."],
          othersLowerReasons: []
        };
      }
      rankingResult.confidenceScore = rankingResult.confidenceScore || 50;
    }

    console.log(`[RANKING AGENT] Final results count: ${rankingResult.topWorkers?.length || 0}`);
    return NextResponse.json(rankingResult);
  } catch (error: any) {
    console.error("[RANKING AGENT] Error:", error.message || error);
    return NextResponse.json({ error: "Failed to rank workers", detail: error.message }, { status: 500 });
  }
}
