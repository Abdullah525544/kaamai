import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkWorkers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'worker');

    if (error) {
        console.error('Error fetching workers:', error);
    } else {
        console.log('Found workers:', JSON.stringify(data, null, 2));
    }
}

checkWorkers();
