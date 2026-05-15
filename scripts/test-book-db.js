const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
    const { data, error } = await supabase
        .from("bookings")
        .insert([{
            worker_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            assigned_worker_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            user_request: 'plumber chaiye',
            service: 'plumber',
            required_category: 'plumber',
            location: 'Gulberg',
            scheduled_time: 'tomorow',
            status: 'pending',
            reasoning: 'test',
        }]).select();

    console.log(error || data);
}
testInsert();
