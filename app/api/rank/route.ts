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

    // Attempt to parse JSON from response
    let jsonString = extractedText.replace(/```json|```/g, "").trim();
    const rankingResult = JSON.parse(jsonString);

    // Ensure we preserve the original worker objects including UUIDs
    if (rankingResult.topWorkers && Array.isArray(rankingResult.topWorkers)) {
      rankingResult.topWorkers = rankingResult.topWorkers
        .filter((tw: any) => tw !== null && typeof tw === 'object') // Filter out nulls
        .map((tw: any) => {
          // Find matching worker from the original list
          const originalWorker = workers.find((w: any) =>
            (w.id === tw.id) ||
            (w.profiles && tw.profiles && w.profiles.name?.toLowerCase() === tw.profiles.name?.toLowerCase()) ||
            (w.profiles && w.profiles.name?.toLowerCase() === tw.name?.toLowerCase()) ||
            (w.name?.toLowerCase() === tw.name?.toLowerCase())
          );

          if (originalWorker) {
            return { ...originalWorker, primaryReason: tw.primaryReason };
          }
          // If not found, we still return tw but log a warning, 
          // though ideally we should only return genuine workers.
          console.warn(`[RANKING AGENT] Could not match worker: ${tw.name || tw.id}`);
          return tw;
        })
        .filter((w: any) => w.id); // Ensure we only return things with an ID
    }

    console.log(`[RANKING AGENT] Top result: ${rankingResult.topWorkers?.[0]?.profiles?.name || rankingResult.topWorkers?.[0]?.name || "None"}`);
    console.log(`[RANKING AGENT] Score: ${rankingResult.confidenceScore}`);

    return NextResponse.json(rankingResult);
  } catch (error: any) {
    console.error("[RANKING AGENT] Error:", error.message || error);
    return NextResponse.json({ error: "Failed to rank workers", detail: error.message }, { status: 500 });
  }
}
