import { supabase } from "./supabase";

// Check for existing session — used on app load to skip login if user is already authenticated.
export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

// Listen for auth state changes — call this once in root layout/provider.
export function onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
}
