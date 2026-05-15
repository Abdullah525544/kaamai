import { supabase } from "./supabase";

// Export standard auth helpers that could be used around the app.
export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}
