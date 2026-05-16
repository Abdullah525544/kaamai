"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        // On app load, check for existing session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Session exists — user is already logged in
                // If on auth page, redirect to dashboard
                if (window.location.pathname === "/auth") {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("role")
                        .eq("id", session.user.id)
                        .single();
                    const role = profile?.role || "user";
                    router.push(`/dashboard/${role}`);
                }
            }
        };
        checkSession();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" && session) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", session.user.id)
                    .single();
                const role = profile?.role || "user";
                router.push(`/dashboard/${role}`);
            }
            if (event === "SIGNED_OUT") {
                router.push("/auth");
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    return <>{children}</>;
}
