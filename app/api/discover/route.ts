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

        // Step 2: Query BOTH tables and merge results
        // Query 1: workers table (mock data)
        const workersQuery = await supabase
            .from("workers")
            .select("*")
            .eq("available", true)
            .ilike("service_category", `%${service}%`);

        // Query 2: profiles table (real signups)
        const profilesQuery = await supabase
            .from("profiles")
            .select("*")
            .eq("role", "worker")
            .eq("available", true)
            .ilike("service_category", `%${service}%`);

        if (workersQuery.error) throw workersQuery.error;
        if (profilesQuery.error) throw profilesQuery.error;

        // Merge both results
        const allWorkers = [
            ...(workersQuery.data || []),
            ...(profilesQuery.data || [])
        ];

        // Step 3: Apply location filter on merged results
        let items = allWorkers;
        if (searchArea || searchCity) {
            items = items.filter(w =>
                (searchArea && w.area?.toLowerCase().includes(searchArea)) ||
                (searchCity && w.city?.toLowerCase().includes(searchCity))
            );
        }

        // Fallback: if 0 results, return all matching service
        if (items.length === 0) {
            items = allWorkers;
        }

        console.log('[DISCOVERY] Workers table:', workersQuery.data?.length || 0);
        console.log('[DISCOVERY] Profiles table:', profilesQuery.data?.length || 0);
        console.log('[DISCOVERY] Total merged:', items.length);

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
