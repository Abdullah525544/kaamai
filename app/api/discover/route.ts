import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const { intent } = await req.json();
        const { required_category, location, city } = intent;

        // Step 1: Clean and lowercase the service keyword
        const service = (required_category || "").toLowerCase().trim();
        const searchCity = (city || "").toLowerCase().trim();
        const searchArea = (location || "").toLowerCase().trim();

        console.log('Searching for:', service, searchCity, searchArea);

        // Step 2: Query for workers with flexible matching
        // Using workers table as it now contains the mock data
        let query = supabase
            .from("workers")
            .select("*")
            .eq("available", true)
            .ilike("service_category", `%${service}%`);

        // If location/city provided, add filters
        if (searchArea) {
            query = query.ilike("area", `%${searchArea}%`);
        }
        if (searchCity) {
            query = query.ilike("city", `%${searchCity}%`);
        }

        let { data: items, error } = await query;
        if (error) throw error;

        // Step 4: Tiered fallback - search by service only if no location match
        if ((!items || items.length === 0) && (searchArea || searchCity)) {
            console.log(`[DISCOVERY] No workers in ${searchArea || searchCity}, broadening to service only`);
            const fallbackQuery = await supabase
                .from("workers")
                .select("*")
                .eq("available", true)
                .ilike("service_category", `%${service}%`);

            if (fallbackQuery.error) throw fallbackQuery.error;
            items = fallbackQuery.data;
        }

        console.log('Results found:', items?.length || 0);

        if (!items || items.length === 0) {
            return NextResponse.json({
                success: true,
                workers: [],
                message: "Koi worker nahi mila",
                count: 0
            });
        }

        return NextResponse.json({
            success: true,
            workers: items,
            count: items.length,
        });
    } catch (error: any) {
        console.error("[DISCOVERY] Detailed Error:", error);
        return NextResponse.json({ error: "Failed to discover workers", detail: String(error), stack: error?.stack }, { status: 500 });
    }
}
