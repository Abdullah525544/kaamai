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

async function inspectWorkers() {
    console.log("Checking workers table...");
    const { data, error } = await supabase
        .from('workers')
        .select('*');

    if (error) {
        console.error('Error fetching workers:', error);
    } else {
        console.log(`Found ${data?.length || 0} workers:`);
        data?.forEach(w => {
            console.log(`- ${w.name}: ${w.service_category} in ${w.area}, ${w.city} (Available: ${w.available})`);
        });
    }
}

inspectWorkers();
