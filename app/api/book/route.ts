import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { selectedWorker, userRequest, reasoning, extractedIntent } = body;

        if (!selectedWorker?.id) {
            console.error("[BOOKING AGENT] Error: Missing worker ID", selectedWorker);
            return NextResponse.json({ error: "Missing worker ID" }, { status: 400 });
        }

        console.log(`[BOOKING AGENT] Creating booking for ${selectedWorker.name || selectedWorker.id}`);

        const insertData = {
            worker_id: selectedWorker.id,
            assigned_worker_id: selectedWorker.id, // Fallback to same ID, though logic may vary
            user_request: userRequest,
            service: extractedIntent?.required_category || "Service",
            required_category: extractedIntent?.required_category,
            location: extractedIntent?.location,
            scheduled_time: extractedIntent?.scheduledTime,
            status: 'pending',
            reasoning: reasoning,
        };

        const { data, error } = await supabase
            .from("bookings")
            .insert([insertData])
            .select();

        if (error) {
            console.error("[BOOKING AGENT] Supabase Insert Error:", error);
            throw error;
        }

        const bookingId = data[0].id;
        console.log(`[BOOKING AGENT] Booking #${bookingId} created successfully`);

        return NextResponse.json({
            success: true,
            bookingId: bookingId,
            message: "Booking confirmed",
        });
    } catch (error: any) {
        console.error("[BOOKING AGENT] Error:", error.message || error);
        return NextResponse.json({
            error: "Failed to create booking",
            detail: error.message,
            hint: "Check server logs for Supabase Insert Error"
        }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { bookingId } = await req.json();
        console.log(`[BOOKING AGENT] Deleting booking #${bookingId}`);

        const { error } = await supabase
            .from("bookings")
            .delete()
            .eq("id", bookingId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Booking deleted" });
    } catch (error: any) {
        console.error("[BOOKING AGENT] Delete Error:", error.message || error);
        return NextResponse.json({ error: "Failed to delete booking", detail: error.message }, { status: 500 });
    }
}
