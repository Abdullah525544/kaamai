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
    const email = `test+${Date.now()}@example.com`;
    const password = 'password123';

    // sign up
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
    });

    if (authError) {
        console.error('Auth Error:', authError);
        return;
    }

    console.log('Logged in as', authData.user.id);

    // Attempt booking
    const { data, error } = await supabase
        .from("bookings")
        .insert([{
            user_id: authData.user.id,
            worker_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // valid worker from mockWorkers / script
            assigned_worker_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            user_request: 'fix plumbing',
            service: 'plumber',
            required_category: 'plumber',
            location: 'Model Town',
            scheduled_time: 'not specified',
            status: 'pending',
            reasoning: 'He is perfect',
        }])
        .select();

    console.log('Insert Error:', error);
    console.log('Insert Data:', data);
    process.exit(0);
}
testInsert();
